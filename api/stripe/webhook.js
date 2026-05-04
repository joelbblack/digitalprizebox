// POST /api/stripe/webhook
// Receives Stripe webhook events and credits kids.green_balance after a parent
// completes Checkout. Verifies the signature using STRIPE_WEBHOOK_SECRET.
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

// Disable Vercel's automatic JSON parsing — Stripe needs the exact raw bytes
// to verify the signature. Reparsing JSON would corrupt the byte sequence.
module.exports.config = {
  api: { bodyParser: false },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  const rawBody = await readRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true, ignored: event.type });
  }

  const session = event.data.object;
  const meta = session.metadata || {};
  if (meta.type !== "green_load") {
    return res.status(200).json({ received: true, ignored: "non-green-load session" });
  }

  const kidId = meta.kidId;
  const amountCents = parseInt(meta.amountCents, 10);
  const paymentIntentId = session.payment_intent;

  if (!kidId || !amountCents || !paymentIntentId) {
    console.error("Missing fields in session metadata:", { kidId, amountCents, paymentIntentId });
    return res.status(400).json({ error: "Missing required fields in session" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Idempotency: Stripe re-delivers on 5xx. Skip if this payment was already credited.
  const { data: existing } = await supabase
    .from("green_transactions")
    .select("id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (existing) {
    return res.status(200).json({ received: true, idempotent: true });
  }

  // Look up kid to get parent_id (NOT NULL on green_transactions) and current balance
  const { data: kid, error: kidErr } = await supabase
    .from("kids")
    .select("id, parent_id, green_balance")
    .eq("id", kidId)
    .single();

  if (kidErr || !kid) {
    console.error("Kid not found:", kidId, kidErr);
    return res.status(404).json({ error: "Kid not found" });
  }
  if (!kid.parent_id) {
    console.error("Kid has no parent_id:", kidId);
    return res.status(400).json({ error: "Kid has no parent_id" });
  }

  // Record the transaction (acts as the idempotency key on retry)
  const { error: txErr } = await supabase.from("green_transactions").insert({
    kid_id: kidId,
    parent_id: kid.parent_id,
    type: "load",
    stripe_payment_intent_id: paymentIntentId,
    amount_cents: amountCents,
    status: "complete",
  });

  if (txErr) {
    console.error("green_transactions insert failed:", txErr);
    return res.status(500).json({ error: "Failed to record transaction" });
  }

  // Increment the kid's balance
  const { error: balErr } = await supabase
    .from("kids")
    .update({ green_balance: kid.green_balance + amountCents })
    .eq("id", kidId);

  if (balErr) {
    // Roll back the tx so Stripe's next retry can re-attempt cleanly
    console.error("kids.green_balance update failed, rolling back tx:", balErr);
    await supabase
      .from("green_transactions")
      .delete()
      .eq("stripe_payment_intent_id", paymentIntentId);
    return res.status(500).json({ error: "Failed to update balance" });
  }

  return res.status(200).json({ received: true, credited: amountCents });
};

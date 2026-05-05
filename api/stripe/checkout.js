// POST /api/stripe/checkout
// Creates a Stripe Checkout Session so a parent can load green dollars for their kid.
// Body: { kidId, kidName, amountCents }
// Headers: Authorization: Bearer <supabase access token>
// Returns: { url } — frontend redirects the parent here.
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { kidId, kidName, amountCents } = req.body || {};

  if (!kidId || !amountCents) {
    return res.status(400).json({ error: "Missing kidId or amountCents" });
  }
  if (typeof amountCents !== "number" || amountCents < 100 || amountCents > 50000) {
    return res.status(400).json({ error: "Amount must be between $1 and $500" });
  }

  // Verify caller owns the kid before creating a Stripe session
  const authHeader = req.headers.authorization || "";
  const token      = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing auth token" });

  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data: authData, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !authData?.user) {
    return res.status(401).json({ error: "Invalid auth token" });
  }

  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authData.user.id)
    .single();
  if (userErr || !userRow) return res.status(401).json({ error: "User profile not found" });

  const { data: kid, error: kidErr } = await supabase
    .from("kids")
    .select("id, parent_id")
    .eq("id", kidId)
    .single();
  if (kidErr || !kid)               return res.status(404).json({ error: "Kid not found" });
  if (kid.parent_id !== userRow.id) return res.status(403).json({ error: "Not your kid" });

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.origin || "https://digitalprizebox.com";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Green dollars for ${kidName || "your child"}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        kidId,
        amountCents: String(amountCents),
        type: "green_load",
      },
      success_url: `${origin}/parent?load=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/parent?load=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ error: err.message });
  }
};

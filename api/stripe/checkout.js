// POST /api/stripe/checkout
// Creates a Stripe Checkout Session so a parent can load green dollars for their kid.
// Body: { kidId, kidName, amountCents }
// Returns: { url } — frontend redirects the parent here.
const Stripe = require("stripe");

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

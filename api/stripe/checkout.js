// POST /api/stripe/checkout
// Creates a Stripe Checkout Session so a parent (or accepted family-circle
// member) can load green dollars for a kid.
// Body:    { kidId, kidName, amountCents, returnPath? }
// Headers: Authorization: Bearer <supabase access token>
// Returns: { url } — frontend redirects the caller here.
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const ALLOWED_RETURN_PATHS = new Set(["/parent", "/family"]);

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { kidId, kidName, amountCents, returnPath } = req.body || {};

  if (!kidId || !amountCents) {
    return res.status(400).json({ error: "Missing kidId or amountCents" });
  }
  if (typeof amountCents !== "number" || amountCents < 100 || amountCents > 50000) {
    return res.status(400).json({ error: "Amount must be between $1 and $500" });
  }

  const safeReturnPath = ALLOWED_RETURN_PATHS.has(returnPath) ? returnPath : "/parent";

  // Verify caller owns the kid (as parent OR accepted family member)
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
  const callerAuthId = authData.user.id;

  const { data: kid, error: kidErr } = await supabase
    .from("kids")
    .select("id, parent_id")
    .eq("id", kidId)
    .single();
  if (kidErr || !kid) return res.status(404).json({ error: "Kid not found" });

  // Path 1: caller is the kid's parent
  let role = null;
  let loadedByUserId = null;
  const { data: userRow } = await supabase
    .from("users")
    .select("id, display_name")
    .eq("auth_id", callerAuthId)
    .single();
  if (userRow && kid.parent_id === userRow.id) {
    role           = "parent";
    loadedByUserId = userRow.id;
  } else {
    // Path 2: caller is an accepted family-circle member of this kid
    const { data: famRow } = await supabase
      .from("kid_family_members")
      .select("id, member_name, invite_status")
      .eq("kid_id", kidId)
      .eq("auth_id", callerAuthId)
      .eq("invite_status", "accepted")
      .maybeSingle();
    if (famRow) {
      role           = "family";
      loadedByUserId = userRow?.id || null;
    }
  }

  if (!role) return res.status(403).json({ error: "Not authorized to load funds for this kid" });

  const callerName = userRow?.display_name || "A family member";

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
        type:           "green_load",
        loadedByRole:   role,
        loadedByUserId: loadedByUserId || "",
        loadedByName:   callerName,
      },
      success_url: `${origin}${safeReturnPath}?load=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}${safeReturnPath}?load=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ error: err.message });
  }
};

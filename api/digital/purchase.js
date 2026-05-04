// POST /api/digital/purchase — Purchase a digital gift card code
// Future: calls Tango Card RaaS API to generate a real code
// For now: validates request and returns a placeholder response
const { createClient } = require("@supabase/supabase-js");

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY // service key for server-side writes
  );
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { kidId, kidName, itemId, recipientEmail } = req.body || {};
  if (!kidId || !itemId) {
    return res.status(400).json({ error: "Missing kidId or itemId" });
  }

  // TODO: Once Tango Card keys are available:
  // 1. Verify kid has enough green balance
  // 2. Call Tango RaaS API to purchase code
  // 3. Deduct green balance
  // 4. Log in green_transactions table
  // 5. Return the code/delivery confirmation

  // Placeholder response until Tango integration is live
  return res.status(503).json({
    error: "Digital code purchases are coming soon! Tango Card integration is being set up.",
    status: "not_ready",
  });
};

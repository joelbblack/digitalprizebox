// POST /api/wishlist/contribute — Contribute orange bucks to a jar
const { createClient } = require("@supabase/supabase-js");

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { kidId, jarId, currency, amount } = req.body || {};
  if (!kidId || !jarId || !amount || amount <= 0) {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  // Only orange contributions for now (green goes through Stripe flow)
  if (currency !== "orange") {
    return res.status(400).json({ error: "Only orange contributions supported currently" });
  }

  const supabase = getSupabase();

  // Fetch kid balance
  const { data: kid, error: kidErr } = await supabase
    .from("kids").select("orange_balance").eq("id", kidId).single();
  if (kidErr || !kid) return res.status(404).json({ error: "Kid not found" });
  if (kid.orange_balance < amount) {
    return res.status(400).json({ error: "Not enough orange bucks" });
  }

  // Fetch jar
  const { data: jar, error: jarErr } = await supabase
    .from("jars").select("orange_confirmed, orange_required, status")
    .eq("id", jarId).single();
  if (jarErr || !jar) return res.status(404).json({ error: "Jar not found" });
  if (jar.status !== "saving") {
    return res.status(400).json({ error: "Jar is no longer accepting contributions" });
  }

  const newConfirmed = (jar.orange_confirmed || 0) + amount;
  const newBalance = kid.orange_balance - amount;

  // Update kid balance
  const { error: balErr } = await supabase
    .from("kids").update({ orange_balance: newBalance }).eq("id", kidId);
  if (balErr) return res.status(500).json({ error: "Failed to update balance" });

  // Update jar
  const updates = { orange_confirmed: newConfirmed };
  if (newConfirmed >= jar.orange_required) {
    updates.status = "unlocked";
    updates.unlocked_at = new Date().toISOString();
  }
  const { error: jarUpdateErr } = await supabase
    .from("jars").update(updates).eq("id", jarId);
  if (jarUpdateErr) return res.status(500).json({ error: "Failed to update jar" });

  return res.status(200).json({
    success: true,
    jar_unlocked: newConfirmed >= jar.orange_required,
    new_balance: newBalance,
    jar_progress: newConfirmed,
  });
};

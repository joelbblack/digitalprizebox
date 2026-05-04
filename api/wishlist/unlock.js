// POST /api/wishlist/unlock — Request to unlock a jar (kid signals they're ready)
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

  const { kidId, kidName, jarId, item, amazonUrl } = req.body || {};
  if (!kidId || !jarId) {
    return res.status(400).json({ error: "Missing kidId or jarId" });
  }

  const supabase = getSupabase();

  // Verify jar is unlocked
  const { data: jar, error: jarErr } = await supabase
    .from("jars").select("status, orange_confirmed, orange_required")
    .eq("id", jarId).single();
  if (jarErr || !jar) return res.status(404).json({ error: "Jar not found" });

  if (jar.orange_confirmed < jar.orange_required) {
    return res.status(400).json({ error: "Jar is not fully funded yet" });
  }

  // Mark as unlocked if not already
  if (jar.status === "saving") {
    await supabase.from("jars").update({
      status: "unlocked",
      unlocked_at: new Date().toISOString(),
    }).eq("id", jarId);
  }

  // Create a notification for the parent
  const { data: kid } = await supabase
    .from("kids").select("parent_id").eq("id", kidId).single();

  if (kid?.parent_id) {
    await supabase.from("notifications").insert({
      user_id: kid.parent_id,
      kid_id: kidId,
      type: "jar_unlocked",
      title: `${kidName || "Your kid"} unlocked a wishlist prize!`,
      body: item?.name ? `Ready to buy: ${item.name}` : "A wishlist jar has been unlocked.",
      data: { jarId, amazonUrl, itemName: item?.name },
    });
  }

  return res.status(200).json({ success: true, status: "unlocked" });
};

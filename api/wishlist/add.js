// POST /api/wishlist/add — Add an item to a kid's wishlist (creates a jar)
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

  const { kidId, item } = req.body || {};
  if (!kidId || !item || !item.name) {
    return res.status(400).json({ error: "Missing kidId or item data" });
  }

  const supabase = getSupabase();

  // Calculate orange_required: price in cents / 5 (roughly $1 = 20 orange bucks)
  const priceCents = item.price_cents || item.priceCents || 0;
  const orangeRequired = Math.max(50, Math.round(priceCents / 5));

  const { data, error } = await supabase.from("jars").insert({
    kid_id: kidId,
    product_name: item.name,
    product_emoji: item.emoji || "⭐",
    product_desc: item.desc || null,
    product_price_cents: priceCents,
    product_asin: item.asin || null,
    amazon_url: item.amazon_url || null,
    orange_required: orangeRequired,
    status: "saving",
  }).select().single();

  if (error) {
    console.error("Jar insert error:", error);
    return res.status(500).json({ error: "Failed to add to wishlist" });
  }

  return res.status(200).json({ success: true, jar: data });
};

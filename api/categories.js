// GET /api/categories — Static reward categories for the kid dashboard
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  return res.status(200).json({
    categories: [
      { id: "art",     emoji: "🎨", label: "Art & Crafts",   color: "#FF6B6B", desc: "Kits, supplies & creative stuff" },
      { id: "gaming",  emoji: "🎮", label: "Gaming",          color: "#4ECDC4", desc: "Toys, games & collectibles" },
      { id: "books",   emoji: "📚", label: "Books",           color: "#FFE66D", desc: "Stories, comics & guides" },
      { id: "science", emoji: "🔬", label: "Science",         color: "#A8E6CF", desc: "Kits, experiments & gadgets" },
      { id: "outdoor", emoji: "⚽", label: "Outdoor & Sport", color: "#FF8B94", desc: "Games, balls & outdoor fun" },
      { id: "collect", emoji: "✨", label: "Collectibles",    color: "#C3A6FF", desc: "Cards, figures & stickers" },
    ],
  });
};

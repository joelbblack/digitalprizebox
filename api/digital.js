// GET /api/digital — Digital code catalog
// Future: pull from Tango Card catalog API once keys are available
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Placeholder catalog — will be replaced with Tango Card API
  return res.status(200).json({
    items: [
      { id: "amazon-5",  brand: "Amazon",   name: "$5 Amazon Gift Card",   face_value: 500,  total_cost: 515,  emoji: "🛒" },
      { id: "amazon-10", brand: "Amazon",   name: "$10 Amazon Gift Card",  face_value: 1000, total_cost: 1030, emoji: "🛒" },
      { id: "amazon-25", brand: "Amazon",   name: "$25 Amazon Gift Card",  face_value: 2500, total_cost: 2575, emoji: "🛒" },
      { id: "roblox-10", brand: "Roblox",   name: "$10 Roblox Gift Card",  face_value: 1000, total_cost: 1030, emoji: "🎮" },
      { id: "roblox-25", brand: "Roblox",   name: "$25 Roblox Gift Card",  face_value: 2500, total_cost: 2575, emoji: "🎮" },
      { id: "nintendo-10", brand: "Nintendo", name: "$10 Nintendo eShop",  face_value: 1000, total_cost: 1030, emoji: "🕹️" },
    ],
    note: "Prices include a small convenience fee. Codes are delivered instantly via Tango Card.",
  });
};

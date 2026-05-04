// GET /api/wishlist/:category — Return wishlist items for a category
// Future: Amazon Product Advertising API search
// For now: returns placeholder items per category
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { category } = req.query;

  // Placeholder items — will be replaced with Amazon PA API results
  const CATALOG = {
    art: [
      { id: "art-1", name: "Watercolor Paint Set", price_cents: 1299, emoji: "🎨", amazon_url: null },
      { id: "art-2", name: "Origami Paper Kit (200 sheets)", price_cents: 899, emoji: "📄", amazon_url: null },
      { id: "art-3", name: "Scratch Art Rainbow Paper", price_cents: 1099, emoji: "🌈", amazon_url: null },
    ],
    gaming: [
      { id: "game-1", name: "Uno Card Game", price_cents: 799, emoji: "🃏", amazon_url: null },
      { id: "game-2", name: "Minecraft Mini Figures 3-Pack", price_cents: 1499, emoji: "⛏️", amazon_url: null },
      { id: "game-3", name: "Pokemon Cards Booster Pack", price_cents: 599, emoji: "⚡", amazon_url: null },
    ],
    books: [
      { id: "book-1", name: "Dog Man: The Scarlet Shedder", price_cents: 999, emoji: "📖", amazon_url: null },
      { id: "book-2", name: "Diary of a Wimpy Kid", price_cents: 899, emoji: "📓", amazon_url: null },
      { id: "book-3", name: "National Geographic Kids Almanac", price_cents: 1199, emoji: "🌍", amazon_url: null },
    ],
    science: [
      { id: "sci-1", name: "Crystal Growing Kit", price_cents: 1499, emoji: "💎", amazon_url: null },
      { id: "sci-2", name: "Snap Circuits Jr.", price_cents: 2499, emoji: "⚡", amazon_url: null },
      { id: "sci-3", name: "Volcano Making Kit", price_cents: 1299, emoji: "🌋", amazon_url: null },
    ],
    outdoor: [
      { id: "out-1", name: "Nerf Elite 2.0 Blaster", price_cents: 1999, emoji: "🔫", amazon_url: null },
      { id: "out-2", name: "LED Night Football", price_cents: 1599, emoji: "🏈", amazon_url: null },
      { id: "out-3", name: "Stomp Rocket", price_cents: 2199, emoji: "🚀", amazon_url: null },
    ],
    collect: [
      { id: "col-1", name: "Squishmallows 8-inch", price_cents: 1299, emoji: "🧸", amazon_url: null },
      { id: "col-2", name: "Hot Wheels 5-Pack", price_cents: 699, emoji: "🏎️", amazon_url: null },
      { id: "col-3", name: "Sticker Book (1000+ stickers)", price_cents: 899, emoji: "⭐", amazon_url: null },
    ],
  };

  const items = CATALOG[category] || [];
  return res.status(200).json({ items, category });
};

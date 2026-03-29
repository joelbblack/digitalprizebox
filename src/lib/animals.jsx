// ─── Digital Prize Box — Saturday Morning Cartoon Design System ───────────────
// Cream paper background. Thick black outlines. Bold primary colors.
// Hard cel-shaded drop shadows. No gradients. No blur. Pure cartoon.
// ─────────────────────────────────────────────────────────────────────────────

export const T = {
  // ── Base surfaces ────────────────────────────────────────────────────────────
  bg:         "#FFF9E6",   // warm cream paper — main background
  card:       "#FFFFFF",   // white card surface
  card2:      "#FFF3F0",   // light tinted card
  cardBlue:   "#F0F4FF",   // blue tinted card
  cardGreen:  "#F0FFF6",   // green tinted card
  cardYellow: "#FFFBE6",   // yellow tinted card

  // ── Ink ──────────────────────────────────────────────────────────────────────
  ink:        "#1A0A00",   // near-black cartoon ink
  inkLight:   "#5C3D2E",   // lighter ink for secondary text
  sub:        "#8B6E5A",   // muted brown-gray for hints

  // ── Brand colors ─────────────────────────────────────────────────────────────
  red:        "#FF4E1A",   // hot red — headers, nav
  redL:       "#FF8A6A",
  redBg:      "#FFF0EC",

  yellow:     "#FFE600",   // sunshine yellow — highlights, badges
  yellowL:    "#FFF176",
  yellowBg:   "#FFFDE7",

  green:      "#00C44F",   // grass green — green currency
  greenL:     "#69F0AE",
  greenBg:    "#E8FFF2",

  purple:     "#7B2FFF",   // electric purple — primary CTA
  purpleL:    "#B57BFF",
  purpleBg:   "#F3EEFF",

  orange:     "#FF7A00",   // orange bucks
  orangeL:    "#FFB347",
  orangeBg:   "#FFF3E0",

  blue:       "#0080FF",   // school/district
  blueL:      "#66B2FF",
  blueBg:     "#EEF4FF",

  pink:       "#FF3CAC",   // family circle
  pinkL:      "#FF85D0",
  pinkBg:     "#FFF0F9",

  gold:       "#F5A623",   // goals / achievements
  goldL:      "#FFD580",
  goldBg:     "#FFFBE6",

  // ── Shadows & outlines ────────────────────────────────────────────────────────
  outline:       "4px solid #1A0A00",
  outlineThin:   "2px solid #1A0A00",
  shadow:        "5px 5px 0 #1A0A00",
  shadowSm:      "3px 3px 0 #1A0A00",
  shadowLg:      "7px 7px 0 #1A0A00",
  shadowColor:   (c) => `4px 4px 0 ${c}`,

  // ── Typography ────────────────────────────────────────────────────────────────
  display: "'Fredoka One', cursive",
  body:    "'Nunito', sans-serif",
};

export const R = {
  sm:   "8px",
  md:   "14px",
  lg:   "20px",
  xl:   "28px",
  pill: "50px",
};

export const fontCSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

* { box-sizing: border-box; }

@keyframes bounce    { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-14px) scale(1.06);} }
@keyframes wiggle    { 0%,100%{transform:rotate(-4deg);} 50%{transform:rotate(4deg);} }
@keyframes pop       { 0%{transform:scale(0.75);opacity:0;} 70%{transform:scale(1.08);} 100%{transform:scale(1);opacity:1;} }
@keyframes fadeUp    { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }
@keyframes fadeIn    { from{opacity:0;} to{opacity:1;} }
@keyframes slideIn   { from{opacity:0;transform:translateX(-14px);} to{opacity:1;transform:translateX(0);} }
@keyframes spin      { to{transform:rotate(360deg);} }
@keyframes float     { 0%,100%{transform:translateY(0) rotate(-1deg);} 50%{transform:translateY(-10px) rotate(1deg);} }
@keyframes pulse     { 0%,100%{transform:scale(1);} 50%{transform:scale(1.05);} }
@keyframes shake     { 0%,100%{transform:translateX(0);} 20%,60%{transform:translateX(-5px);} 40%,80%{transform:translateX(5px);} }
@keyframes confetti  { 0%{transform:translateY(-20px) rotate(0deg);opacity:1;} 100%{transform:translateY(110vh) rotate(720deg);opacity:0;} }
@keyframes reveal    { 0%{opacity:0;transform:translateY(20px) scale(0.96);} 100%{opacity:1;transform:translateY(0) scale(1);} }
@keyframes stampIn   { 0%{transform:scale(2) rotate(-10deg);opacity:0;} 70%{transform:scale(0.95) rotate(2deg);} 100%{transform:scale(1) rotate(0deg);opacity:1;} }
`;

export const PRICING = {
  family:  { signup: 499,  monthly: 199,  label: "Family",  color: "#00C44F" },
  teacher: { signup: 999,  monthly: 399,  label: "Teacher", color: "#7B2FFF" },
  school:  { signup: 0,    monthly: 4900, label: "School",  color: "#0080FF" },
};

export const DISTRICT_TIERS = [
  { id: "micro",      label: "Micro",      students: "Under 2,500",      price: "$299/mo",    example: "Small rural district" },
  { id: "small",      label: "Small",      students: "2,500 – 10,000",   price: "$599/mo",    example: "Yucaipa, Big Bear"    },
  { id: "medium",     label: "Medium",     students: "10,000 – 50,000",  price: "$1,499/mo",  example: "Redlands, Riverside"  },
  { id: "large",      label: "Large",      students: "50,000 – 150,000", price: "$3,999/mo",  example: "Fresno, Long Beach"   },
  { id: "enterprise", label: "Enterprise", students: "150,000+",         price: "Contact us", example: "LAUSD, NYC DOE"       },
];

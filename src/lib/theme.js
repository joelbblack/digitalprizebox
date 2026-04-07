// ─── Digital Prize Box — Pop-Art Design System ──────────────────────────────
// Inspired by Roy Lichtenstein (bold outlines, Ben-Day dots, primary colors)
// and Ellsworth Kelly (flat color fields, hard geometric edges, minimalist).
// ─────────────────────────────────────────────────────────────────────────────

export const T = {
  // ── Core palette ────────────────────────────────────────────────────────────
  sky:        "#FFFFFF",   // clean white — main bg
  panel:      "#F5F5F5",   // light warm gray panel
  panel2:     "#FFFFFF",   // card surface
  panelLight: "#F0EAFF",   // legacy light panel
  border:     "#222222",   // bold dark border
  borderBold: "#000000",   // pure black for emphasis

  // ── Text ────────────────────────────────────────────────────────────────────
  text:       "#111111",   // near-black on light bg
  sub:        "#555555",   // medium gray for secondary text
  ink:        "#000000",   // pure black

  // ── Brand colors ────────────────────────────────────────────────────────────
  purple:     "#0033CC",   // Lichtenstein blue — primary brand
  purpleL:    "#3366FF",   // lighter blue
  purpleD:    "#002299",   // darker blue

  // ── Currency colors ─────────────────────────────────────────────────────────
  green:      "#10B981",   // green money
  greenL:     "#6EE7B7",   // light green
  greenBg:    "#D1FAE5",   // green background tint (light mode)
  orange:     "#F97316",   // orange bucks
  orangeL:    "#FDBA74",   // light orange
  orangeBg:   "#FFF7ED",   // orange background tint (light mode)
  gold:       "#F59E0B",   // goals / achievements
  goldL:      "#FDE68A",   // light gold
  goldBg:     "#FFFBEB",   // gold background tint (light mode)

  // ── Status ──────────────────────────────────────────────────────────────────
  red:        "#EF4444",
  redL:       "#FCA5A5",
  blue:       "#3B82F6",
  blueL:      "#93C5FD",

  // ── Pop-art accent colors ───────────────────────────────────────────────────
  pink:       "#FF1493",   // hot pink pop-art
  teal:       "#14B8A6",
  lime:       "#84CC16",
  coral:      "#FF3333",   // Lichtenstein red
  sunshine:   "#FFDD00",   // Lichtenstein yellow

  // ── Convenience aliases (referenced by utility components) ──────────────────
  bg:         "#FFFFFF",
  white:      "#FFFFFF",
  yellow:     "#FFDD00",
  body:       "'Nunito', sans-serif",
  display:    "'Fredoka One', cursive",
  outline:    "3px solid #000000",
  outlineThin:"2px solid #000000",
  pill:       "50px",
};

// ── Bold pop-art outline (hard black edges) ───────────────────────────────────
export const outline = (color = "#000000", width = 3) =>
  `${width}px ${width}px 0 ${color}, -${width}px ${width}px 0 ${color}, ${width}px -${width}px 0 ${color}, -${width}px -${width}px 0 ${color}`;

// ── Hard-edge drop shadow (Kelly-style, no blur) ─────────────────────────────
export const shadow = {
  sm:      "3px 3px 0 #000000",
  md:      "5px 5px 0 #000000",
  lg:      "7px 7px 0 #000000",
  xl:      "10px 10px 0 #000000",
  glow:    (color) => `0 0 0 3px ${color}`,
  colored: (color) => `5px 5px 0 ${color}`,
};

// ── Ben-Day dot pattern helper (inline styles) ───────────────────────────────
export const benday = (color = "#00000018", size = 8, dotSize = 1) => ({
  backgroundImage: `radial-gradient(circle, ${color} ${dotSize}px, transparent ${dotSize}px)`,
  backgroundSize: `${size}px ${size}px`,
});

// ── Typography ────────────────────────────────────────────────────────────────
export const fonts = {
  display: "'Fredoka One', cursive",
  body:    "'Nunito', sans-serif",
};

// ── Font face + animation CSS ─────────────────────────────────────────────────
export const fontCSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

.benday-dots {
  background-image: radial-gradient(circle, #00000015 1px, transparent 1px);
  background-size: 8px 8px;
}
.benday-dots-dense {
  background-image: radial-gradient(circle, #00000020 1.2px, transparent 1.2px);
  background-size: 6px 6px;
}

@keyframes bounce    { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-12px) scale(1.05);} }
@keyframes wiggle    { 0%,100%{transform:rotate(-3deg);} 50%{transform:rotate(3deg);} }
@keyframes pop       { 0%{transform:scale(0.8);opacity:0;} 70%{transform:scale(1.1);} 100%{transform:scale(1);opacity:1;} }
@keyframes fadeUp    { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
@keyframes fadeIn    { from{opacity:0;} to{opacity:1;} }
@keyframes slideIn   { from{opacity:0;transform:translateX(-12px);} to{opacity:1;transform:translateX(0);} }
@keyframes spin      { to{transform:rotate(360deg);} }
@keyframes float     { 0%,100%{transform:translateY(0px) rotate(-1deg);} 50%{transform:translateY(-8px) rotate(1deg);} }
@keyframes starPulse { 0%,100%{opacity:0.4;transform:scale(1);} 50%{opacity:1;transform:scale(1.3);} }
@keyframes shimmer   { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
@keyframes confetti  { 0%{transform:translateY(-20px) rotate(0deg);opacity:1;} 100%{transform:translateY(100vh) rotate(720deg);opacity:0;} }
@keyframes lidPop    { 0%{transform:translateY(0) rotate(0deg);opacity:1;} 100%{transform:translateY(-120px) rotate(-25deg);opacity:0;} }
@keyframes reveal    { 0%{opacity:0;transform:translateY(24px) scale(0.95);} 100%{opacity:1;transform:translateY(0) scale(1);} }
@keyframes pulse     { 0%,100%{box-shadow:0 0 0 0 rgba(0,51,204,0.4);} 50%{box-shadow:0 0 0 10px rgba(0,51,204,0);} }
@keyframes shake     { 0%,100%{transform:translateX(0);} 20%,60%{transform:translateX(-4px);} 40%,80%{transform:translateX(4px);} }
`;

// ── Pricing constants ─────────────────────────────────────────────────────────
export const PRICING = {
  family:              { signup: 499,    monthly: 199,    label: "Family",              color: "#10B981" },
  teacher:             { signup: 999,    monthly: 399,    label: "Teacher",             color: "#0033CC" },
  school:              { signup: 0,      monthly: 4900,   label: "School",              color: "#F59E0B" },
  district_micro:      { signup: 0,      monthly: 29900,  label: "District — Micro",    color: "#3B82F6" },
  district_small:      { signup: 0,      monthly: 59900,  label: "District — Small",    color: "#3B82F6" },
  district_medium:     { signup: 0,      monthly: 149900, label: "District — Medium",   color: "#3B82F6" },
  district_large:      { signup: 0,      monthly: 399900, label: "District — Large",    color: "#3B82F6" },
  district_enterprise: { signup: 0,      monthly: null,   label: "District — Enterprise", color: "#FF1493" },
};

// ── District tier lookup ──────────────────────────────────────────────────────
export const DISTRICT_TIERS = [
  { id: "micro",      label: "Micro",      students: "Under 2,500",      price: "$299/mo",    example: "Small rural district" },
  { id: "small",      label: "Small",      students: "2,500 – 10,000",   price: "$599/mo",    example: "Yucaipa, Big Bear"    },
  { id: "medium",     label: "Medium",     students: "10,000 – 50,000",  price: "$1,499/mo",  example: "Redlands, Riverside"  },
  { id: "large",      label: "Large",      students: "50,000 – 150,000", price: "$3,999/mo",  example: "Fresno, Long Beach"   },
  { id: "enterprise", label: "Enterprise", students: "150,000+",         price: "Contact us", example: "LAUSD, NYC DOE"       },
];

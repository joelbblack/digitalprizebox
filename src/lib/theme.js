// ─── Digital Prize Box — Saturday Morning Cartoon Design System ───────────────
// Inspired by 90s Saturday morning cartoons: bold outlines, bright primaries,
// bubbly type, cel-shaded depth, playful motion everywhere.
// ─────────────────────────────────────────────────────────────────────────────

export const T = {
  // ── Core palette ────────────────────────────────────────────────────────────
  sky:        "#1A0A3C",   // deep cartoon night sky — main bg
  panel:      "#231545",   // slightly lighter panel
  panel2:     "#2D1D55",   // card surface
  panelLight: "#F0EAFF",   // light mode panel
  border:     "#4A3575",   // purple border
  borderBold: "#7B5FC0",   // brighter border for emphasis

  // ── Text ────────────────────────────────────────────────────────────────────
  text:       "#F5F0FF",   // near-white with purple warmth
  sub:        "#B0A0D8",   // muted lavender
  ink:        "#1A0A3C",   // dark ink for light bg text

  // ── Brand colors ────────────────────────────────────────────────────────────
  purple:     "#7C3AED",   // primary brand
  purpleL:    "#A78BFA",   // light purple
  purpleD:    "#5B21B6",   // dark purple

  // ── Currency colors ─────────────────────────────────────────────────────────
  green:      "#10B981",   // green money
  greenL:     "#6EE7B7",
  greenBg:    "#064E3B",
  orange:     "#F97316",   // orange bucks
  orangeL:    "#FDBA74",
  orangeBg:   "#431407",
  gold:       "#F59E0B",   // goals / achievements
  goldL:      "#FDE68A",
  goldBg:     "#451A03",

  // ── Status ──────────────────────────────────────────────────────────────────
  red:        "#EF4444",
  redL:       "#FCA5A5",
  blue:       "#3B82F6",
  blueL:      "#93C5FD",

  // ── Cartoon accent colors ───────────────────────────────────────────────────
  pink:       "#EC4899",
  teal:       "#14B8A6",
  lime:       "#84CC16",
  coral:      "#FF6B6B",
  sunshine:   "#FFD93D",
};

// ── Cartoon outline shadow (gives cel-shaded look) ───────────────────────────
export const outline = (color = "#1A0A3C", width = 2) =>
  `${width}px ${width}px 0 ${color}, -${width}px ${width}px 0 ${color}, ${width}px -${width}px 0 ${color}, -${width}px -${width}px 0 ${color}`;

// ── Cartoon drop shadow ──────────────────────────────────────────────────────
export const shadow = {
  sm:  "4px 4px 0 rgba(0,0,0,0.4)",
  md:  "6px 6px 0 rgba(0,0,0,0.4)",
  lg:  "8px 8px 0 rgba(0,0,0,0.4)",
  xl:  "12px 12px 0 rgba(0,0,0,0.5)",
  glow: (color) => `0 0 20px ${color}66, 0 0 40px ${color}33`,
  colored: (color) => `4px 4px 0 ${color}`,
};

// ── Typography ───────────────────────────────────────────────────────────────
export const fonts = {
  display: "'Fredoka One', cursive",   // bubbly headers
  body:    "'Nunito', sans-serif",     // friendly readable body
};

// ── Font face import CSS ─────────────────────────────────────────────────────
export const fontCSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

@keyframes bounce      { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-12px) scale(1.05);} }
@keyframes wiggle      { 0%,100%{transform:rotate(-3deg);} 50%{transform:rotate(3deg);} }
@keyframes pop         { 0%{transform:scale(0.8);opacity:0;} 70%{transform:scale(1.1);} 100%{transform:scale(1);opacity:1;} }
@keyframes fadeUp      { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
@keyframes fadeIn      { from{opacity:0;} to{opacity:1;} }
@keyframes slideIn     { from{opacity:0;transform:translateX(-12px);} to{opacity:1;transform:translateX(0);} }
@keyframes spin        { to{transform:rotate(360deg);} }
@keyframes float       { 0%,100%{transform:translateY(0px) rotate(-1deg);} 50%{transform:translateY(-8px) rotate(1deg);} }
@keyframes starPulse   { 0%,100%{opacity:0.4;transform:scale(1);} 50%{opacity:1;transform:scale(1.3);} }
@keyframes shimmer     { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
@keyframes confetti    { 0%{transform:translateY(-20px) rotate(0deg);opacity:1;} 100%{transform:translateY(100vh) rotate(720deg);opacity:0;} }
@keyframes lidPop      { 0%{transform:translateY(0) rotate(0deg);opacity:1;} 100%{transform:translateY(-120px) rotate(-25deg);opacity:0;} }
@keyframes reveal      { 0%{opacity:0;transform:translateY(24px) scale(0.95);} 100%{opacity:1;transform:translateY(0) scale(1);} }
@keyframes pulse       { 0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,0.4);} 50%{box-shadow:0 0 0 10px rgba(124,58,237,0);} }
@keyframes shake       { 0%,100%{transform:translateX(0);} 20%,60%{transform:translateX(-4px);} 40%,80%{transform:translateX(4px);} }
@keyframes cartoonBg   { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }
`;

// ── Reusable cartoon card style ───────────────────────────────────────────────
export const cardStyle = (extra = {}) => ({
  background:   T.panel2,
  border:       `3px solid ${T.borderBold}`,
  borderRadius: 20,
  boxShadow:    shadow.md,
  padding:      "20px",
  ...extra,
});

// ── Cartoon button base ───────────────────────────────────────────────────────
export const btnStyle = ({
  color    = T.purple,
  textColor = "white",
  small    = false,
  outline  = false,
  disabled = false,
  full     = false,
} = {}) => ({
  background:   disabled ? T.border : outline ? "transparent" : color,
  border:       `3px solid ${disabled ? T.border : color}`,
  color:        disabled ? T.sub : outline ? color : textColor,
  borderRadius: 50,
  padding:      small ? "6px 16px" : "10px 24px",
  fontSize:     small ? 13 : 15,
  fontWeight:   800,
  fontFamily:   fonts.body,
  cursor:       disabled ? "not-allowed" : "pointer",
  opacity:      disabled ? 0.5 : 1,
  boxShadow:    disabled ? "none" : shadow.sm,
  transform:    "translateY(0)",
  transition:   "all 0.15s",
  whiteSpace:   "nowrap",
  width:        full ? "100%" : undefined,
});

// ── Star field background ─────────────────────────────────────────────────────
export const STARS = Array.from({ length: 50 }, (_, i) => ({
  id:      i,
  left:    `${Math.random() * 100}%`,
  top:     `${Math.random() * 100}%`,
  size:    Math.random() > 0.8 ? 4 : 2,
  delay:   `${Math.random() * 4}s`,
  dur:     `${2 + Math.random() * 3}s`,
  opacity: 0.3 + Math.random() * 0.5,
}));

// ── Confetti colors ───────────────────────────────────────────────────────────
export const CONFETTI_COLORS = [
  "#FF6B6B","#FFD93D","#6BCB77","#4D96FF",
  "#FF6FC8","#FF922B","#A9E34B","#74C0FC",
];

// ── Pricing ───────────────────────────────────────────────────────────────────
export const PRICING = {
  family:             { signup: 499,   monthly: 199,   label: "Family",             color: T.green   },
  teacher:            { signup: 999,   monthly: 399,   label: "Teacher",            color: T.purple  },
  school:             { signup: 0,     monthly: 4900,  label: "School",             color: T.gold    },
  district_micro:     { signup: 0,     monthly: 29900, label: "District — Micro",   color: T.blue    },
  district_small:     { signup: 0,     monthly: 59900, label: "District — Small",   color: T.blue    },
  district_medium:    { signup: 0,     monthly: 149900,label: "District — Medium",  color: T.blue    },
  district_large:     { signup: 0,     monthly: 399900,label: "District — Large",   color: T.blue    },
  district_enterprise:{ signup: 0,     monthly: null,  label: "District — Enterprise", color: T.pink },
};

export const DISTRICT_TIERS = [
  { id: "micro",      label: "Micro",      students: "Under 2,500",     price: "$299/mo",   example: "Small rural district" },
  { id: "small",      label: "Small",      students: "2,500 – 10,000",  price: "$599/mo",   example: "Yucaipa, Big Bear" },
  { id: "medium",     label: "Medium",     students: "10,000 – 50,000", price: "$1,499/mo", example: "Redlands, Riverside" },
  { id: "large",      label: "Large",      students: "50,000 – 150,000",price: "$3,999/mo", example: "Fresno, Long Beach" },
  { id: "enterprise", label: "Enterprise", students: "150,000+",        price: "Contact us", example: "LAUSD, NYC DOE" },
];

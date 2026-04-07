// ─── src/lib/animals.jsx ─────────────────────────────────────────────────────
// Low-poly triangle-based SVG animals.
// Every shape is a <polygon> with exactly 3 points (triangle).
// Bold black outlines, flat color fields, faceted geometric depth.
// Inspired by low-poly 3D art + Ellsworth Kelly's hard-edge color planes.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { T, fontCSS } from "./theme";

// ── Shared SVG wrapper ────────────────────────────────────────────────────────
const AnimalSVG = ({ size, children, viewBox = "0 0 100 100" }) => (
  <svg
    width={size} height={size}
    viewBox={viewBox}
    style={{ display: "block", overflow: "visible" }}
  >
    {children}
  </svg>
);

// ── Crease (no-op for backward compat) ───────────────────────────────────────
const Crease = () => null;

// ── Triangle helper: shorthand for consistent stroke styling ─────────────────
const Tri = ({ points, fill, stroke = "#000000", sw = 2.5 }) => (
  <polygon
    points={points} fill={fill}
    stroke={stroke} strokeWidth={sw} strokeLinejoin="miter"
  />
);

// ═══════════════════════════════════════════════════════════════════════════════
// LOW-POLY TRIANGLE ANIMALS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Fox ───────────────────────────────────────────────────────────────────────
export const Fox = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Left ear */}
    <Tri points="14,52 26,18 40,52" fill="#E8621A"/>
    <Tri points="18,50 26,24 34,50" fill="#F9A875" sw={0}/>
    {/* Right ear */}
    <Tri points="60,52 74,18 86,52" fill="#E8621A"/>
    <Tri points="64,50 74,24 82,50" fill="#F9A875" sw={0}/>
    {/* Face — diamond split into 4 triangles */}
    <Tri points="50,16 84,52 16,52" fill="#E8621A"/>
    <Tri points="16,52 84,52 50,84" fill="#D4540F"/>
    {/* Muzzle — 3 white triangles */}
    <Tri points="36,52 50,84 16,52" fill="#FEF0DC"/>
    <Tri points="64,52 50,84 84,52" fill="#FEF0DC"/>
    <Tri points="36,52 64,52 50,72" fill="#FEF3E0" sw={1.5}/>
    {/* Eyes — small dark triangles */}
    <Tri points="33,42 41,42 37,50" fill="#000000" sw={0}/>
    <Tri points="59,42 67,42 63,50" fill="#000000" sw={0}/>
    {/* Nose */}
    <Tri points="46,62 54,62 50,67" fill="#000000" sw={0}/>
  </AnimalSVG>
);

// ── Panda ─────────────────────────────────────────────────────────────────────
export const Panda = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Ears — dark triangles */}
    <Tri points="18,30 28,10 38,30" fill="#2D2D3A"/>
    <Tri points="62,30 72,10 82,30" fill="#2D2D3A"/>
    {/* Head — 6 triangles forming hexagonal face */}
    <Tri points="50,18 80,38 50,52" fill="#F8F8F8"/>
    <Tri points="50,18 20,38 50,52" fill="#ECECEC"/>
    <Tri points="20,38 20,68 50,52" fill="#F0F0F0"/>
    <Tri points="80,38 80,68 50,52" fill="#E8E8E8"/>
    <Tri points="20,68 50,86 50,52" fill="#F5F5F5"/>
    <Tri points="80,68 50,86 50,52" fill="#EBEBEB"/>
    {/* Eye patches — dark triangles */}
    <Tri points="28,38 44,38 36,52" fill="#2D2D3A" sw={1.5}/>
    <Tri points="56,38 72,38 64,52" fill="#2D2D3A" sw={1.5}/>
    {/* Eyes — white triangles inside patches */}
    <Tri points="33,41 39,41 36,47" fill="#FFFFFF" sw={0}/>
    <Tri points="61,41 67,41 64,47" fill="#FFFFFF" sw={0}/>
    {/* Pupils */}
    <Tri points="35,42 38,42 36,46" fill="#000000" sw={0}/>
    <Tri points="63,42 66,42 64,46" fill="#000000" sw={0}/>
    {/* Nose */}
    <Tri points="46,58 54,58 50,63" fill="#2D2D3A" sw={0}/>
  </AnimalSVG>
);

// ── Butterfly ─────────────────────────────────────────────────────────────────
export const Butterfly = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Upper left wing — 2 triangles */}
    <Tri points="50,46 6,10 8,46" fill="#9B5DE5"/>
    <Tri points="50,46 6,10 28,10" fill="#C77DFF"/>
    {/* Upper right wing */}
    <Tri points="50,46 94,10 92,46" fill="#9B5DE5"/>
    <Tri points="50,46 94,10 72,10" fill="#C77DFF"/>
    {/* Lower left wing */}
    <Tri points="50,56 8,56 20,86" fill="#C77DFF"/>
    {/* Lower right wing */}
    <Tri points="50,56 92,56 80,86" fill="#C77DFF"/>
    {/* Wing spots — small accent triangles */}
    <Tri points="18,24 30,24 24,34" fill="#FFDD00" sw={1.5}/>
    <Tri points="70,24 82,24 76,34" fill="#FFDD00" sw={1.5}/>
    {/* Body — tall narrow triangle */}
    <Tri points="46,28 54,28 50,78" fill="#000000" sw={1}/>
    {/* Antennae tips */}
    <Tri points="33,12 39,12 36,18" fill="#9B5DE5" sw={1.5}/>
    <Tri points="61,12 67,12 64,18" fill="#9B5DE5" sw={1.5}/>
  </AnimalSVG>
);

// ── Frog ──────────────────────────────────────────────────────────────────────
export const Frog = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Body — diamond as 4 triangles */}
    <Tri points="50,14 86,48 50,48" fill="#3EBD6E"/>
    <Tri points="50,14 14,48 50,48" fill="#34A85E"/>
    <Tri points="14,48 50,76 50,48" fill="#2D9652"/>
    <Tri points="86,48 50,76 50,48" fill="#3EBD6E"/>
    {/* Eyes — triangulated circles */}
    <Tri points="18,36 38,36 28,20" fill="#3EBD6E" sw={2}/>
    <Tri points="62,36 82,36 72,20" fill="#3EBD6E" sw={2}/>
    {/* Eye whites */}
    <Tri points="22,34 34,34 28,24" fill="#FFFFFF" sw={1}/>
    <Tri points="66,34 78,34 72,24" fill="#FFFFFF" sw={1}/>
    {/* Pupils */}
    <Tri points="26,32 32,32 28,26" fill="#000000" sw={0}/>
    <Tri points="70,32 76,32 72,26" fill="#000000" sw={0}/>
    {/* Belly */}
    <Tri points="36,48 64,48 50,66" fill="#A8EDBC" sw={1.5}/>
    {/* Smile — two small triangles */}
    <Tri points="34,60 50,68 42,60" fill="#2D9652" sw={0}/>
    <Tri points="66,60 50,68 58,60" fill="#2D9652" sw={0}/>
  </AnimalSVG>
);

// ── Bear ──────────────────────────────────────────────────────────────────────
export const Bear = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Ears */}
    <Tri points="18,30 28,10 38,30" fill="#A78BFA"/>
    <Tri points="22,28 28,16 34,28" fill="#C4B5FD" sw={0}/>
    <Tri points="62,30 72,10 82,30" fill="#A78BFA"/>
    <Tri points="66,28 72,16 78,28" fill="#C4B5FD" sw={0}/>
    {/* Head — 6 triangles */}
    <Tri points="50,18 80,40 50,52" fill="#A78BFA"/>
    <Tri points="50,18 20,40 50,52" fill="#9575E6"/>
    <Tri points="20,40 20,68 50,52" fill="#A78BFA"/>
    <Tri points="80,40 80,68 50,52" fill="#9575E6"/>
    <Tri points="20,68 50,86 50,52" fill="#B09AEE"/>
    <Tri points="80,68 50,86 50,52" fill="#A78BFA"/>
    {/* Muzzle */}
    <Tri points="36,56 64,56 50,74" fill="#C4B5FD" sw={1.5}/>
    {/* Eyes */}
    <Tri points="33,42 41,42 37,50" fill="#000000" sw={0}/>
    <Tri points="59,42 67,42 63,50" fill="#000000" sw={0}/>
    {/* Nose */}
    <Tri points="46,58 54,58 50,63" fill="#000000" sw={0}/>
  </AnimalSVG>
);

// ── Tiger ─────────────────────────────────────────────────────────────────────
export const Tiger = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Ears */}
    <Tri points="14,44 24,16 38,44" fill="#F97316"/>
    <Tri points="18,42 24,22 34,42" fill="#FDE68A" sw={0}/>
    <Tri points="62,44 76,16 86,44" fill="#F97316"/>
    <Tri points="66,42 76,22 82,42" fill="#FDE68A" sw={0}/>
    {/* Face — 5 triangles forming pentagon */}
    <Tri points="50,14 86,50 50,50" fill="#F97316"/>
    <Tri points="50,14 14,50 50,50" fill="#E56A0A"/>
    <Tri points="14,50 30,82 50,50" fill="#F97316"/>
    <Tri points="86,50 70,82 50,50" fill="#E56A0A"/>
    <Tri points="30,82 70,82 50,50" fill="#F08030"/>
    {/* Stripes — thin dark triangles */}
    <Tri points="34,22 38,22 36,36" fill="#000000" sw={0}/>
    <Tri points="62,22 66,22 64,36" fill="#000000" sw={0}/>
    <Tri points="22,48 26,48 24,56" fill="#000000" sw={0}/>
    <Tri points="74,48 78,48 76,56" fill="#000000" sw={0}/>
    {/* Muzzle */}
    <Tri points="36,56 64,56 50,76" fill="#FDE68A" sw={1.5}/>
    {/* Eyes — green with dark pupils */}
    <Tri points="30,42 42,42 36,50" fill="#84CC16" sw={1}/>
    <Tri points="58,42 70,42 64,50" fill="#84CC16" sw={1}/>
    <Tri points="34,43 38,43 36,48" fill="#000000" sw={0}/>
    <Tri points="62,43 66,43 64,48" fill="#000000" sw={0}/>
    {/* Nose */}
    <Tri points="46,60 54,60 50,66" fill="#000000" sw={0}/>
  </AnimalSVG>
);

// ── Owl ───────────────────────────────────────────────────────────────────────
export const Owl = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Left wing */}
    <Tri points="20,40 4,58 14,74" fill="#1D4ED8"/>
    {/* Right wing */}
    <Tri points="80,40 96,58 86,74" fill="#1D4ED8"/>
    {/* Body — 4 triangles */}
    <Tri points="50,26 80,38 50,60" fill="#3B82F6"/>
    <Tri points="50,26 20,38 50,60" fill="#2563EB"/>
    <Tri points="20,38 14,72 50,60" fill="#3B82F6"/>
    <Tri points="80,38 86,72 50,60" fill="#2563EB"/>
    <Tri points="14,72 50,92 50,60" fill="#3B82F6"/>
    <Tri points="86,72 50,92 50,60" fill="#2563EB"/>
    {/* Ear tufts */}
    <Tri points="36,28 28,8 42,22" fill="#1D4ED8"/>
    <Tri points="64,28 72,8 58,22" fill="#1D4ED8"/>
    {/* Belly — lighter triangles */}
    <Tri points="34,56 66,56 50,86" fill="#BFDBFE" sw={1.5}/>
    <Tri points="34,56 50,56 42,72" fill="#D4E8FC" sw={0}/>
    <Tri points="50,56 66,56 58,72" fill="#C8DFFA" sw={0}/>
    {/* Eyes — large triangulated circles */}
    <Tri points="26,38 50,38 38,52" fill="#FEF3C7" sw={1.5}/>
    <Tri points="50,38 74,38 62,52" fill="#FEF3C7" sw={1.5}/>
    {/* Iris */}
    <Tri points="32,40 44,40 38,48" fill="#F59E0B" sw={0}/>
    <Tri points="56,40 68,40 62,48" fill="#F59E0B" sw={0}/>
    {/* Pupils */}
    <Tri points="36,42 42,42 38,46" fill="#000000" sw={0}/>
    <Tri points="60,42 66,42 62,46" fill="#000000" sw={0}/>
    {/* Beak */}
    <Tri points="44,52 56,52 50,60" fill="#F59E0B" sw={1.5}/>
  </AnimalSVG>
);

// ── Penguin ───────────────────────────────────────────────────────────────────
export const Penguin = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Body — dark triangles */}
    <Tri points="50,30 22,55 50,90" fill="#1E293B"/>
    <Tri points="50,30 78,55 50,90" fill="#151E2B"/>
    <Tri points="22,55 50,90 22,90" fill="#1E293B"/>
    <Tri points="78,55 50,90 78,90" fill="#151E2B"/>
    {/* White belly */}
    <Tri points="50,40 34,60 50,86" fill="#F8F8F8" sw={1.5}/>
    <Tri points="50,40 66,60 50,86" fill="#EEEEEE" sw={1.5}/>
    {/* Head — triangulated */}
    <Tri points="50,6 28,28 50,36" fill="#1E293B"/>
    <Tri points="50,6 72,28 50,36" fill="#151E2B"/>
    <Tri points="28,28 72,28 50,36" fill="#1E293B"/>
    {/* Face white */}
    <Tri points="38,20 62,20 50,32" fill="#F8F8F8" sw={1}/>
    {/* Eyes */}
    <Tri points="40,20 46,20 43,26" fill="#000000" sw={0}/>
    <Tri points="54,20 60,20 57,26" fill="#000000" sw={0}/>
    {/* Beak */}
    <Tri points="44,28 56,28 50,36" fill="#F59E0B" sw={1.5}/>
    {/* Wings */}
    <Tri points="22,50 10,68 22,78" fill="#1E293B"/>
    <Tri points="78,50 90,68 78,78" fill="#151E2B"/>
    {/* Feet */}
    <Tri points="34,88 46,88 40,96" fill="#F59E0B" sw={1.5}/>
    <Tri points="54,88 66,88 60,96" fill="#F59E0B" sw={1.5}/>
  </AnimalSVG>
);

// ── Koala ─────────────────────────────────────────────────────────────────────
export const Koala = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Left ear — triangulated circle */}
    <Tri points="6,14 22,4 34,20" fill="#94A3B8"/>
    <Tri points="6,14 34,20 20,32" fill="#94A3B8"/>
    <Tri points="12,18 24,10 28,26" fill="#CBD5E1" sw={0}/>
    {/* Right ear */}
    <Tri points="66,20 78,4 94,14" fill="#94A3B8"/>
    <Tri points="66,20 94,14 80,32" fill="#94A3B8"/>
    <Tri points="72,26 76,10 88,18" fill="#CBD5E1" sw={0}/>
    {/* Head — 6 triangles */}
    <Tri points="50,22 80,40 50,52" fill="#94A3B8"/>
    <Tri points="50,22 20,40 50,52" fill="#869AAD"/>
    <Tri points="20,40 20,70 50,52" fill="#94A3B8"/>
    <Tri points="80,40 80,70 50,52" fill="#869AAD"/>
    <Tri points="20,70 50,88 50,52" fill="#9CAEBF"/>
    <Tri points="80,70 50,88 50,52" fill="#94A3B8"/>
    {/* Big nose */}
    <Tri points="38,50 62,50 50,62" fill="#475569" sw={2}/>
    <Tri points="42,52 58,52 50,58" fill="#64748B" sw={0}/>
    {/* Eyes */}
    <Tri points="30,40 40,40 35,48" fill="#000000" sw={0}/>
    <Tri points="60,40 70,40 65,48" fill="#000000" sw={0}/>
  </AnimalSVG>
);

// ── Deer ──────────────────────────────────────────────────────────────────────
export const Deer = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Left antler — branching triangles */}
    <Tri points="36,20 20,2 26,20" fill="#92400E"/>
    <Tri points="36,20 14,12 24,20" fill="#92400E"/>
    <Tri points="32,16 26,4 36,12" fill="#7A3508" sw={1.5}/>
    {/* Right antler */}
    <Tri points="64,20 80,2 74,20" fill="#92400E"/>
    <Tri points="64,20 86,12 76,20" fill="#92400E"/>
    <Tri points="68,16 74,4 64,12" fill="#7A3508" sw={1.5}/>
    {/* Face — 4 triangles */}
    <Tri points="50,18 80,48 50,52" fill="#D97706"/>
    <Tri points="50,18 20,48 50,52" fill="#C06B05"/>
    <Tri points="20,48 50,86 50,52" fill="#D97706"/>
    <Tri points="80,48 50,86 50,52" fill="#C06B05"/>
    {/* Chin */}
    <Tri points="36,66 64,66 50,84" fill="#FDE68A" sw={1.5}/>
    {/* Spots — small light triangles */}
    <Tri points="34,34 42,34 38,40" fill="#F59E0B" sw={0}/>
    <Tri points="58,34 66,34 62,40" fill="#F59E0B" sw={0}/>
    {/* Eyes */}
    <Tri points="32,44 40,44 36,52" fill="#000000" sw={0}/>
    <Tri points="60,44 68,44 64,52" fill="#000000" sw={0}/>
    {/* Nose */}
    <Tri points="46,68 54,68 50,74" fill="#92400E" sw={0}/>
  </AnimalSVG>
);

// ── Whale ─────────────────────────────────────────────────────────────────────
export const Whale = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size} viewBox="0 0 120 80">
    {/* Tail fluke */}
    <Tri points="100,35 118,18 110,35" fill="#2563EB"/>
    <Tri points="100,35 118,52 110,35" fill="#1D4ED8"/>
    {/* Body — 6 triangles forming oval */}
    <Tri points="55,10 100,35 55,38" fill="#3B82F6"/>
    <Tri points="55,10 10,35 55,38" fill="#2563EB"/>
    <Tri points="10,35 55,66 55,38" fill="#3B82F6"/>
    <Tri points="100,35 55,66 55,38" fill="#2563EB"/>
    <Tri points="10,35 10,45 55,38" fill="#3576E0"/>
    <Tri points="100,35 100,45 55,38" fill="#2A62CC"/>
    {/* Belly */}
    <Tri points="20,42 55,42 38,62" fill="#BFDBFE" sw={1.5}/>
    <Tri points="55,42 72,42 55,62" fill="#D1E6FD" sw={1.5}/>
    {/* Dorsal fin */}
    <Tri points="58,10 48,26 68,26" fill="#2563EB"/>
    {/* Pectoral fin */}
    <Tri points="30,48 14,62 28,56" fill="#2563EB"/>
    {/* Eye */}
    <Tri points="18,28 30,28 24,36" fill="#FFFFFF" sw={1.5}/>
    <Tri points="22,30 28,30 24,34" fill="#000000" sw={0}/>
    {/* Spout — small upward triangles */}
    <Tri points="16,16 20,16 18,6" fill="#93C5FD" sw={1}/>
    <Tri points="22,14 26,14 24,4" fill="#93C5FD" sw={1}/>
  </AnimalSVG>
);

// ── Crane ─────────────────────────────────────────────────────────────────────
export const Crane = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Left wing — 2 triangles */}
    <Tri points="50,42 4,24 18,52" fill="#E0F2FE"/>
    <Tri points="50,42 4,24 22,30" fill="#BAE6FD"/>
    {/* Right wing */}
    <Tri points="50,42 96,24 82,52" fill="#E0F2FE"/>
    <Tri points="50,42 96,24 78,30" fill="#BAE6FD"/>
    {/* Body — diamond as 2 triangles */}
    <Tri points="50,42 18,52 50,76" fill="#BAE6FD"/>
    <Tri points="50,42 82,52 50,76" fill="#A8D8F8"/>
    {/* Neck — thin tall triangle */}
    <Tri points="46,42 54,42 50,18" fill="#E0F2FE"/>
    {/* Head */}
    <Tri points="40,18 60,18 50,6" fill="#E0F2FE"/>
    <Tri points="40,18 60,18 50,22" fill="#D0E8FA" sw={1.5}/>
    {/* Beak */}
    <Tri points="50,8 58,14 50,18" fill="#F59E0B" sw={1.5}/>
    {/* Eye */}
    <Tri points="44,12 48,12 46,16" fill="#000000" sw={0}/>
    {/* Tail feathers */}
    <Tri points="50,76 42,92 50,82" fill="#E0F2FE"/>
    <Tri points="50,76 58,92 50,82" fill="#BAE6FD"/>
  </AnimalSVG>
);

// ── Dragon ────────────────────────────────────────────────────────────────────
export const Dragon = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Left wing — 2 triangles */}
    <Tri points="50,36 8,6 16,50" fill="#10B981"/>
    <Tri points="50,36 8,6 24,18" fill="#34D399"/>
    {/* Right wing */}
    <Tri points="50,36 92,6 84,50" fill="#10B981"/>
    <Tri points="50,36 92,6 76,18" fill="#34D399"/>
    {/* Body — 4 triangles */}
    <Tri points="50,10 82,44 50,44" fill="#10B981"/>
    <Tri points="50,10 18,44 50,44" fill="#0D9668"/>
    <Tri points="18,44 50,88 50,44" fill="#10B981"/>
    <Tri points="82,44 50,88 50,44" fill="#0D9668"/>
    {/* Horns */}
    <Tri points="36,18 28,2 42,14" fill="#059669"/>
    <Tri points="64,18 72,2 58,14" fill="#059669"/>
    {/* Spine ridge triangles */}
    <Tri points="46,10 54,10 50,20" fill="#059669" sw={1.5}/>
    <Tri points="46,24 54,24 50,34" fill="#059669" sw={1.5}/>
    {/* Eyes — golden with slit pupils */}
    <Tri points="30,38 44,38 37,48" fill="#FCD34D" sw={1.5}/>
    <Tri points="56,38 70,38 63,48" fill="#FCD34D" sw={1.5}/>
    <Tri points="35,40 39,40 37,46" fill="#000000" sw={0}/>
    <Tri points="61,40 65,40 63,46" fill="#000000" sw={0}/>
    {/* Fire breath */}
    <Tri points="40,84 60,84 50,100" fill="#FF3333"/>
    <Tri points="44,86 56,86 50,98" fill="#FFDD00" sw={0}/>
  </AnimalSVG>
);

// ── Octopus ───────────────────────────────────────────────────────────────────
export const Octopus = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Tentacles — chains of small triangles */}
    <Tri points="24,66 14,80 20,80" fill="#EC4899" sw={1.5}/>
    <Tri points="14,80 12,94 20,80" fill="#DB2777" sw={1.5}/>
    <Tri points="32,68 24,84 30,84" fill="#EC4899" sw={1.5}/>
    <Tri points="24,84 22,98 30,84" fill="#DB2777" sw={1.5}/>
    <Tri points="42,70 38,86 44,86" fill="#EC4899" sw={1.5}/>
    <Tri points="38,86 36,100 44,86" fill="#DB2777" sw={1.5}/>
    <Tri points="58,70 56,86 62,86" fill="#EC4899" sw={1.5}/>
    <Tri points="56,86 58,100 62,86" fill="#DB2777" sw={1.5}/>
    <Tri points="68,68 70,84 76,84" fill="#EC4899" sw={1.5}/>
    <Tri points="70,84 72,98 76,84" fill="#DB2777" sw={1.5}/>
    <Tri points="76,66 80,80 86,80" fill="#EC4899" sw={1.5}/>
    <Tri points="80,80 82,94 86,80" fill="#DB2777" sw={1.5}/>
    {/* Head — 6 triangles forming dome */}
    <Tri points="50,8 80,36 50,42" fill="#EC4899"/>
    <Tri points="50,8 20,36 50,42" fill="#DB2777"/>
    <Tri points="20,36 20,62 50,42" fill="#EC4899"/>
    <Tri points="80,36 80,62 50,42" fill="#DB2777"/>
    <Tri points="20,62 50,72 50,42" fill="#F472B6"/>
    <Tri points="80,62 50,72 50,42" fill="#EC4899"/>
    {/* Crown fold */}
    <Tri points="32,16 50,8 50,28" fill="#DB2777" sw={1.5}/>
    <Tri points="68,16 50,8 50,28" fill="#BE185D" sw={1.5}/>
    {/* Eyes — large white triangles */}
    <Tri points="28,36 46,36 37,50" fill="#FFFFFF" sw={1.5}/>
    <Tri points="54,36 72,36 63,50" fill="#FFFFFF" sw={1.5}/>
    {/* Pupils */}
    <Tri points="34,38 42,38 37,46" fill="#000000" sw={0}/>
    <Tri points="58,38 66,38 63,46" fill="#000000" sw={0}/>
  </AnimalSVG>
);

// ── Prize Box (logo icon) ─────────────────────────────────────────────────────
export const PrizeBox = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Box body — 2 triangles */}
    <Tri points="14,48 86,48 14,90" fill="#0033CC"/>
    <Tri points="86,48 86,90 14,90" fill="#002299"/>
    {/* Right side face */}
    <Tri points="86,48 96,40 96,82" fill="#001A73"/>
    <Tri points="86,48 86,90 96,82" fill="#001A73" sw={2}/>
    {/* Ribbon vertical */}
    <Tri points="44,48 56,48 44,90" fill="#FFDD00" sw={1.5}/>
    <Tri points="56,48 56,90 44,90" fill="#E6C700" sw={1.5}/>
    {/* Ribbon horizontal */}
    <Tri points="14,60 86,60 14,68" fill="#FFDD00" sw={1}/>
    <Tri points="86,60 86,68 14,68" fill="#E6C700" sw={1}/>
    {/* Lid — 2 triangles */}
    <Tri points="10,38 90,38 50,24" fill="#3366FF"/>
    <Tri points="10,38 90,38 50,48" fill="#0033CC" sw={2}/>
    {/* Lid right face */}
    <Tri points="90,38 100,30 100,42" fill="#002299"/>
    {/* Bow — 2 triangles */}
    <Tri points="38,32 50,24 44,38" fill="#FCD34D"/>
    <Tri points="62,32 50,24 56,38" fill="#FCD34D"/>
    {/* Bow center */}
    <Tri points="46,28 54,28 50,34" fill="#FFDD00" sw={1.5}/>
  </AnimalSVG>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMAL REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

export const ANIMALS = [
  { id: "fox",       name: "Fox",       Component: Fox,       choreThreshold: 0,   color: "#E8621A", free: true  },
  { id: "panda",     name: "Panda",     Component: Panda,     choreThreshold: 0,   color: "#2D2D3A", free: true  },
  { id: "butterfly", name: "Butterfly", Component: Butterfly, choreThreshold: 0,   color: "#9B5DE5", free: true  },
  { id: "frog",      name: "Frog",      Component: Frog,      choreThreshold: 0,   color: "#3EBD6E", free: true  },
  { id: "bear",      name: "Bear",      Component: Bear,      choreThreshold: 10,  color: "#A78BFA"              },
  { id: "tiger",     name: "Tiger",     Component: Tiger,     choreThreshold: 25,  color: "#F97316"              },
  { id: "owl",       name: "Owl",       Component: Owl,       choreThreshold: 50,  color: "#3B82F6"              },
  { id: "penguin",   name: "Penguin",   Component: Penguin,   choreThreshold: 100, color: "#1E293B"              },
  { id: "koala",     name: "Koala",     Component: Koala,     choreThreshold: 150, color: "#94A3B8"              },
  { id: "deer",      name: "Deer",      Component: Deer,      choreThreshold: 200, color: "#D97706"              },
  { id: "whale",     name: "Whale",     Component: Whale,     choreThreshold: 300, color: "#3B82F6"              },
  { id: "crane",     name: "Crane",     Component: Crane,     choreThreshold: 400, color: "#0EA5E9"              },
  { id: "dragon",    name: "Dragon",    Component: Dragon,    choreThreshold: 500, color: "#10B981"              },
  { id: "octopus",   name: "Octopus",   Component: Octopus,   choreThreshold: 750, color: "#EC4899"              },
];

export const getAnimal = (id) =>
  ANIMALS.find(a => a.id === id) || ANIMALS[0];

export const unlockedAnimals = (totalChores) =>
  ANIMALS.filter(a => a.choreThreshold <= totalChores);

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS — Pop-art geometric style
// ═══════════════════════════════════════════════════════════════════════════════

// ── Loading screen ────────────────────────────────────────────────────────────
export const LoadingScreen = ({ message = "Loading…" }) => (
  <div style={{
    minHeight: "100vh", background: "#F5F5F5",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 20, fontFamily: "'Nunito', sans-serif",
  }}>
    <style>{fontCSS}</style>
    <div style={{ animation: "bounce 1.2s ease-in-out infinite" }}>
      <PrizeBox size={80}/>
    </div>
    <div style={{
      fontFamily: "'Fredoka One', cursive", fontSize: 18, color: "#111111",
    }}>{message}</div>
    <div style={{ display: "flex", gap: 8 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 0, height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderBottom: `12px solid ${["#EF4444", "#FFDD00", "#10B981"][i]}`,
          animation: `bounce 0.8s ${i * 0.2}s ease-in-out infinite`,
        }}/>
      ))}
    </div>
  </div>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 32, color = T.purple }) => (
  <div style={{
    width: size, height: size, border: `4px solid ${color}33`,
    borderTop: `4px solid ${color}`,
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  }}/>
);

// ── Toast notification ────────────────────────────────────────────────────────
export const Toast = ({ msg }) => {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%",
      transform: "translateX(-50%)",
      background: T.ink, color: "#FFFFFF",
      border: "3px solid #000000",
      borderRadius: 50,
      padding: "12px 24px",
      fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15,
      zIndex: 9999,
      boxShadow: "5px 5px 0 #000000",
      animation: "pop 0.3s ease",
      whiteSpace: "nowrap",
    }}>
      {msg}
    </div>
  );
};

// ── Confetti burst ────────────────────────────────────────────────────────────
export const Confetti = ({ active }) => {
  if (!active) return null;
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    color: [T.red, T.sunshine, T.green, T.purple, T.orange, T.pink, T.blue][i % 7],
    delay: `${Math.random() * 0.5}s`,
    size: 8 + Math.random() * 10,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998, overflow: "hidden" }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute", top: "-20px", left: p.left,
          width: 0, height: 0,
          borderLeft: `${p.size / 2}px solid transparent`,
          borderRight: `${p.size / 2}px solid transparent`,
          borderBottom: `${p.size}px solid ${p.color}`,
          animation: `confetti 1.8s ${p.delay} ease-in forwards`,
        }}/>
      ))}
    </div>
  );
};

// ── Triangle field (floating geometric triangles) ─────────────────────────────
export const StarField = ({ count = 20 }) => {
  const tris = Array.from({ length: count }, (_, i) => ({
    left:    `${Math.random() * 100}%`,
    top:     `${Math.random() * 100}%`,
    size:    6 + Math.random() * 8,
    color:   [T.sunshine, T.orange, T.coral, T.purple, T.green][i % 5],
    delay:   `${Math.random() * 4}s`,
    opacity: 0.15 + Math.random() * 0.2,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {tris.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: s.left, top: s.top,
          width: 0, height: 0,
          borderLeft: `${s.size / 2}px solid transparent`,
          borderRight: `${s.size / 2}px solid transparent`,
          borderBottom: `${s.size}px solid ${s.color}`,
          opacity: s.opacity,
          animation: `float ${3 + Math.random() * 3}s ${s.delay} ease-in-out infinite`,
        }}/>
      ))}
    </div>
  );
};

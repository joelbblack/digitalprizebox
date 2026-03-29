// ─── src/lib/animals.jsx ─────────────────────────────────────────────────────
// Origami folded-paper SVG animals.
// Each animal is built from flat polygon faces + dashed crease/fold lines.
// No gradients. No blur. Sharp geometric planes. Saturday Morning Cartoon style.
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

// ── Crease line (dashed fold mark) ────────────────────────────────────────────
const Crease = ({ x1, y1, x2, y2, opacity = 0.5 }) => (
  <line
    x1={x1} y1={y1} x2={x2} y2={y2}
    stroke="#1A0A00" strokeWidth="1.2"
    strokeDasharray="3,2.5"
    opacity={opacity}
  />
);

// ═══════════════════════════════════════════════════════════════════════════════
// ORIGAMI ANIMALS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Fox ───────────────────────────────────────────────────────────────────────
export const Fox = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Ears — sharp origami triangles */}
    <polygon points="14,52 26,20 40,52" fill="#E8621A" stroke="#1A0A00" strokeWidth="2.5" strokeLinejoin="round"/>
    <polygon points="60,52 74,20 86,52" fill="#E8621A" stroke="#1A0A00" strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Inner ear fold plane */}
    <polygon points="18,50 26,26 36,50" fill="#F9A875"/>
    <polygon points="64,50 74,26 82,50" fill="#F9A875"/>
    {/* Main face diamond */}
    <polygon points="50,16 84,52 50,84 16,52" fill="#E8621A" stroke="#1A0A00" strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Fold crease lines */}
    <Crease x1="50" y1="16" x2="50" y2="84"/>
    <Crease x1="16" y1="52" x2="84" y2="52"/>
    {/* White muzzle fold planes */}
    <polygon points="16,52 36,52 26,72" fill="#FEF0DC" stroke="#1A0A00" strokeWidth="1.8" strokeLinejoin="round"/>
    <polygon points="64,52 84,52 74,72" fill="#FEF0DC" stroke="#1A0A00" strokeWidth="1.8" strokeLinejoin="round"/>
    <polygon points="50,84 36,52 64,52" fill="#FEF0DC" stroke="#1A0A00" strokeWidth="1.8" strokeLinejoin="round"/>
    {/* Eyes */}
    <circle cx="37" cy="46" r="5.5" fill="#1A0A00"/>
    <circle cx="63" cy="46" r="5.5" fill="#1A0A00"/>
    <circle cx="38.8" cy="44.5" r="2" fill="white"/>
    <circle cx="64.8" cy="44.5" r="2" fill="white"/>
    {/* Nose */}
    <ellipse cx="50" cy="64" rx="4.5" ry="3.5" fill="#1A0A00"/>
  </AnimalSVG>
);

// ── Panda ─────────────────────────────────────────────────────────────────────
export const Panda = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Ears */}
    <circle cx="27" cy="22" r="14" fill="#2D2D3A" stroke="#1A0A00" strokeWidth="2.5"/>
    <circle cx="73" cy="22" r="14" fill="#2D2D3A" stroke="#1A0A00" strokeWidth="2.5"/>
    {/* Main face */}
    <circle cx="50" cy="54" r="34" fill="#F8F8F8" stroke="#1A0A00" strokeWidth="2.5"/>
    {/* Fold crease */}
    <Crease x1="16" y1="54" x2="84" y2="54" opacity={0.3}/>
    <Crease x1="50" y1="20" x2="50" y2="88" opacity={0.3}/>
    {/* Eye patches — flat dark planes */}
    <ellipse cx="36" cy="47" rx="12" ry="10" fill="#2D2D3A" stroke="#1A0A00" strokeWidth="1.5"/>
    <ellipse cx="64" cy="47" rx="12" ry="10" fill="#2D2D3A" stroke="#1A0A00" strokeWidth="1.5"/>
    {/* Eyes */}
    <circle cx="36" cy="47" r="5.5" fill="white"/>
    <circle cx="64" cy="47" r="5.5" fill="white"/>
    <circle cx="36" cy="47" r="3.5" fill="#1A0A00"/>
    <circle cx="64" cy="47" r="3.5" fill="#1A0A00"/>
    <circle cx="37.2" cy="45.8" r="1.3" fill="white"/>
    <circle cx="65.2" cy="45.8" r="1.3" fill="white"/>
    {/* Muzzle */}
    <ellipse cx="50" cy="62" rx="12" ry="9" fill="#F0F0F0" stroke="#1A0A00" strokeWidth="1.5"/>
    <ellipse cx="50" cy="59" rx="5" ry="4" fill="#2D2D3A"/>
    <path d="M 45 64 Q 50 70 55 64" stroke="#2D2D3A" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </AnimalSVG>
);

// ── Butterfly ─────────────────────────────────────────────────────────────────
export const Butterfly = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Upper wings — flat origami folds */}
    <polygon points="50,46 6,10 8,54" fill="#9B5DE5" stroke="#1A0A00" strokeWidth="2.5" strokeLinejoin="round"/>
    <polygon points="50,46 94,10 92,54" fill="#9B5DE5" stroke="#1A0A00" strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Wing fold planes */}
    <polygon points="50,46 8,14 12,42" fill="#C77DFF"/>
    <polygon points="50,46 92,14 88,42" fill="#C77DFF"/>
    {/* Lower wings */}
    <polygon points="50,56 8,56 20,86" fill="#C77DFF" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    <polygon points="50,56 92,56 80,86" fill="#C77DFF" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    {/* Wing crease lines */}
    <Crease x1="50" y1="46" x2="10" y2="20"/>
    <Crease x1="50" y1="46" x2="90" y2="20"/>
    {/* Wing spots */}
    <circle cx="24" cy="30" r="8" fill="#FFE600" stroke="#1A0A00" strokeWidth="1.5"/>
    <circle cx="76" cy="30" r="8" fill="#FFE600" stroke="#1A0A00" strokeWidth="1.5"/>
    {/* Body */}
    <ellipse cx="50" cy="51" rx="4.5" ry="22" fill="#1A0A00" stroke="#1A0A00" strokeWidth="1"/>
    {/* Antennae */}
    <line x1="48" y1="30" x2="36" y2="14" stroke="#1A0A00" strokeWidth="2" strokeLinecap="round"/>
    <line x1="52" y1="30" x2="64" y2="14" stroke="#1A0A00" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="36" cy="14" r="3.5" fill="#9B5DE5" stroke="#1A0A00" strokeWidth="1.5"/>
    <circle cx="64" cy="14" r="3.5" fill="#9B5DE5" stroke="#1A0A00" strokeWidth="1.5"/>
  </AnimalSVG>
);

// ── Frog ──────────────────────────────────────────────────────────────────────
export const Frog = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Body diamond */}
    <polygon points="50,14 86,48 50,76 14,48" fill="#3EBD6E" stroke="#1A0A00" strokeWidth="2.5" strokeLinejoin="round"/>
    <Crease x1="50" y1="14" x2="50" y2="76"/>
    <Crease x1="14" y1="48" x2="86" y2="48"/>
    {/* Big round eyes on top */}
    <circle cx="28" cy="34" r="14" fill="#3EBD6E" stroke="#1A0A00" strokeWidth="2.5"/>
    <circle cx="72" cy="34" r="14" fill="#3EBD6E" stroke="#1A0A00" strokeWidth="2.5"/>
    <circle cx="28" cy="34" r="9" fill="white" stroke="#1A0A00" strokeWidth="1.5"/>
    <circle cx="72" cy="34" r="9" fill="white" stroke="#1A0A00" strokeWidth="1.5"/>
    <circle cx="28" cy="34" r="5.5" fill="#1A0A00"/>
    <circle cx="72" cy="34" r="5.5" fill="#1A0A00"/>
    <circle cx="29.5" cy="32.5" r="2" fill="white"/>
    <circle cx="73.5" cy="32.5" r="2" fill="white"/>
    {/* Smile */}
    <path d="M 30 60 Q 50 74 70 60" stroke="#1A0A00" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {/* Belly fold plane */}
    <ellipse cx="50" cy="57" rx="16" ry="11" fill="#A8EDBC" stroke="#1A0A00" strokeWidth="1.5"/>
  </AnimalSVG>
);

// ── Bear ──────────────────────────────────────────────────────────────────────
export const Bear = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Ears */}
    <circle cx="26" cy="22" r="14" fill="#A78BFA" stroke="#1A0A00" strokeWidth="2.5"/>
    <circle cx="74" cy="22" r="14" fill="#A78BFA" stroke="#1A0A00" strokeWidth="2.5"/>
    <circle cx="26" cy="22" r="8" fill="#C4B5FD"/>
    <circle cx="74" cy="22" r="8" fill="#C4B5FD"/>
    {/* Face */}
    <circle cx="50" cy="54" r="33" fill="#A78BFA" stroke="#1A0A00" strokeWidth="2.5"/>
    <Crease x1="17" y1="54" x2="83" y2="54" opacity={0.35}/>
    {/* Muzzle */}
    <ellipse cx="50" cy="64" rx="15" ry="11" fill="#C4B5FD" stroke="#1A0A00" strokeWidth="1.8"/>
    {/* Eyes */}
    <circle cx="37" cy="48" r="6" fill="#1A0A00"/>
    <circle cx="63" cy="48" r="6" fill="#1A0A00"/>
    <circle cx="38.8" cy="46.5" r="2.2" fill="white"/>
    <circle cx="64.8" cy="46.5" r="2.2" fill="white"/>
    {/* Nose & smile */}
    <ellipse cx="50" cy="60" rx="5" ry="4" fill="#1A0A00"/>
    <path d="M 45 65 Q 50 71 55 65" stroke="#1A0A00" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </AnimalSVG>
);

// ── Tiger ─────────────────────────────────────────────────────────────────────
export const Tiger = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Ears */}
    <polygon points="22,50 14,20 38,44" fill="#F97316" stroke="#1A0A00" strokeWidth="2.5" strokeLinejoin="round"/>
    <polygon points="78,50 86,20 62,44" fill="#F97316" stroke="#1A0A00" strokeWidth="2.5" strokeLinejoin="round"/>
    <polygon points="24,48 18,26 34,44" fill="#FDE68A"/>
    <polygon points="76,48 82,26 66,44" fill="#FDE68A"/>
    {/* Face */}
    <polygon points="50,14 86,50 70,82 30,82 14,50" fill="#F97316" stroke="#1A0A00" strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Stripes — flat painted planes */}
    <line x1="34" y1="24" x2="42" y2="38" stroke="#1A0A00" strokeWidth="3.5" strokeLinecap="round"/>
    <line x1="66" y1="24" x2="58" y2="38" stroke="#1A0A00" strokeWidth="3.5" strokeLinecap="round"/>
    <line x1="26" y1="50" x2="36" y2="46" stroke="#1A0A00" strokeWidth="3" strokeLinecap="round"/>
    <line x1="74" y1="50" x2="64" y2="46" stroke="#1A0A00" strokeWidth="3" strokeLinecap="round"/>
    {/* Muzzle fold */}
    <polygon points="50,82 36,58 64,58" fill="#FDE68A" stroke="#1A0A00" strokeWidth="1.8" strokeLinejoin="round"/>
    <Crease x1="50" y1="14" x2="50" y2="82"/>
    {/* Eyes */}
    <ellipse cx="37" cy="47" rx="6" ry="7" fill="#84CC16" stroke="#1A0A00" strokeWidth="1.5"/>
    <ellipse cx="63" cy="47" rx="6" ry="7" fill="#84CC16" stroke="#1A0A00" strokeWidth="1.5"/>
    <ellipse cx="37" cy="47" rx="2.5" ry="5.5" fill="#1A0A00"/>
    <ellipse cx="63" cy="47" rx="2.5" ry="5.5" fill="#1A0A00"/>
    <circle cx="38" cy="45" r="1.3" fill="white"/>
    <circle cx="64" cy="45" r="1.3" fill="white"/>
    <ellipse cx="50" cy="68" rx="5" ry="3.5" fill="#1A0A00"/>
  </AnimalSVG>
);

// ── Owl ───────────────────────────────────────────────────────────────────────
export const Owl = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Wings — flat side planes */}
    <polygon points="20,40 4,58 14,74" fill="#1D4ED8" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    <polygon points="80,40 96,58 86,74" fill="#1D4ED8" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    {/* Body */}
    <polygon points="50,92 14,72 20,38 50,26 80,38 86,72" fill="#3B82F6" stroke="#1A0A00" strokeWidth="2.5" strokeLinejoin="round"/>
    <Crease x1="50" y1="26" x2="50" y2="92"/>
    <Crease x1="14" y1="72" x2="86" y2="72" opacity={0.4}/>
    {/* Ear tufts */}
    <polygon points="34,30 28,8" stroke="#1A0A00" strokeWidth="0" fill="none"/>
    <polygon points="36,28 28,8 42,22" fill="#1D4ED8" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    <polygon points="64,28 72,8 58,22" fill="#1D4ED8" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    {/* Belly fold */}
    <ellipse cx="50" cy="66" rx="20" ry="24" fill="#BFDBFE" stroke="#1A0A00" strokeWidth="1.5"/>
    {/* Big eyes */}
    <circle cx="38" cy="44" r="13" fill="#FEF3C7" stroke="#1A0A00" strokeWidth="2"/>
    <circle cx="62" cy="44" r="13" fill="#FEF3C7" stroke="#1A0A00" strokeWidth="2"/>
    <circle cx="38" cy="44" r="8" fill="#F59E0B" stroke="#1A0A00" strokeWidth="1"/>
    <circle cx="62" cy="44" r="8" fill="#F59E0B" stroke="#1A0A00" strokeWidth="1"/>
    <circle cx="38" cy="44" r="4.5" fill="#1A0A00"/>
    <circle cx="62" cy="44" r="4.5" fill="#1A0A00"/>
    <circle cx="39.5" cy="42.5" r="1.8" fill="white"/>
    <circle cx="63.5" cy="42.5" r="1.8" fill="white"/>
    {/* Beak */}
    <polygon points="44,52 56,52 50,60" fill="#F59E0B" stroke="#1A0A00" strokeWidth="1.8" strokeLinejoin="round"/>
  </AnimalSVG>
);

// ── Penguin ───────────────────────────────────────────────────────────────────
export const Penguin = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Body */}
    <ellipse cx="50" cy="63" rx="28" ry="32" fill="#1E293B" stroke="#1A0A00" strokeWidth="2.5"/>
    {/* White belly fold plane */}
    <ellipse cx="50" cy="67" rx="17" ry="23" fill="#F8F8F8" stroke="#1A0A00" strokeWidth="1.5"/>
    <Crease x1="50" y1="44" x2="50" y2="90" opacity={0.2}/>
    {/* Head */}
    <circle cx="50" cy="28" r="22" fill="#1E293B" stroke="#1A0A00" strokeWidth="2.5"/>
    {/* Face white fold */}
    <ellipse cx="50" cy="30" rx="13" ry="11" fill="#F8F8F8" stroke="#1A0A00" strokeWidth="1.5"/>
    {/* Eyes */}
    <circle cx="44" cy="25" r="5" fill="white" stroke="#1A0A00" strokeWidth="1"/>
    <circle cx="56" cy="25" r="5" fill="white" stroke="#1A0A00" strokeWidth="1"/>
    <circle cx="44" cy="25" r="3" fill="#1A0A00"/>
    <circle cx="56" cy="25" r="3" fill="#1A0A00"/>
    <circle cx="44.9" cy="24.1" r="1.1" fill="white"/>
    <circle cx="56.9" cy="24.1" r="1.1" fill="white"/>
    {/* Beak */}
    <polygon points="44,33 56,33 50,41" fill="#F59E0B" stroke="#1A0A00" strokeWidth="1.8" strokeLinejoin="round"/>
    {/* Wings */}
    <polygon points="22,52 10,68 22,80" fill="#1E293B" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    <polygon points="78,52 90,68 78,80" fill="#1E293B" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    {/* Feet */}
    <ellipse cx="40" cy="93" rx="10" ry="5" fill="#F59E0B" stroke="#1A0A00" strokeWidth="1.5"/>
    <ellipse cx="60" cy="93" rx="10" ry="5" fill="#F59E0B" stroke="#1A0A00" strokeWidth="1.5"/>
  </AnimalSVG>
);

// ── Koala ─────────────────────────────────────────────────────────────────────
export const Koala = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Big fluffy ears */}
    <circle cx="21" cy="24" r="19" fill="#94A3B8" stroke="#1A0A00" strokeWidth="2.5"/>
    <circle cx="79" cy="24" r="19" fill="#94A3B8" stroke="#1A0A00" strokeWidth="2.5"/>
    <circle cx="21" cy="24" r="12" fill="#CBD5E1"/>
    <circle cx="79" cy="24" r="12" fill="#CBD5E1"/>
    {/* Face */}
    <circle cx="50" cy="56" r="32" fill="#94A3B8" stroke="#1A0A00" strokeWidth="2.5"/>
    <Crease x1="18" y1="56" x2="82" y2="56" opacity={0.3}/>
    {/* Big nose */}
    <ellipse cx="50" cy="55" rx="13" ry="10" fill="#475569" stroke="#1A0A00" strokeWidth="2"/>
    <ellipse cx="50" cy="53" rx="9" ry="6" fill="#64748B"/>
    {/* Eyes */}
    <circle cx="35" cy="46" r="6.5" fill="#1A0A00"/>
    <circle cx="65" cy="46" r="6.5" fill="#1A0A00"/>
    <circle cx="36.8" cy="44.5" r="2.3" fill="white"/>
    <circle cx="66.8" cy="44.5" r="2.3" fill="white"/>
    {/* Smile */}
    <path d="M 42 66 Q 50 72 58 66" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  </AnimalSVG>
);

// ── Deer ──────────────────────────────────────────────────────────────────────
export const Deer = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Antlers — origami branch shapes */}
    <line x1="36" y1="18" x2="22" y2="4" stroke="#92400E" strokeWidth="4.5" strokeLinecap="round"/>
    <line x1="36" y1="18" x2="16" y2="14" stroke="#92400E" strokeWidth="4" strokeLinecap="round"/>
    <line x1="36" y1="18" x2="28" y2="6" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round"/>
    <line x1="64" y1="18" x2="78" y2="4" stroke="#92400E" strokeWidth="4.5" strokeLinecap="round"/>
    <line x1="64" y1="18" x2="84" y2="14" stroke="#92400E" strokeWidth="4" strokeLinecap="round"/>
    <line x1="64" y1="18" x2="72" y2="6" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round"/>
    {/* Face polygon */}
    <polygon points="50,18 80,48 68,80 50,86 32,80 20,48" fill="#D97706" stroke="#1A0A00" strokeWidth="2.5" strokeLinejoin="round"/>
    <Crease x1="50" y1="18" x2="50" y2="86"/>
    {/* White chin fold */}
    <ellipse cx="50" cy="74" rx="14" ry="10" fill="#FDE68A" stroke="#1A0A00" strokeWidth="1.8"/>
    {/* Spots */}
    <circle cx="38" cy="38" r="3.5" fill="#F59E0B" opacity="0.6"/>
    <circle cx="62" cy="38" r="3.5" fill="#F59E0B" opacity="0.6"/>
    {/* Eyes */}
    <circle cx="36" cy="46" r="6.5" fill="#1A0A00"/>
    <circle cx="64" cy="46" r="6.5" fill="#1A0A00"/>
    <circle cx="37.8" cy="44.5" r="2.3" fill="white"/>
    <circle cx="65.8" cy="44.5" r="2.3" fill="white"/>
    <ellipse cx="50" cy="68" rx="5" ry="3.5" fill="#92400E"/>
  </AnimalSVG>
);

// ── Whale ─────────────────────────────────────────────────────────────────────
export const Whale = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size} viewBox="0 0 120 80">
    {/* Tail fluke — flat origami fold */}
    <polygon points="100,35 118,18 118,52 100,35" fill="#2563EB" stroke="#1A0A00" strokeWidth="2.5" strokeLinejoin="round"/>
    <Crease x1="100" y1="35" x2="118" y2="35" opacity={0.4}/>
    {/* Body */}
    <ellipse cx="55" cy="38" rx="48" ry="28" fill="#3B82F6" stroke="#1A0A00" strokeWidth="2.5"/>
    <Crease x1="8" y1="38" x2="102" y2="38" opacity={0.35}/>
    {/* Belly fold plane */}
    <ellipse cx="52" cy="44" rx="32" ry="16" fill="#BFDBFE" stroke="#1A0A00" strokeWidth="1.5"/>
    {/* Dorsal fin */}
    <polygon points="58,10 48,26 68,26" fill="#2563EB" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    {/* Pectoral fin */}
    <polygon points="30,48 14,62 28,58" fill="#2563EB" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    {/* Eye */}
    <circle cx="22" cy="32" r="7" fill="white" stroke="#1A0A00" strokeWidth="1.8"/>
    <circle cx="22" cy="32" r="4" fill="#1A0A00"/>
    <circle cx="23.2" cy="30.8" r="1.5" fill="white"/>
    {/* Smile */}
    <path d="M 14 40 Q 24 48 34 42" stroke="#1A0A00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Spout */}
    <path d="M 18 18 Q 14 8 18 4 M 22 16 Q 22 6 26 2 M 26 18 Q 30 8 28 3" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
  </AnimalSVG>
);

// ── Dragon ────────────────────────────────────────────────────────────────────
export const Dragon = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Wings — dramatic origami folds */}
    <polygon points="50,36 8,6 16,50" fill="#10B981" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    <polygon points="50,36 92,6 84,50" fill="#10B981" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    {/* Wing fold planes */}
    <polygon points="50,36 10,10 14,38" fill="#34D399"/>
    <polygon points="50,36 90,10 86,38" fill="#34D399"/>
    <Crease x1="50" y1="36" x2="10" y2="14"/>
    <Crease x1="50" y1="36" x2="90" y2="14"/>
    {/* Body */}
    <polygon points="50,10 82,44 72,80 50,88 28,80 18,44" fill="#10B981" stroke="#1A0A00" strokeWidth="2.5" strokeLinejoin="round"/>
    <Crease x1="50" y1="10" x2="50" y2="88"/>
    {/* Horns */}
    <polygon points="36,20 28,2 40,16" fill="#059669" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    <polygon points="64,20 72,2 60,16" fill="#059669" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    {/* Spine ridge */}
    <polygon points="50,10 54,22 50,18 46,22" fill="#059669" stroke="#1A0A00" strokeWidth="1.5" strokeLinejoin="round"/>
    <polygon points="50,24 54,34 50,30 46,34" fill="#059669" stroke="#1A0A00" strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Eyes — slit pupils */}
    <ellipse cx="37" cy="44" rx="6.5" ry="7.5" fill="#FCD34D" stroke="#1A0A00" strokeWidth="1.5"/>
    <ellipse cx="63" cy="44" rx="6.5" ry="7.5" fill="#FCD34D" stroke="#1A0A00" strokeWidth="1.5"/>
    <ellipse cx="37" cy="44" rx="2.2" ry="5.5" fill="#1A0A00"/>
    <ellipse cx="63" cy="44" rx="2.2" ry="5.5" fill="#1A0A00"/>
    <circle cx="37.8" cy="42" r="1.2" fill="white"/>
    <circle cx="63.8" cy="42" r="1.2" fill="white"/>
    {/* Fire breath! */}
    <polygon points="40,84 50,100 60,84 50,90" fill="#FF4E1A" stroke="#1A0A00" strokeWidth="1.8" strokeLinejoin="round"/>
    <polygon points="44,88 50,102 56,88" fill="#FFE600"/>
  </AnimalSVG>
);

// ── Octopus ───────────────────────────────────────────────────────────────────
export const Octopus = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Tentacles — flat curved origami folds */}
    <path d="M 28,66 Q 16,76 18,90" stroke="#EC4899" strokeWidth="9" fill="none" strokeLinecap="round"/>
    <path d="M 36,70 Q 28,82 26,96" stroke="#EC4899" strokeWidth="9" fill="none" strokeLinecap="round"/>
    <path d="M 44,72 Q 42,84 40,98" stroke="#EC4899" strokeWidth="9" fill="none" strokeLinecap="round"/>
    <path d="M 56,72 Q 58,84 60,98" stroke="#EC4899" strokeWidth="9" fill="none" strokeLinecap="round"/>
    <path d="M 64,70 Q 72,82 74,96" stroke="#EC4899" strokeWidth="9" fill="none" strokeLinecap="round"/>
    <path d="M 72,66 Q 84,76 82,90" stroke="#EC4899" strokeWidth="9" fill="none" strokeLinecap="round"/>
    {/* Tentacle outlines */}
    <path d="M 28,66 Q 16,76 18,90" stroke="#1A0A00" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M 36,70 Q 28,82 26,96" stroke="#1A0A00" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M 44,72 Q 42,84 40,98" stroke="#1A0A00" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M 56,72 Q 58,84 60,98" stroke="#1A0A00" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M 64,70 Q 72,82 74,96" stroke="#1A0A00" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M 72,66 Q 84,76 82,90" stroke="#1A0A00" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Mantle (head) */}
    <ellipse cx="50" cy="42" rx="30" ry="34" fill="#EC4899" stroke="#1A0A00" strokeWidth="2.5"/>
    <Crease x1="50" y1="8" x2="50" y2="76" opacity={0.4}/>
    {/* Mantle top fold */}
    <ellipse cx="50" cy="22" rx="20" ry="14" fill="#DB2777" stroke="#1A0A00" strokeWidth="2"/>
    {/* Eyes */}
    <circle cx="37" cy="44" r="9" fill="white" stroke="#1A0A00" strokeWidth="2"/>
    <circle cx="63" cy="44" r="9" fill="white" stroke="#1A0A00" strokeWidth="2"/>
    <circle cx="37" cy="44" r="5.5" fill="#1A0A00"/>
    <circle cx="63" cy="44" r="5.5" fill="#1A0A00"/>
    <circle cx="38.5" cy="42.5" r="2" fill="white"/>
    <circle cx="64.5" cy="42.5" r="2" fill="white"/>
  </AnimalSVG>
);

// ── Crane ─────────────────────────────────────────────────────────────────────
export const Crane = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Wings — the classic origami crane fold */}
    <polygon points="50,42 4,24 18,52" fill="#E0F2FE" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    <polygon points="50,42 96,24 82,52" fill="#E0F2FE" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    {/* Wing crease lines — essential origami detail */}
    <Crease x1="50" y1="42" x2="8" y2="26"/>
    <Crease x1="50" y1="42" x2="92" y2="26"/>
    <Crease x1="18" y1="52" x2="50" y2="42"/>
    <Crease x1="82" y1="52" x2="50" y2="42"/>
    {/* Body fold */}
    <polygon points="50,42 18,52 50,76 82,52" fill="#BAE6FD" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    <Crease x1="50" y1="42" x2="50" y2="76"/>
    {/* Neck */}
    <line x1="50" y1="42" x2="50" y2="18" stroke="#E0F2FE" strokeWidth="7" strokeLinecap="round"/>
    <line x1="50" y1="42" x2="50" y2="18" stroke="#1A0A00" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Head */}
    <circle cx="50" cy="14" r="9" fill="#E0F2FE" stroke="#1A0A00" strokeWidth="2"/>
    {/* Beak */}
    <polygon points="50,8 56,14 50,18" fill="#F59E0B" stroke="#1A0A00" strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Eye */}
    <circle cx="47" cy="13" r="3" fill="#1A0A00"/>
    <circle cx="47.8" cy="12.2" r="1.1" fill="white"/>
    {/* Tail */}
    <polygon points="50,76 42,90 50,82 58,90" fill="#E0F2FE" stroke="#1A0A00" strokeWidth="1.8" strokeLinejoin="round"/>
    <Crease x1="50" y1="76" x2="50" y2="90"/>
  </AnimalSVG>
);

// ── Prize Box (logo icon) ─────────────────────────────────────────────────────
export const PrizeBox = ({ size = 64, animate = false }) => (
  <AnimalSVG size={size}>
    {/* Box body */}
    <polygon points="14,48 50,38 86,48 86,90 14,90" fill="#7B2FFF" stroke="#1A0A00" strokeWidth="3" strokeLinejoin="round"/>
    {/* Right side face */}
    <polygon points="86,48 86,90 96,82 96,40" fill="#5B21B6" stroke="#1A0A00" strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Bottom face */}
    <polygon points="14,90 86,90 96,82 24,82" fill="#6D28D9" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    {/* Ribbon vertical */}
    <polygon points="44,38 56,38 58,90 42,90" fill="#FFE600" stroke="#1A0A00" strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Ribbon horizontal */}
    <polygon points="14,60 86,60 86,68 14,68" fill="#FFE600" stroke="#1A0A00" strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Lid */}
    <polygon points="10,38 50,24 90,38 86,48 50,38 14,48" fill="#A78BFA" stroke="#1A0A00" strokeWidth="3" strokeLinejoin="round"/>
    {/* Lid right face */}
    <polygon points="90,38 90,48 100,42 100,30" fill="#7B2FFF" stroke="#1A0A00" strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Bow */}
    <polygon points="38,32 50,24 44,38" fill="#FCD34D" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    <polygon points="62,32 50,24 56,38" fill="#FCD34D" stroke="#1A0A00" strokeWidth="2" strokeLinejoin="round"/>
    <circle cx="50" cy="30" r="6" fill="#FFE600" stroke="#1A0A00" strokeWidth="2"/>
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
// SHARED UI COMPONENTS — Saturday Morning Cartoon style
// ═══════════════════════════════════════════════════════════════════════════════

// ── Loading screen ────────────────────────────────────────────────────────────
export const LoadingScreen = ({ message = "Loading…" }) => (
  <div style={{
    minHeight: "100vh", background: T.bg,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 20, fontFamily: T.body,
  }}>
    <style>{fontCSS}</style>
    <div style={{ animation: "bounce 1.2s ease-in-out infinite" }}>
      <PrizeBox size={80}/>
    </div>
    <div style={{
      fontFamily: T.display, fontSize: 18, color: T.ink,
    }}>{message}</div>
    <div style={{ display: "flex", gap: 8 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 12, height: 12, borderRadius: "50%",
          background: [T.red, T.yellow, T.green][i],
          border: T.outlineThin,
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
      background: T.ink, color: "white",
      border: T.outline,
      borderRadius: T.pill,
      padding: "12px 24px",
      fontFamily: T.body, fontWeight: 800, fontSize: 15,
      zIndex: 9999,
      boxShadow: T.shadow,
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
    color: [T.red, T.yellow, T.green, T.purple, T.orange, T.pink, T.blue][i % 7],
    delay: `${Math.random() * 0.5}s`,
    size: `${8 + Math.random() * 10}px`,
    shape: Math.random() > 0.5 ? "50%" : "2px",
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998, overflow: "hidden" }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute", top: "-20px", left: p.left,
          width: p.size, height: p.size,
          background: p.color,
          borderRadius: p.shape,
          border: "2px solid #1A0A00",
          animation: `confetti 1.8s ${p.delay} ease-in forwards`,
        }}/>
      ))}
    </div>
  );
};

// ── Star field (floating paper stars on cream bg) ─────────────────────────────
export const StarField = ({ count = 20 }) => {
  const stars = Array.from({ length: count }, (_, i) => ({
    left:    `${Math.random() * 100}%`,
    top:     `${Math.random() * 100}%`,
    size:    6 + Math.random() * 8,
    color:   [T.yellow, T.orange, T.red, T.purple, T.green][i % 5],
    delay:   `${Math.random() * 4}s`,
    opacity: 0.2 + Math.random() * 0.3,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: s.left, top: s.top,
          width: s.size, height: s.size,
          background: s.color,
          border: "1.5px solid #1A0A0022",
          borderRadius: "2px",
          transform: "rotate(45deg)",
          opacity: s.opacity,
          animation: `float ${3 + Math.random() * 3}s ${s.delay} ease-in-out infinite`,
        }}/>
      ))}
    </div>
  );
};


// ─── Digital Prize Box — Origami Animal System ────────────────────────────────
// Clean geometric flat-fold style matching the design mockup.
// Pure SVG — no emoji dependency. Consistent on every device.
// Kids pick one at signup, unlock more as rewards.
// ─────────────────────────────────────────────────────────────────────────────

export function Fox({ size = 80, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation: animate ? "float 3s ease-in-out infinite" : undefined }}>
      <polygon points="18,52 32,20 42,52" fill="#E8621A" stroke="#1A0A3C" strokeWidth="2.5" strokeLinejoin="round"/>
      <polygon points="58,52 68,20 82,52" fill="#E8621A" stroke="#1A0A3C" strokeWidth="2.5" strokeLinejoin="round"/>
      <polygon points="23,50 32,26 39,50" fill="#F9A875"/>
      <polygon points="61,50 68,26 77,50" fill="#F9A875"/>
      <polygon points="50,18 82,52 50,82 18,52" fill="#E8621A" stroke="#1A0A3C" strokeWidth="2.5" strokeLinejoin="round"/>
      <polygon points="18,52 38,52 28,72" fill="#FEF0DC" stroke="#1A0A3C" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="62,52 82,52 72,72" fill="#FEF0DC" stroke="#1A0A3C" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="50,82 38,52 62,52" fill="#FEF0DC" stroke="#1A0A3C" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="38" cy="46" r="5" fill="#1A0A3C"/>
      <circle cx="62" cy="46" r="5" fill="#1A0A3C"/>
      <circle cx="39.5" cy="44.5" r="1.8" fill="white"/>
      <circle cx="63.5" cy="44.5" r="1.8" fill="white"/>
      <ellipse cx="50" cy="65" rx="4" ry="3" fill="#1A0A3C"/>
    </svg>
  );
}

export function Panda({ size = 80, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation: animate ? "float 3.5s ease-in-out infinite" : undefined }}>
      <circle cx="28" cy="24" r="14" fill="#2D2D3A" stroke="#1A0A3C" strokeWidth="2.5"/>
      <circle cx="72" cy="24" r="14" fill="#2D2D3A" stroke="#1A0A3C" strokeWidth="2.5"/>
      <circle cx="50" cy="54" r="34" fill="#F5F0FF" stroke="#1A0A3C" strokeWidth="2.5"/>
      <ellipse cx="36" cy="46" rx="11" ry="9" fill="#2D2D3A" stroke="#1A0A3C" strokeWidth="1.5"/>
      <ellipse cx="64" cy="46" rx="11" ry="9" fill="#2D2D3A" stroke="#1A0A3C" strokeWidth="1.5"/>
      <circle cx="36" cy="46" r="5" fill="white"/>
      <circle cx="64" cy="46" r="5" fill="white"/>
      <circle cx="36" cy="46" r="3" fill="#1A0A3C"/>
      <circle cx="64" cy="46" r="3" fill="#1A0A3C"/>
      <circle cx="37" cy="45" r="1" fill="white"/>
      <circle cx="65" cy="45" r="1" fill="white"/>
      <ellipse cx="50" cy="63" rx="10" ry="8" fill="#EDE8F8" stroke="none"/>
      <ellipse cx="50" cy="60" rx="5" ry="4" fill="#2D2D3A"/>
      <path d="M 45 64 Q 50 70 55 64" stroke="#2D2D3A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <polygon points="16,88 50,68 84,88" fill="#F5F0FF" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="28,88 50,72 72,88" fill="#2D2D3A" stroke="none"/>
    </svg>
  );
}

export function Butterfly({ size = 80, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation: animate ? "wiggle 2s ease-in-out infinite" : undefined }}>
      <polygon points="50,45 8,12 8,55" fill="#9B5DE5" stroke="#1A0A3C" strokeWidth="2.5" strokeLinejoin="round"/>
      <polygon points="50,45 92,12 92,55" fill="#9B5DE5" stroke="#1A0A3C" strokeWidth="2.5" strokeLinejoin="round"/>
      <polygon points="50,55 10,60 22,88" fill="#C77DFF" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="50,55 90,60 78,88" fill="#C77DFF" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="26" cy="30" r="7" fill="#FFD93D" stroke="#1A0A3C" strokeWidth="1.5"/>
      <circle cx="74" cy="30" r="7" fill="#FFD93D" stroke="#1A0A3C" strokeWidth="1.5"/>
      <circle cx="24" cy="72" r="5" fill="#FFD93D" stroke="#1A0A3C" strokeWidth="1.5"/>
      <circle cx="76" cy="72" r="5" fill="#FFD93D" stroke="#1A0A3C" strokeWidth="1.5"/>
      <ellipse cx="50" cy="50" rx="4" ry="22" fill="#1A0A3C"/>
      <line x1="48" y1="30" x2="35" y2="14" stroke="#1A0A3C" strokeWidth="2" strokeLinecap="round"/>
      <line x1="52" y1="30" x2="65" y2="14" stroke="#1A0A3C" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="35" cy="14" r="3.5" fill="#9B5DE5" stroke="#1A0A3C" strokeWidth="1.5"/>
      <circle cx="65" cy="14" r="3.5" fill="#9B5DE5" stroke="#1A0A3C" strokeWidth="1.5"/>
    </svg>
  );
}

export function Frog({ size = 80, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation: animate ? "bounce 2.5s ease-in-out infinite" : undefined }}>
      <polygon points="50,15 85,45 50,72 15,45" fill="#3EBD6E" stroke="#1A0A3C" strokeWidth="2.5" strokeLinejoin="round"/>
      <circle cx="30" cy="36" r="13" fill="#3EBD6E" stroke="#1A0A3C" strokeWidth="2.5"/>
      <circle cx="70" cy="36" r="13" fill="#3EBD6E" stroke="#1A0A3C" strokeWidth="2.5"/>
      <circle cx="30" cy="36" r="8" fill="white" stroke="#1A0A3C" strokeWidth="1.5"/>
      <circle cx="70" cy="36" r="8" fill="white" stroke="#1A0A3C" strokeWidth="1.5"/>
      <circle cx="30" cy="36" r="5" fill="#1A0A3C"/>
      <circle cx="70" cy="36" r="5" fill="#1A0A3C"/>
      <circle cx="31.5" cy="34.5" r="2" fill="white"/>
      <circle cx="71.5" cy="34.5" r="2" fill="white"/>
      <path d="M 32 60 Q 50 76 68 60" stroke="#1A0A3C" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="50" cy="58" rx="15" ry="10" fill="#A8EDBC" stroke="#1A0A3C" strokeWidth="1.5"/>
      <polygon points="15,45 5,65 22,60" fill="#3EBD6E" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="85,45 95,65 78,60" fill="#3EBD6E" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}

export function Bear({ size = 80, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation: animate ? "float 3.5s ease-in-out infinite" : undefined }}>
      <circle cx="26" cy="22" r="13" fill="#A78BFA" stroke="#1A0A3C" strokeWidth="2.5"/>
      <circle cx="74" cy="22" r="13" fill="#A78BFA" stroke="#1A0A3C" strokeWidth="2.5"/>
      <circle cx="26" cy="22" r="7" fill="#C4B5FD"/>
      <circle cx="74" cy="22" r="7" fill="#C4B5FD"/>
      <circle cx="50" cy="52" r="32" fill="#A78BFA" stroke="#1A0A3C" strokeWidth="2.5"/>
      <ellipse cx="50" cy="63" rx="14" ry="10" fill="#C4B5FD" stroke="#1A0A3C" strokeWidth="1.5"/>
      <circle cx="37" cy="47" r="5.5" fill="#1A0A3C"/>
      <circle cx="63" cy="47" r="5.5" fill="#1A0A3C"/>
      <circle cx="38.5" cy="45.5" r="2" fill="white"/>
      <circle cx="64.5" cy="45.5" r="2" fill="white"/>
      <ellipse cx="50" cy="59" rx="5" ry="4" fill="#1A0A3C"/>
      <path d="M 45 64 Q 50 70 55 64" stroke="#1A0A3C" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function Tiger({ size = 80, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation: animate ? "float 3s ease-in-out infinite" : undefined }}>
      <polygon points="22,38 14,12 36,30" fill="#F97316" stroke="#1A0A3C" strokeWidth="2.5" strokeLinejoin="round"/>
      <polygon points="78,38 86,12 64,30" fill="#F97316" stroke="#1A0A3C" strokeWidth="2.5" strokeLinejoin="round"/>
      <polygon points="24,36 18,16 33,28" fill="#FDE68A"/>
      <polygon points="76,36 82,16 67,28" fill="#FDE68A"/>
      <polygon points="50,15 85,48 70,82 30,82 15,48" fill="#F97316" stroke="#1A0A3C" strokeWidth="2.5" strokeLinejoin="round"/>
      <line x1="35" y1="25" x2="42" y2="38" stroke="#1A0A3C" strokeWidth="3" strokeLinecap="round"/>
      <line x1="65" y1="25" x2="58" y2="38" stroke="#1A0A3C" strokeWidth="3" strokeLinecap="round"/>
      <line x1="28" y1="48" x2="38" y2="44" stroke="#1A0A3C" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="72" y1="48" x2="62" y2="44" stroke="#1A0A3C" strokeWidth="2.5" strokeLinecap="round"/>
      <polygon points="50,82 36,58 64,58" fill="#FDE68A" stroke="#1A0A3C" strokeWidth="1.5" strokeLinejoin="round"/>
      <ellipse cx="37" cy="46" rx="6" ry="7" fill="#84CC16" stroke="#1A0A3C" strokeWidth="1.5"/>
      <ellipse cx="63" cy="46" rx="6" ry="7" fill="#84CC16" stroke="#1A0A3C" strokeWidth="1.5"/>
      <ellipse cx="37" cy="46" rx="2.5" ry="5" fill="#1A0A3C"/>
      <ellipse cx="63" cy="46" rx="2.5" ry="5" fill="#1A0A3C"/>
      <polygon points="50,60 45,65 55,65" fill="#1A0A3C" strokeLinejoin="round"/>
    </svg>
  );
}

export function Owl({ size = 80, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation: animate ? "float 5s ease-in-out infinite" : undefined }}>
      <polygon points="50,92 14,72 20,38 50,28 80,38 86,72" fill="#3B82F6" stroke="#1A0A3C" strokeWidth="2.5" strokeLinejoin="round"/>
      <polygon points="20,38 4,55 14,72" fill="#1D4ED8" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="80,38 96,55 86,72" fill="#1D4ED8" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <ellipse cx="50" cy="66" rx="18" ry="22" fill="#BFDBFE" stroke="#1A0A3C" strokeWidth="1.5"/>
      <polygon points="36,30 30,10 42,24" fill="#1D4ED8" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="64,30 70,10 58,24" fill="#1D4ED8" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="38" cy="42" r="12" fill="#FEF3C7" stroke="#1A0A3C" strokeWidth="2"/>
      <circle cx="62" cy="42" r="12" fill="#FEF3C7" stroke="#1A0A3C" strokeWidth="2"/>
      <circle cx="38" cy="42" r="7" fill="#F59E0B"/>
      <circle cx="62" cy="42" r="7" fill="#F59E0B"/>
      <circle cx="38" cy="42" r="4" fill="#1A0A3C"/>
      <circle cx="62" cy="42" r="4" fill="#1A0A3C"/>
      <circle cx="39.5" cy="40.5" r="1.5" fill="white"/>
      <circle cx="63.5" cy="40.5" r="1.5" fill="white"/>
      <polygon points="45,50 55,50 50,58" fill="#F59E0B" stroke="#1A0A3C" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function Penguin({ size = 80, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation: animate ? "wiggle 3s ease-in-out infinite" : undefined }}>
      <ellipse cx="50" cy="62" rx="28" ry="34" fill="#1A2035" stroke="#1A0A3C" strokeWidth="2.5"/>
      <ellipse cx="50" cy="66" rx="17" ry="24" fill="#F5F0FF"/>
      <circle cx="50" cy="28" r="22" fill="#1A2035" stroke="#1A0A3C" strokeWidth="2.5"/>
      <ellipse cx="50" cy="30" rx="13" ry="11" fill="#F5F0FF"/>
      <circle cx="44" cy="25" r="4.5" fill="white" stroke="#1A0A3C" strokeWidth="1"/>
      <circle cx="56" cy="25" r="4.5" fill="white" stroke="#1A0A3C" strokeWidth="1"/>
      <circle cx="44" cy="25" r="2.5" fill="#1A0A3C"/>
      <circle cx="56" cy="25" r="2.5" fill="#1A0A3C"/>
      <circle cx="44.8" cy="24.2" r="1" fill="white"/>
      <circle cx="56.8" cy="24.2" r="1" fill="white"/>
      <polygon points="45,33 55,33 50,40" fill="#F59E0B" stroke="#1A0A3C" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="22,50 10,65 22,80" fill="#1A2035" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="78,50 90,65 78,80" fill="#1A2035" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="38,94 32,100 44,100" fill="#F59E0B" stroke="#1A0A3C" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="62,94 56,100 68,100" fill="#F59E0B" stroke="#1A0A3C" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function Dragon({ size = 80, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation: animate ? "float 2.5s ease-in-out infinite" : undefined }}>
      <polygon points="50,38 15,8 20,48" fill="#10B981" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="50,38 85,8 80,48" fill="#10B981" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="50,38 12,20 16,42" fill="#34D399" stroke="none"/>
      <polygon points="50,38 88,20 84,42" fill="#34D399" stroke="none"/>
      <polygon points="50,12 80,42 70,78 50,85 30,78 20,42" fill="#10B981" stroke="#1A0A3C" strokeWidth="2.5" strokeLinejoin="round"/>
      <polygon points="36,22 28,4 40,18" fill="#059669" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="64,22 72,4 60,18" fill="#059669" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <ellipse cx="37" cy="44" rx="6" ry="7" fill="#FCD34D" stroke="#1A0A3C" strokeWidth="1.5"/>
      <ellipse cx="63" cy="44" rx="6" ry="7" fill="#FCD34D" stroke="#1A0A3C" strokeWidth="1.5"/>
      <ellipse cx="37" cy="44" rx="2" ry="5" fill="#1A0A3C"/>
      <ellipse cx="63" cy="44" rx="2" ry="5" fill="#1A0A3C"/>
      <circle cx="45" cy="64" r="2.5" fill="#059669"/>
      <circle cx="55" cy="64" r="2.5" fill="#059669"/>
      <polygon points="40,82 50,95 60,82 50,88" fill="#F97316" stroke="#1A0A3C" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="44,86 50,98 56,86" fill="#FCD34D" stroke="none"/>
    </svg>
  );
}

export function Koala({ size = 80, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation: animate ? "float 4s ease-in-out infinite" : undefined }}>
      <circle cx="22" cy="24" r="18" fill="#94A3B8" stroke="#1A0A3C" strokeWidth="2.5"/>
      <circle cx="78" cy="24" r="18" fill="#94A3B8" stroke="#1A0A3C" strokeWidth="2.5"/>
      <circle cx="22" cy="24" r="11" fill="#CBD5E1"/>
      <circle cx="78" cy="24" r="11" fill="#CBD5E1"/>
      <circle cx="50" cy="55" r="33" fill="#94A3B8" stroke="#1A0A3C" strokeWidth="2.5"/>
      <ellipse cx="50" cy="54" rx="12" ry="9" fill="#475569" stroke="#1A0A3C" strokeWidth="1.5"/>
      <ellipse cx="50" cy="52" rx="8" ry="5" fill="#64748B"/>
      <circle cx="35" cy="44" r="6" fill="#1A0A3C"/>
      <circle cx="65" cy="44" r="6" fill="#1A0A3C"/>
      <circle cx="36.5" cy="42.5" r="2" fill="white"/>
      <circle cx="66.5" cy="42.5" r="2" fill="white"/>
      <path d="M 43 64 Q 50 70 57 64" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="50" cy="80" rx="16" ry="12" fill="#CBD5E1" stroke="#1A0A3C" strokeWidth="1.5"/>
    </svg>
  );
}

export function Deer({ size = 80, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation: animate ? "float 3s ease-in-out infinite" : undefined }}>
      <line x1="36" y1="18" x2="24" y2="4" stroke="#92400E" strokeWidth="4" strokeLinecap="round"/>
      <line x1="36" y1="18" x2="18" y2="14" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="36" y1="18" x2="28" y2="10" stroke="#92400E" strokeWidth="3" strokeLinecap="round"/>
      <line x1="64" y1="18" x2="76" y2="4" stroke="#92400E" strokeWidth="4" strokeLinecap="round"/>
      <line x1="64" y1="18" x2="82" y2="14" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="64" y1="18" x2="72" y2="10" stroke="#92400E" strokeWidth="3" strokeLinecap="round"/>
      <polygon points="50,18 78,46 68,78 50,84 32,78 22,46" fill="#D97706" stroke="#1A0A3C" strokeWidth="2.5" strokeLinejoin="round"/>
      <ellipse cx="50" cy="72" rx="12" ry="9" fill="#FDE68A" stroke="#1A0A3C" strokeWidth="1.5"/>
      <circle cx="36" cy="44" r="6" fill="#1A0A3C"/>
      <circle cx="64" cy="44" r="6" fill="#1A0A3C"/>
      <circle cx="37.5" cy="42.5" r="2" fill="white"/>
      <circle cx="65.5" cy="42.5" r="2" fill="white"/>
      <ellipse cx="50" cy="68" rx="4" ry="3" fill="#92400E"/>
      <circle cx="35" cy="62" r="3" fill="#FDE68A" opacity="0.7"/>
      <circle cx="65" cy="62" r="3" fill="#FDE68A" opacity="0.7"/>
      <circle cx="50" cy="56" r="2.5" fill="#FDE68A" opacity="0.7"/>
    </svg>
  );
}

export function Whale({ size = 80, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation: animate ? "float 4s ease-in-out infinite" : undefined }}>
      <ellipse cx="46" cy="55" rx="38" ry="28" fill="#3B82F6" stroke="#1A0A3C" strokeWidth="2.5"/>
      <polygon points="84,55 96,40 100,70 84,55" fill="#2563EB" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="96,40 100,70 92,55" fill="#3B82F6" stroke="#1A0A3C" strokeWidth="1.5" strokeLinejoin="round"/>
      <ellipse cx="44" cy="60" rx="26" ry="16" fill="#BFDBFE"/>
      <polygon points="50,28 40,42 62,38" fill="#2563EB" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="22" cy="50" r="6" fill="white" stroke="#1A0A3C" strokeWidth="1.5"/>
      <circle cx="22" cy="50" r="3.5" fill="#1A0A3C"/>
      <circle cx="23" cy="49" r="1.2" fill="white"/>
      <path d="M 16 58 Q 26 66 36 60" stroke="#1A0A3C" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <line x1="56" y1="28" x2="52" y2="14" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
      <line x1="60" y1="26" x2="62" y2="12" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
      <line x1="52" y1="28" x2="46" y2="15" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function Octopus({ size = 80, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation: animate ? "wiggle 3s ease-in-out infinite" : undefined }}>
      <path d="M 28,62 Q 16,72 18,86" stroke="#EC4899" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M 38,68 Q 30,80 28,94" stroke="#EC4899" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M 50,70 Q 50,82 46,96" stroke="#EC4899" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M 62,68 Q 70,80 72,94" stroke="#EC4899" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M 72,62 Q 84,72 82,86" stroke="#EC4899" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <ellipse cx="50" cy="42" rx="28" ry="32" fill="#EC4899" stroke="#1A0A3C" strokeWidth="2.5"/>
      <ellipse cx="50" cy="22" rx="18" ry="12" fill="#DB2777" stroke="#1A0A3C" strokeWidth="2"/>
      <circle cx="38" cy="42" r="8" fill="white" stroke="#1A0A3C" strokeWidth="2"/>
      <circle cx="62" cy="42" r="8" fill="white" stroke="#1A0A3C" strokeWidth="2"/>
      <circle cx="38" cy="42" r="5" fill="#1A0A3C"/>
      <circle cx="62" cy="42" r="5" fill="#1A0A3C"/>
      <circle cx="39.5" cy="40.5" r="2" fill="white"/>
      <circle cx="63.5" cy="40.5" r="2" fill="white"/>
      <path d="M 43 55 Q 50 62 57 55" stroke="#1A0A3C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function PrizeBox({ size = 80, animate = false, open = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation: animate ? "bounce 2s ease-in-out infinite" : undefined }}>
      <ellipse cx="54" cy="97" rx="22" ry="4" fill="rgba(0,0,0,0.2)"/>
      <polygon points="15,48 50,38 85,48 85,90 15,90" fill="#7C3AED" stroke="#1A0A3C" strokeWidth="3" strokeLinejoin="round"/>
      <polygon points="85,48 85,90 95,82 95,40" fill="#5B21B6" stroke="#1A0A3C" strokeWidth="2.5" strokeLinejoin="round"/>
      <polygon points="15,90 85,90 95,82 25,82" fill="#6D28D9" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="44,38 56,38 58,90 42,90" fill="#F59E0B" stroke="#1A0A3C" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="15,60 85,60 85,68 15,68" fill="#F59E0B" stroke="#1A0A3C" strokeWidth="1.5" strokeLinejoin="round"/>
      <g style={open ? { animation: "lidPop 0.5s ease forwards" } : {}}>
        <polygon points="10,38 50,25 90,38 85,48 50,38 15,48" fill="#A78BFA" stroke="#1A0A3C" strokeWidth="3" strokeLinejoin="round"/>
        <polygon points="90,38 90,48 100,42 100,30" fill="#7C3AED" stroke="#1A0A3C" strokeWidth="2.5" strokeLinejoin="round"/>
      </g>
      <polygon points="38,32 50,25 44,38" fill="#FCD34D" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="62,32 50,25 56,38" fill="#FCD34D" stroke="#1A0A3C" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="50" cy="30" r="5.5" fill="#F59E0B" stroke="#1A0A3C" strokeWidth="2"/>
      <circle cx="30" cy="75" r="2.5" fill="#FDE68A"/>
      <circle cx="70" cy="75" r="2.5" fill="#FDE68A"/>
    </svg>
  );
}

// ── Animal registry ───────────────────────────────────────────────────────────
export const ANIMALS = [
  { id: "fox",       name: "Fox",       Component: Fox,       color: "#E8621A", choreThreshold: 0    },
  { id: "panda",     name: "Panda",     Component: Panda,     color: "#2D2D3A", choreThreshold: 0    },
  { id: "butterfly", name: "Butterfly", Component: Butterfly, color: "#9B5DE5", choreThreshold: 0    },
  { id: "frog",      name: "Frog",      Component: Frog,      color: "#3EBD6E", choreThreshold: 0    },
  { id: "bear",      name: "Bear",      Component: Bear,      color: "#A78BFA", choreThreshold: 100  },
  { id: "tiger",     name: "Tiger",     Component: Tiger,     color: "#F97316", choreThreshold: 200  },
  { id: "owl",       name: "Owl",       Component: Owl,       color: "#3B82F6", choreThreshold: 350  },
  { id: "penguin",   name: "Penguin",   Component: Penguin,   color: "#1A2035", choreThreshold: 500  },
  { id: "koala",     name: "Koala",     Component: Koala,     color: "#94A3B8", choreThreshold: 700  },
  { id: "deer",      name: "Deer",      Component: Deer,      color: "#D97706", choreThreshold: 900  },
  { id: "whale",     name: "Whale",     Component: Whale,     color: "#3B82F6", choreThreshold: 1200 },
  { id: "dragon",    name: "Dragon",    Component: Dragon,    color: "#10B981", choreThreshold: 1500 },
  { id: "octopus",   name: "Octopus",   Component: Octopus,   color: "#EC4899", choreThreshold: 2000 },
];

export const getAnimal       = (id) => ANIMALS.find(a => a.id === id) || ANIMALS[0];
export const unlockedAnimals = (totalOrange = 0) => ANIMALS.filter(a => a.choreThreshold <= totalOrange);

// ── Shared UI ─────────────────────────────────────────────────────────────────
export function StarField({ count = 40 }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
    size: Math.random() > 0.8 ? 4 : Math.random() > 0.5 ? 3 : 2,
    delay: `${Math.random() * 5}s`, dur: `${2 + Math.random() * 3}s`,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: "absolute", left: s.left, top: s.top,
          width: s.size, height: s.size, background: "white",
          borderRadius: "50%", opacity: 0.4,
          animation: `starPulse ${s.dur} ${s.delay} ease-in-out infinite`,
        }}/>
      ))}
    </div>
  );
}

export function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 32 }, (_, i) => ({
    id: i, left: `${15 + Math.random() * 70}%`,
    color: ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF6FC8","#FF922B","#A9E34B","#74C0FC"][i % 8],
    delay: `${Math.random() * 0.6}s`, dur: `${1.5 + Math.random() * 1}s`,
    size: 7 + Math.random() * 8, rotate: Math.random() * 360,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998, overflow: "hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: "absolute", top: "-20px", left: p.left,
          width: p.size, height: p.size, background: p.color,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          transform: `rotate(${p.rotate}deg)`,
          animation: `confetti ${p.dur} ${p.delay} ease-in forwards`,
        }}/>
      ))}
    </div>
  );
}

export function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)",
      background: "linear-gradient(135deg,#7C3AED,#EC4899)", color: "white",
      borderRadius: 50, padding: "12px 28px",
      fontFamily: "'Fredoka One', cursive", fontSize: 16,
      boxShadow: "6px 6px 0 #1A0A3C, 0 8px 30px rgba(124,58,237,0.5)",
      border: "3px solid #1A0A3C", animation: "pop 0.3s ease",
      zIndex: 9999, whiteSpace: "nowrap",
    }}>{msg}</div>
  );
}

export function Spinner({ size = 40, color = "#7C3AED" }) {
  return (
    <div style={{
      width: size, height: size,
      border: `4px solid ${color}33`, borderTop: `4px solid ${color}`,
      borderRadius: "50%", animation: "spin 0.8s linear infinite",
    }}/>
  );
}

export function LoadingScreen({ message = "Loading..." }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#1A0A3C",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 20,
      fontFamily: "'Nunito', sans-serif",
    }}>
      <PrizeBox size={80} animate/>
      <div style={{
        fontFamily: "'Fredoka One', cursive", fontSize: 24,
        background: "linear-gradient(135deg,#A78BFA,#F59E0B)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>{message}</div>
      <Spinner color="#A78BFA"/>
    </div>
  );
}

// ─── src/components/GiftCardButton.jsx ───────────────────────────────────────
// Tango-style gift card button. Renders a card-shaped tile that looks like the
// physical gift card itself: brand-color background, white wordmark, bold
// denomination, hard-edge pop-art drop shadow. Inspired by Roy Lichtenstein /
// Ellsworth Kelly — flat color planes, thick black outlines, no gradients.
//
// Used on the sandbox /mockups/cards route for vendor presentations and
// (future) on the kid/parent redemption flow once a gift card vendor is wired.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { T, benday } from "../lib/theme";

/**
 * @param {object} props
 * @param {string} props.brand        — Brand name (e.g. "Amazon", "Roblox")
 * @param {string} props.bg           — Card background color
 * @param {string} [props.fg]         — Foreground color for wordmark/denom (default white)
 * @param {string} [props.accent]     — Optional accent color for decorative shape
 * @param {number} props.amount       — USD denomination (e.g. 25, 50, 100)
 * @param {string} [props.tagline]    — Small subtext line (e.g. "redeem online")
 * @param {function} [props.onClick]
 * @param {boolean} [props.disabled]
 * @param {React.ReactNode} [props.mark] — Custom SVG mark (overrides text wordmark)
 */
export default function GiftCardButton({
  brand,
  bg,
  fg = "#FFFFFF",
  accent,
  amount,
  tagline,
  onClick,
  disabled = false,
  mark,
}) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);

  const lift = !disabled && hover && !press;
  const offset = press ? 0 : lift ? 6 : 4;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      aria-label={`${brand} gift card, ${amount} dollars`}
      style={{
        position: "relative",
        width: 320, height: 200,
        background: bg,
        border: `4px solid ${T.borderBold}`,
        borderRadius: 16,
        padding: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transform: `translate(${press ? 4 : 0}px, ${press ? 4 : 0}px)`,
        boxShadow: `${offset}px ${offset}px 0 ${T.borderBold}`,
        transition: "transform 0.08s ease, box-shadow 0.08s ease",
        overflow: "hidden",
        display: "block",
        fontFamily: "'Nunito', sans-serif",
        textAlign: "left",
      }}
    >
      {/* Ben-Day dot texture in upper-right (Lichtenstein) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0, right: 0,
          width: 120, height: 120,
          ...benday(`${fg}30`, 8, 1.4),
          maskImage: "radial-gradient(circle at top right, #000 50%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(circle at top right, #000 50%, transparent 100%)",
        }}
      />

      {/* Optional accent shape — Kelly-style flat triangle */}
      {accent && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -2, left: -2,
            width: 0, height: 0,
            borderLeft: "70px solid transparent",
            borderBottom: `70px solid ${accent}`,
          }}
        />
      )}

      {/* Brand mark — top-left */}
      <div style={{
        position: "absolute",
        top: 18, left: 22,
        zIndex: 2,
      }}>
        {mark ? mark : (
          <div style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: 26,
            color: fg,
            letterSpacing: 0.5,
            textShadow: `2px 2px 0 ${T.borderBold}`,
          }}>
            {brand}
          </div>
        )}
        {tagline && (
          <div style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 11,
            color: fg,
            opacity: 0.85,
            fontWeight: 700,
            marginTop: 4,
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}>
            {tagline}
          </div>
        )}
      </div>

      {/* Magnetic stripe / chip strip — middle decoration */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%", left: 0, right: 0,
          transform: "translateY(-50%)",
          height: 18,
          background: `${T.borderBold}cc`,
          borderTop: `2px solid ${T.borderBold}`,
          borderBottom: `2px solid ${T.borderBold}`,
        }}
      />

      {/* Denomination — bottom-right */}
      <div style={{
        position: "absolute",
        bottom: 16, right: 22,
        zIndex: 2,
        background: T.borderBold,
        color: T.sunshine,
        border: `3px solid ${T.borderBold}`,
        borderRadius: 10,
        padding: "6px 14px",
        fontFamily: "'Fredoka One', cursive",
        fontSize: 28,
        boxShadow: `3px 3px 0 ${fg}`,
      }}>
        ${amount}
      </div>

      {/* "Gift Card" label — bottom-left */}
      <div style={{
        position: "absolute",
        bottom: 22, left: 22,
        zIndex: 2,
        fontFamily: "'Nunito', sans-serif",
        fontSize: 10,
        fontWeight: 800,
        color: fg,
        textTransform: "uppercase",
        letterSpacing: 2,
        opacity: 0.85,
      }}>
        Gift Card
      </div>
    </button>
  );
}

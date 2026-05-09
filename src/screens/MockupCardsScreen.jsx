// ─── src/screens/MockupCardsScreen.jsx ───────────────────────────────────────
// Sandbox visualization for gift card display. Used to demo card aesthetics
// to gift-card vendors (Tango, Tremendous, Giftbit, etc.) and to preview
// how the kid/parent redemption flow could look once a vendor is wired up.
//
// Public route: /mockups/cards
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { fontCSS, T } from "../lib/theme";
import GiftCardButton from "../components/GiftCardButton";
import { StarField } from "../lib/animals";

const CARDS = [
  { brand: "Amazon",    bg: "#FF9900", fg: "#FFFFFF", accent: "#146EB4", tagline: "shop anything" },
  { brand: "Target",    bg: "#CC0000", fg: "#FFFFFF", accent: "#FFFFFF", tagline: "in store + online" },
  { brand: "Starbucks", bg: "#006241", fg: "#FFFFFF", accent: "#D4E9E2", tagline: "coffee + treats" },
  { brand: "Roblox",    bg: "#0F0F10", fg: "#FFFFFF", accent: "#E2231A", tagline: "robux for games" },
  { brand: "Nintendo",  bg: "#E60012", fg: "#FFFFFF", accent: "#FFFFFF", tagline: "eshop credit" },
  { brand: "Apple",     bg: "#1D1D1F", fg: "#FFFFFF", accent: "#A6B1B7", tagline: "apps + music" },
  { brand: "Walmart",   bg: "#0071CE", fg: "#FFFFFF", accent: "#FFC220", tagline: "everyday savings" },
  { brand: "Steam",     bg: "#1B2838", fg: "#FFFFFF", accent: "#66C0F4", tagline: "pc games" },
];

const DENOMS = [10, 25, 50, 100];

export default function MockupCardsScreen() {
  const [denom, setDenom] = useState(25);
  const [chosen, setChosen] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: T.sky,
      fontFamily: "'Nunito', sans-serif",
      color: T.text,
      position: "relative",
      overflow: "hidden",
      paddingBottom: 60,
    }}>
      <style>{fontCSS}</style>
      <StarField count={28}/>

      <main id="main" style={{
        position: "relative", zIndex: 1,
        maxWidth: 1100, margin: "0 auto",
        padding: "32px 20px",
      }}>
        <header style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: 38, color: T.purple,
            marginBottom: 6, lineHeight: 1.1,
          }}>
            Gift Card Display Mockup
          </h1>
          <p style={{
            fontSize: 15, color: T.sub, maxWidth: 640, margin: "0 auto",
          }}>
            Visualization of how digital gift cards could appear in the kid/parent
            redemption flow. Pop-art aesthetic — flat color planes, thick black
            outlines, hard-edge drop shadows. Cards are reusable across any
            vendor (Tango, Tremendous, Giftbit, Runa).
          </p>
        </header>

        {/* Denomination switcher */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 10,
          marginBottom: 36, flexWrap: "wrap",
        }} role="group" aria-label="Card denomination">
          <span style={{
            fontSize: 11, fontWeight: 800, color: T.sub,
            textTransform: "uppercase", letterSpacing: 1.5,
            alignSelf: "center", marginRight: 6,
          }}>
            Amount
          </span>
          {DENOMS.map(n => {
            const active = denom === n;
            return (
              <button key={n} type="button"
                onClick={() => setDenom(n)}
                aria-pressed={active}
                style={{
                  padding: "10px 22px",
                  background: active ? T.purple : "#FFFFFF",
                  color: active ? "#FFFFFF" : T.text,
                  border: `3px solid ${T.borderBold}`,
                  borderRadius: 14,
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: 17, cursor: "pointer",
                  boxShadow: active ? `4px 4px 0 ${T.borderBold}` : `3px 3px 0 ${T.borderBold}`,
                  transform: active ? "translate(-1px,-1px)" : "none",
                  transition: "all 0.1s ease",
                }}>
                ${n}
              </button>
            );
          })}
        </div>

        {/* Card grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 28,
          justifyItems: "center",
        }}>
          {CARDS.map(card => (
            <GiftCardButton
              key={card.brand}
              brand={card.brand}
              bg={card.bg}
              fg={card.fg}
              accent={card.accent}
              tagline={card.tagline}
              amount={denom}
              onClick={() => setChosen(card.brand)}
            />
          ))}
        </div>

        {/* Selection feedback (live region) */}
        <div role="status" aria-live="polite" style={{
          minHeight: 60, marginTop: 36,
          textAlign: "center",
          fontFamily: "'Fredoka One', cursive",
          fontSize: 18, color: T.purple,
        }}>
          {chosen ? `${chosen} $${denom} selected` : ""}
        </div>

        {/* Caveat */}
        <div style={{
          marginTop: 24,
          padding: "16px 20px",
          background: T.panel,
          border: `3px solid ${T.borderBold}`,
          borderRadius: 14,
          boxShadow: `5px 5px 0 ${T.borderBold}`,
          fontSize: 13, color: T.sub,
          maxWidth: 720, margin: "24px auto 0",
        }}>
          <strong style={{ color: T.text }}>Note:</strong> Brand names and colors
          on this mockup page are placeholders for vendor presentation only.
          Production cards will use logos and palettes supplied by the gift-card
          API (Tango / Tremendous / Giftbit). No real redemption is wired here.
        </div>
      </main>
    </div>
  );
}

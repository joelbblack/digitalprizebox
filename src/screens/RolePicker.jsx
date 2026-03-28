// ─── src/screens/RolePicker.jsx ──────────────────────────────────────────────
// For users with role="both" — pick parent or teacher mode for this session.
// Stores preference in sessionStorage so they don't have to pick every time.
// ─────────────────────────────────────────────────────────────────────────────

import { useState }          from "react";
import { useNavigate }       from "react-router-dom";
import { useAuth }           from "../lib/auth";
import { fontCSS, T }        from "../lib/theme";
import { Fox, Bear, StarField, PrizeBox } from "../lib/animals";

export default function RolePicker() {
  const navigate       = useNavigate();
  const { profile }    = useAuth();
  const [hovering, setHovering] = useState(null);

  const name = profile?.display_name?.split(" ")[0] || "there";

  const options = [
    {
      id:    "parent",
      path:  "/parent",
      label: "Parent Console",
      desc:  "Manage chores, award orange, fund green for your kids at home.",
      color: T.green,
      Animal: Fox,
      emoji: "🏠",
    },
    {
      id:    "teacher",
      path:  "/teacher",
      label: "Teacher Dashboard",
      desc:  "Run your classroom, award students, manage class goals and prizes.",
      color: T.purple,
      Animal: Bear,
      emoji: "🏫",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: T.sky,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Nunito', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{fontCSS}</style>
      <StarField count={30}/>

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 500,
        textAlign: "center",
      }}>

        {/* Header */}
        <div style={{ marginBottom: 8, animation: "bounce 3s ease-in-out infinite" }}>
          <PrizeBox size={60}/>
        </div>
        <div style={{
          fontFamily: "'Fredoka One', cursive", fontSize: 26,
          color: T.text, marginBottom: 6,
          animation: "fadeUp 0.3s ease",
        }}>
          Hey {name}! Which mode today?
        </div>
        <div style={{
          fontSize: 14, color: T.sub, marginBottom: 32,
          animation: "fadeUp 0.4s ease",
        }}>
          Your account has both parent and teacher access.
        </div>

        {/* Options */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 16, animation: "fadeUp 0.5s ease",
        }}>
          {options.map(opt => {
            const isHovered = hovering === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  sessionStorage.setItem("lastRole", opt.id);
                  navigate(opt.path);
                }}
                onMouseEnter={() => setHovering(opt.id)}
                onMouseLeave={() => setHovering(null)}
                style={{
                  background: isHovered
                    ? `linear-gradient(135deg,${opt.color}33,${opt.color}18)`
                    : T.panel,
                  border: `3px solid ${isHovered ? opt.color : T.borderBold}`,
                  borderRadius: 20, padding: "24px 16px",
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  boxShadow: isHovered
                    ? `6px 6px 0 ${opt.color}66`
                    : "4px 4px 0 #1A0A3C",
                  transition: "all 0.2s",
                  transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                }}>
                <div style={{
                  display: "flex", justifyContent: "center",
                  marginBottom: 12,
                  animation: isHovered ? "wiggle 0.5s ease" : "none",
                }}>
                  <opt.Animal size={72}/>
                </div>
                <div style={{
                  fontFamily: "'Fredoka One', cursive", fontSize: 18,
                  color: isHovered ? opt.color : T.text,
                  marginBottom: 6, transition: "color 0.2s",
                }}>
                  {opt.emoji} {opt.label}
                </div>
                <div style={{
                  fontSize: 12, color: T.sub, lineHeight: 1.5,
                }}>
                  {opt.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick tip */}
        <div style={{
          marginTop: 24, fontSize: 12, color: T.sub,
          animation: "fadeUp 0.6s ease",
        }}>
          💡 You can switch modes anytime from your dashboard header.
        </div>
      </div>
    </div>
  );
}

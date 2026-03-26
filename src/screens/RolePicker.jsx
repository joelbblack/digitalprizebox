import { useNavigate } from "react-router-dom";

export default function RolePicker() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0F172A",
      color: "#F1F5F9",
      fontFamily: "Nunito, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>

        <div style={{
          fontFamily: "Fredoka One, cursive",
          fontSize: 24,
          color: "#6366F1",
          marginBottom: 8,
        }}>
          Which view today?
        </div>

        <div style={{
          fontSize: 13,
          color: "#94A3B8",
          marginBottom: 24,
        }}>
          Your account has both parent and teacher access.
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {[
            { emoji: "🏠", label: "Parent Console",    path: "/parent"  },
            { emoji: "🏫", label: "Teacher Dashboard", path: "/teacher" },
          ].map(r => (
            <button
              key={r.path}
              onClick={() => navigate(r.path)}
              style={{
                flex: 1,
                background: "#1E293B",
                border: "2px solid #334155",
                borderRadius: 16,
                padding: "24px 12px",
                cursor: "pointer",
                color: "#F1F5F9",
                fontFamily: "Nunito, sans-serif",
                transition: "all 0.2s",
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = "#6366F1";
                e.currentTarget.style.background  = "#1E293B";
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = "#334155";
                e.currentTarget.style.background  = "#1E293B";
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 10 }}>{r.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{r.label}</div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

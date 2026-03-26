import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/auth";
import { useAuth } from "../lib/auth";

export default function SetupScreen() {
  const navigate    = useNavigate();
  const { profile } = useAuth();
  const role        = profile?.role || "parent";

  const finish = async () => {
    await supabase
      .from("users")
      .update({ signup_fee_paid: true })
      .eq("id", profile.id);
    navigate("/dashboard");
  };

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
      <div style={{
        background: "#1E293B",
        borderRadius: 20,
        padding: "28px 24px",
        maxWidth: 460,
        width: "100%",
        border: "1px solid #334155",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🎁</div>

        <div style={{
          fontFamily: "Fredoka One, cursive",
          fontSize: 26,
          color: "#6366F1",
          marginBottom: 8,
        }}>
          Welcome to Digital Prize Box!
        </div>

        <div style={{
          fontSize: 13,
          color: "#94A3B8",
          marginBottom: 24,
          lineHeight: 1.7,
        }}>
          You are signed up as a{" "}
          <strong style={{ color: "#F1F5F9" }}>{role}</strong>.
          Full onboarding setup coming soon — tap below to go to your dashboard.
        </div>

        <button
          onClick={finish}
          style={{
            width: "100%",
            background: "#6366F1",
            border: "none",
            color: "white",
            borderRadius: 10,
            padding: "12px 0",
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "Nunito, sans-serif",
          }}>
          Go to Dashboard →
        </button>
      </div>
    </div>
  );
}

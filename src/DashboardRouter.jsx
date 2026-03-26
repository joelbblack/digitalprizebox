import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function DashboardRouter() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!profile) {
      navigate("/login");
      return;
    }

    if (!profile.signup_fee_paid && profile.plan === "free") {
      navigate("/setup");
      return;
    }

    switch (profile.role) {
      case "parent":
        navigate("/parent");
        break;
      case "teacher":
        navigate("/teacher");
        break;
      case "principal":
        navigate("/principal");
        break;
      case "both":
        navigate("/pick-role");
        break;
      default:
        navigate("/setup");
    }
  }, [profile, loading, navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0F172A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#F1F5F9",
      fontFamily: "Nunito, sans-serif",
      fontSize: 16,
    }}>
      Loading...
    </div>
  );
}

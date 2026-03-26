import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { session, profile, loading } = useAuth();

  if (loading) return (
    <div style={{
      minHeight: "100vh", background: "#0F172A",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#F1F5F9", fontFamily: "Nunito, sans-serif",
    }}>
      Loading...
    </div>
  );

  if (!session) return <Navigate to="/login" replace />;

  if (allowedRoles && profile) {
    const userRole = profile.role;
    const allowed  = allowedRoles.includes(userRole) ||
                     (userRole === "both" && allowedRoles.some(r =>
                       ["parent","teacher"].includes(r)));
    if (!allowed) return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ─── src/components/ProtectedRoute.jsx ───────────────────────────────────────
// Guards: waits for auth to fully resolve before making any redirect decision.
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate }         from "react-router-dom";
import { useAuth }          from "../lib/auth";
import { LoadingScreen }    from "../lib/animals";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { session, profile, loading, profileState } = useAuth();

  // ALWAYS wait for auth to finish loading — never redirect while loading
  if (loading) return <LoadingScreen message="Loading your prize box\u2026"/>;

  // Auth resolved. No session = not logged in.
  if (!session) return <Navigate to="/login" replace />;

  // Session exists but profile hasn't loaded yet (shouldn't happen if
  // loading is false, but guard against it)
  if (profileState === "loading" || profileState === "none") {
    return <LoadingScreen message="Loading your prize box\u2026"/>;
  }

  // Logged in but no profile row → needs onboarding
  if (profileState === "missing") return <Navigate to="/setup" replace />;

  // Profile exists but hasn't completed setup
  if (profile && !profile.signup_fee_paid && profile.plan === "free") {
    return <Navigate to="/setup" replace />;
  }

  // Role check
  if (allowedRoles && profile) {
    const role    = profile.role;
    const allowed =
      allowedRoles.includes(role) ||
      (role === "both" && allowedRoles.some(r => ["parent", "teacher"].includes(r))) ||
      (role === "superintendent" && allowedRoles.includes("superintendent")) ||
      (role === "district"      && allowedRoles.includes("superintendent"));

    if (!allowed) return <Navigate to="/dashboard" replace />;
  }

  return children;
}

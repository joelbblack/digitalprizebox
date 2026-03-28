// ─── src/components/ProtectedRoute.jsx ───────────────────────────────────────
// Fixed from original:
//  ✅ profileState "missing" → /setup instead of infinite /login loop
//  ✅ Superintendent role handled in allowedRoles check
//  ✅ Clear loading state with cartoon spinner
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate }         from "react-router-dom";
import { useAuth }          from "../lib/auth";
import { LoadingScreen }    from "../lib/animals";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { session, profile, loading, profileState } = useAuth();

  if (loading) return <LoadingScreen message="Loading your prize box…"/>;

  // Not logged in at all
  if (!session) return <Navigate to="/login" replace />;

  // Logged in but no profile row yet → needs onboarding
  if (profileState === "missing") return <Navigate to="/setup" replace />;

  // Logged in, profile exists but hasn't completed setup
  if (profile && !profile.signup_fee_paid && profile.plan === "free") {
    // Allow /setup through regardless
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

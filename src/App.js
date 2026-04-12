// ─── src/App.js ───────────────────────────────────────────────────────────────
// Fixed from original:
//  ✅ /kid/:kidId now has ProtectedRoute (was publicly accessible)
//  ✅ Superintendent route added
//  ✅ Family circle invite route added
//  ✅ LoadingScreen uses cartoon design system
// ─────────────────────────────────────────────────────────────────────────────

import { lazy, Suspense }                    from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }                      from "./lib/auth";
import ProtectedRoute                        from "./components/ProtectedRoute";
import { LoadingScreen }                     from "./lib/animals";
import { fontCSS }                           from "./lib/theme";

// Eagerly loaded (always needed)
import LoginScreen    from "./screens/LoginScreen";
import DashboardRouter from "./screens/DashboardRouter";
import LandingPage    from "./screens/LandingPage";

// Lazily loaded
const SetupScreen           = lazy(() => import("./screens/SetupScreen"));
const RolePicker            = lazy(() => import("./screens/RolePicker"));
const JoinPage              = lazy(() => import("./screens/JoinPage"));
const ParentScreen          = lazy(() => import("./screens/ParentScreen"));
const TeacherScreen         = lazy(() => import("./screens/TeacherScreen"));
const PrincipalScreen       = lazy(() => import("./screens/PrincipalScreen"));
const SuperintendentScreen  = lazy(() => import("./screens/SuperintendentScreen"));
const KidScreen             = lazy(() => import("./screens/KidScreen"));
const FamilyCircleScreen    = lazy(() => import("./screens/FamilyCircleScreen"));
const FamilyInviteScreen    = lazy(() => import("./screens/FamilyInviteScreen"));

function AppLoader() {
  return (
    <>
      <style>{fontCSS}</style>
      <LoadingScreen message="Opening your prize box…"/>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <style>{fontCSS}</style>
      <BrowserRouter>
        <Suspense fallback={<AppLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"                element={<LandingPage />} />
            <Route path="/login"           element={<LoginScreen />} />
            <Route path="/join/:code"      element={<JoinPage />} />
            <Route path="/invite/:token"   element={<FamilyInviteScreen />} />

            {/* Auth required — any role */}
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardRouter /></ProtectedRoute>
            }/>
            <Route path="/setup" element={
              <ProtectedRoute><SetupScreen /></ProtectedRoute>
            }/>
            <Route path="/pick-role" element={
              <ProtectedRoute><RolePicker /></ProtectedRoute>
            }/>

            {/* Role-specific dashboards */}
            <Route path="/parent" element={
              <ProtectedRoute allowedRoles={["parent","both"]}>
                <ParentScreen />
              </ProtectedRoute>
            }/>
            <Route path="/teacher" element={
              <ProtectedRoute allowedRoles={["teacher","both"]}>
                <TeacherScreen />
              </ProtectedRoute>
            }/>
            <Route path="/principal" element={
              <ProtectedRoute allowedRoles={["principal"]}>
                <PrincipalScreen />
              </ProtectedRoute>
            }/>
            <Route path="/superintendent" element={
              <ProtectedRoute allowedRoles={["superintendent","district"]}>
                <SuperintendentScreen />
              </ProtectedRoute>
            }/>

            {/* Kid PIN screen — protected, any authenticated adult session */}
            <Route path="/kid/:kidId" element={
              <ProtectedRoute>
                <KidScreen />
              </ProtectedRoute>
            }/>

            {/* Family circle */}
            <Route path="/family" element={
              <ProtectedRoute>
                <FamilyCircleScreen />
              </ProtectedRoute>
            }/>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

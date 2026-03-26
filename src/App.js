import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginScreen from "./screens/LoginScreen";
import DashboardRouter from "./screens/DashboardRouter";
import { lazy, Suspense } from "react";

const SetupFlow         = lazy(() => import("./screens/SetupScreen"));
const ParentConsole     = lazy(() => import("./screens/ParentScreen"));
const TeacherDashboard  = lazy(() => import("./screens/TeacherScreen"));
const PrincipalDashboard = lazy(() => import("./screens/PrincipalScreen"));
const KidView           = lazy(() => import("./screens/KidScreen"));
const RolePicker        = lazy(() => import("./screens/RolePicker"));
const LandingPage       = lazy(() => import("./screens/LandingPage"));

function Loading() {
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
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontFamily: "Fredoka One, cursive",
          fontSize: 32,
          background: "linear-gradient(135deg, #6366F1, #F59E0B)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 12,
        }}>
          🎁 Digital Prize Box
        </div>
        <div style={{ color: "#94A3B8" }}>Loading...</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>

            {/* Landing page — root domain */}
            <Route path="/" element={<LandingPage />} />

            {/* Login */}
            <Route path="/login" element={<LoginScreen />} />

            {/* Auth router */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } />

            {/* Setup */}
            <Route path="/setup" element={
              <ProtectedRoute>
                <SetupFlow />
              </ProtectedRoute>
            } />

            {/* Role picker */}
            <Route path="/pick-role" element={
              <ProtectedRoute>
                <RolePicker />
              </ProtectedRoute>
            } />

            {/* Parent */}
            <Route path="/parent" element={
              <ProtectedRoute allowedRoles={["parent","both"]}>
                <ParentConsole />
              </ProtectedRoute>
            } />

            {/* Teacher */}
            <Route path="/teacher" element={
              <ProtectedRoute allowedRoles={["teacher","both"]}>
                <TeacherDashboard />
              </ProtectedRoute>
            } />

            {/* Principal */}
            <Route path="/principal" element={
              <ProtectedRoute allowedRoles={["principal"]}>
                <PrincipalDashboard />
              </ProtectedRoute>
            } />

            {/* Kid view */}
            <Route path="/kid/:kidId" element={<KidView />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginScreen from "./screens/LoginScreen";
import DashboardRouter from "./screens/DashboardRouter";
import { lazy, Suspense } from "react";

const SetupFlow          = lazy(() => import("./screens/SetupScreen"));
const ParentConsole      = lazy(() => import("./screens/ParentScreen"));
const TeacherDashboard   = lazy(() => import("./screens/TeacherScreen"));
const PrincipalDashboard = lazy(() => import("./screens/PrincipalScreen"));
const KidView            = lazy(() => import("./screens/KidScreen"));
const RolePicker         = lazy(() => import("./screens/RolePicker"));
const LandingPage        = lazy(() => import("./screens/LandingPage"));
const JoinPage           = lazy(() => import("./screens/JoinPage"));

function Loading() {
  return (
    <div style={{ minHeight:"100vh", background:"#0F172A",
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"#F1F5F9", fontFamily:"Nunito, sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:"Fredoka One, cursive", fontSize:32,
          background:"linear-gradient(135deg, #6366F1, #F59E0B)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          marginBottom:12 }}>🎁 Digital Prize Box</div>
        <div style={{ color:"#94A3B8" }}>Loading...</div>
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
            <Route path="/"            element={<LandingPage />} />
            <Route path="/login"       element={<LoginScreen />} />
            <Route path="/join/:code"  element={<JoinPage />} />
            <Route path="/dashboard"   element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
            <Route path="/setup"       element={<ProtectedRoute><SetupFlow /></ProtectedRoute>} />
            <Route path="/pick-role"   element={<ProtectedRoute><RolePicker /></ProtectedRoute>} />
            <Route path="/parent"      element={<ProtectedRoute allowedRoles={["parent","both"]}><ParentConsole /></ProtectedRoute>} />
            <Route path="/teacher"     element={<ProtectedRoute allowedRoles={["teacher","both"]}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/principal"   element={<ProtectedRoute allowedRoles={["principal"]}><PrincipalDashboard /></ProtectedRoute>} />
            <Route path="/kid/:kidId"  element={<KidView />} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

## Order to do it in GitHub
```
1. Add new file → src/screens/JoinPage.jsx
2. Add new file → src/dashboards/TeacherFlyerAndEditor.jsx
3. Edit existing → src/dashboards/prizebox_teacher_v2.jsx (paste v3 contents)
4. Edit existing → src/dashboards/prizebox_parent_v3.jsx (paste v4 contents)
5. Edit existing → src/App.js (paste above)

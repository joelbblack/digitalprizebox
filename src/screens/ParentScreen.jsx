// ─── src/screens/ParentScreen.jsx ────────────────────────────────────────────
import { useAuth }          from "../lib/auth";
import { useParentData }    from "../lib/useParentData";
import ParentDashboard      from "../dashboards/ParentDashboard";
import { LoadingScreen }    from "../lib/animals";
import { fontCSS, T }       from "../lib/theme";

export default function ParentScreen() {
  const { profile, signOut } = useAuth();
  const data = useParentData(profile?.id);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  if (data.loading) return (
    <>
      <style>{fontCSS}</style>
      <LoadingScreen message="Loading your family dashboard..."/>
    </>
  );

  if (data.error) return (
    <div style={{
      minHeight: "100vh",
      background: T.sky,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Nunito', sans-serif",
    }}>
      <style>{fontCSS}</style>
      <div style={{ textAlign: "center", padding: "0 24px" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>😿</div>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: T.text, marginBottom: 8 }}>
          Something went wrong
        </div>
        <div style={{ fontSize: 14, color: T.sub, marginBottom: 24 }}>
          {data.error}
        </div>
        <button type="button" onClick={() => data.refresh()} style={{
          background: "#0033CC",
          border: "3px solid #000000", borderRadius: 14,
          padding: "12px 28px", color: "white",
          fontFamily: "'Fredoka One', cursive", fontSize: 16,
          cursor: "pointer", boxShadow: "4px 4px 0 #000000",
          marginRight: 12,
        }}>
          Retry
        </button>
        <button type="button" onClick={handleSignOut} style={{
          background: "transparent",
          border: `3px solid ${T.border}`, borderRadius: 14,
          padding: "12px 28px", color: T.sub,
          fontFamily: "'Fredoka One', cursive", fontSize: 16,
          cursor: "pointer",
        }}>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <ParentDashboard
      profile={profile}
      onSignOut={handleSignOut}
      {...data}
    />
  );
}

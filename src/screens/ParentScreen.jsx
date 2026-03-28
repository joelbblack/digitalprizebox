// ─── src/screens/ParentScreen.jsx ────────────────────────────────────────────
import { useAuth }          from "../lib/auth";
import { useParentData }    from "../lib/useParentData";
import ParentDashboard      from "../dashboards/ParentDashboard";
import { LoadingScreen }    from "../lib/animals";
import { fontCSS }          from "../lib/theme";

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
      <LoadingScreen message="Loading your family dashboard…"/>
    </>
  );

  return (
    <ParentDashboard
      profile={profile}
      onSignOut={handleSignOut}
      {...data}
    />
  );
}

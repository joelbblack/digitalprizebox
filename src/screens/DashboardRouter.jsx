// ─── src/screens/DashboardRouter.jsx ─────────────────────────────────────────
// Fixed from original:
//  ✅ Superintendent routes to /superintendent
//  ✅ profileState "missing" handled explicitly
//  ✅ Teacher without teachers row detected and sent to setup
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect }     from "react";
import { useNavigate }   from "react-router-dom";
import { useAuth }       from "../lib/auth";
import { supabase }      from "../lib/auth";
import { LoadingScreen } from "../lib/animals";

export default function DashboardRouter() {
  const { profile, loading, profileState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!profile) {
      navigate("/login");
      return;
    }

    if (profileState === "missing" || !profile.signup_fee_paid) {
      navigate("/setup");
      return;
    }

    async function route() {
      switch (profile.role) {
        case "parent":
          navigate("/parent");
          break;

        case "teacher": {
          // Check if teachers row exists — if not, needs onboarding
          const { data } = await supabase
            .from("teachers")
            .select("id, onboarded")
            .eq("user_id", profile.id)
            .single();

          if (!data) {
            // Create teachers row and send to teacher screen for onboarding
            await supabase.from("teachers").insert({
              user_id:    profile.id,
              teacher_name: profile.display_name || "Teacher",
              onboarded:  false,
            });
          }
          navigate("/teacher");
          break;
        }

        case "principal":
          navigate("/principal");
          break;

        case "superintendent":
        case "district":
          navigate("/superintendent");
          break;

        case "both":
          navigate("/pick-role");
          break;

        default:
          navigate("/setup");
      }
    }

    route();
  }, [profile, loading, profileState, navigate]);

  return <LoadingScreen message="Taking you to your dashboard…"/>;
}

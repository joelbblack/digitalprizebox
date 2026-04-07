// ─── src/screens/FamilyInviteScreen.jsx ──────────────────────────────────────
// Route: /invite/:token
// Family member lands here from email invite link.
// If logged in, accepts immediately. If not, sends to signup with token stored.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect }   from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, supabase }     from "../lib/auth";
import { fontCSS, T }            from "../lib/theme";
import { PrizeBox, Butterfly, StarField, Spinner } from "../lib/animals";

export default function FamilyInviteScreen() {
  const { token }    = useParams();
  const navigate     = useNavigate();
  const { profile }  = useAuth();
  const [invite,   setInvite]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [accepting,setAccepting]= useState(false);
  const [done,     setDone]     = useState(false);

  useEffect(() => {
    if (!token) { setError("Invalid invite link"); setLoading(false); return; }
    supabase
      .from("kid_family_members")
      .select("*, kids(name, avatar, animal_id), users(display_name)")
      .eq("invite_token", token)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setError("Invite not found or already used.");
        else setInvite(data);
        setLoading(false);
      });
  }, [token]);

  const accept = async () => {
    if (!profile) {
      sessionStorage.setItem("pendingInviteToken", token);
      navigate("/login?mode=signup");
      return;
    }
    setAccepting(true);
    try {
      await supabase.from("kid_family_members").update({
        invite_status: "accepted",
        auth_id: profile.auth_id,
      }).eq("invite_token", token);
      await supabase.from("users").update({
        display_name: profile.display_name || invite.member_name,
      }).eq("id", profile.id);
      setDone(true);
      setTimeout(() => navigate("/family"), 2000);
    } catch { setError("Failed to accept invite — try again."); }
    setAccepting(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.sky,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 20 }}>
      <style>{fontCSS}</style>
      <PrizeBox size={72} animate/>
      <Spinner color={T.purpleL}/>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: T.sky,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Nunito', sans-serif", padding: 24 }}>
      <style>{fontCSS}</style>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>😕</div>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22,
          color: T.text, marginBottom: 8 }}>This invite didn't work</div>
        <div style={{ fontSize: 14, color: T.sub, marginBottom: 24 }}>{error}</div>
        <button type="button" onClick={() => navigate("/")} style={{
          background: T.purple, border: "3px solid #000000", color: "white",
          borderRadius: 30, padding: "12px 28px", fontSize: 16,
          fontWeight: 800, cursor: "pointer",
          fontFamily: "'Fredoka One', cursive", boxShadow: "4px 4px 0 #000000",
        }}>Go Home</button>
      </div>
    </div>
  );

  const kidName    = invite.kids?.name || "a family kid";
  const inviterName = invite.users?.display_name || "a parent";

  if (done) return (
    <div style={{ minHeight: "100vh", background: T.sky,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Nunito', sans-serif", padding: 24 }}>
      <style>{fontCSS}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 12,
          animation: "bounce 2s ease-in-out infinite" }}>🎉</div>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28,
          color: T.text, marginBottom: 8 }}>You're in the family circle!</div>
        <div style={{ fontSize: 14, color: T.sub }}>Taking you to your family view…</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh",
      background: T.sky,
      fontFamily: "'Nunito', sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{fontCSS}</style>
      <StarField count={25}/>

      <div style={{ maxWidth: 440, width: "100%", position: "relative", zIndex: 1,
        animation: "fadeUp 0.4s ease" }}>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-block", marginBottom: 8,
            animation: "wiggle 2s ease-in-out infinite" }}>
            <Butterfly size={72}/>
          </div>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 26,
            color: T.purple }}>
            Family Circle Invite 💌
          </div>
        </div>

        <div style={{
          background: T.panel2, borderRadius: 24, padding: "28px 24px",
          border: `3px solid ${T.borderBold}`, boxShadow: "8px 8px 0 #000000",
        }}>
          <div style={{ fontSize: 15, color: T.text, lineHeight: 1.7, marginBottom: 20 }}>
            <strong style={{ color: T.purpleL }}>{inviterName}</strong> has invited you to be part of{" "}
            <strong style={{ color: T.orangeL }}>{kidName}</strong>'s family circle on Digital Prize Box.
          </div>

          <div style={{ background: T.panel, borderRadius: 14,
            padding: "14px 16px", marginBottom: 20, border: `2px solid ${T.border}` }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: T.text, marginBottom: 8 }}>
              As a family circle member you can:
            </div>
            {[
              "👀 See " + kidName + "'s progress and balances",
              "🎁 Send orange buck gifts for birthdays and milestones",
              "🔔 Get notifications when " + kidName + " hits a goal",
            ].map((p, i) => (
              <div key={i} style={{ fontSize: 13, color: T.sub,
                display: "flex", gap: 8, marginBottom: i < 2 ? 6 : 0 }}>
                {p}
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, color: T.sub, marginBottom: 14, lineHeight: 1.6,
            background: `${T.purple}18`, borderRadius: 10, padding: "10px 14px",
            border: `2px solid ${T.purple}44` }}>
            <strong style={{ color: T.purpleL }}>Your access is view-only.</strong> You can't
            make purchases, approve chores, or change any settings.
          </div>

          {!profile && (
            <div style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>
              You'll need to create a free account to accept this invite.
            </div>
          )}

          <button type="button" onClick={accept} disabled={accepting} style={{
            width: "100%",
            background: accepting ? T.border : "#0033CC",
            border: "3px solid #000000", color: "white",
            borderRadius: 14, padding: "14px 0", fontSize: 17,
            fontWeight: 800, cursor: accepting ? "not-allowed" : "pointer",
            fontFamily: "'Fredoka One', cursive",
            boxShadow: accepting ? "none" : "5px 5px 0 #000000",
            opacity: accepting ? 0.7 : 1,
          }}>
            {accepting ? "⏳ Accepting…"
              : profile ? "💌 Accept Invite"
              : "💌 Create Account & Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── src/screens/KidScreen.jsx ───────────────────────────────────────────────
// Fixed from original:
//  ✅ kidId from useParams actually used — no more hardcoded "kid_alex"
//  ✅ PIN login gate before showing the prize box
//  ✅ Loads real kid data from Supabase
//  ✅ Passes real data down to PrizeBox dashboard
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect }   from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase }               from "../lib/auth";
import { fontCSS, T }             from "../lib/theme";
import { StarField, LoadingScreen, PrizeBox as PrizeBoxIcon } from "../lib/animals";
import KidDashboard               from "../dashboards/KidDashboard";

// ── PIN entry screen ──────────────────────────────────────────────────────────
function PinScreen({ kidName, kidAnimal, onSuccess, onBack }) {
  const [pin,    setPin]    = useState("");
  const [error,  setError]  = useState(false);
  const [shake,  setShake]  = useState(false);

  const digits = [1,2,3,4,5,6,7,8,9,"⌫",0,"✓"];

  const press = (d) => {
    if (d === "⌫") { setPin(p => p.slice(0,-1)); setError(false); return; }
    if (d === "✓")  { onSuccess(pin); return; }
    if (pin.length >= 4) return;
    setPin(p => p + d);
  };

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4) {
      onSuccess(pin, (ok) => {
        if (!ok) {
          setShake(true);
          setError(true);
          setTimeout(() => { setPin(""); setShake(false); }, 600);
        }
      });
    }
  }, [pin]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#1A0A3C,#2D1B69,#0F4C75)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Nunito', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{fontCSS}</style>
      <StarField count={30}/>

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: 320 }}>

        {/* Animal avatar */}
        <div style={{
          fontSize: 80, marginBottom: 8,
          animation: "bounce 3s ease-in-out infinite",
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
        }}>
          {kidAnimal}
        </div>

        <div style={{
          fontFamily: "'Fredoka One', cursive", fontSize: 28,
          color: "white", marginBottom: 4,
        }}>
          Hi {kidName}! 👋
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>
          Enter your PIN to open your Prize Box
        </div>

        {/* PIN dots */}
        <div style={{
          display: "flex", gap: 16, justifyContent: "center",
          marginBottom: 32,
          animation: shake ? "shake 0.4s ease" : "none",
        }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: 18, height: 18, borderRadius: "50%",
              background: pin.length > i
                ? (error ? T.red : T.purpleL)
                : "rgba(255,255,255,0.2)",
              border: `3px solid ${pin.length > i
                ? (error ? T.red : T.purpleL)
                : "rgba(255,255,255,0.3)"}`,
              transition: "all 0.15s",
              boxShadow: pin.length > i ? `0 0 12px ${T.purpleL}88` : "none",
            }}/>
          ))}
        </div>

        {/* Numpad */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12, padding: "0 24px",
        }}>
          {digits.map((d, i) => (
            <button key={i} type="button" onClick={() => press(d)}
              style={{
                background: d === "✓"
                  ? "linear-gradient(135deg,#7C3AED,#5B21B6)"
                  : d === "⌫"
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(255,255,255,0.12)",
                border: `3px solid ${d === "✓" ? T.purpleL : "rgba(255,255,255,0.2)"}`,
                borderRadius: 16, padding: "18px 0",
                fontFamily: d === "✓" || d === "⌫" ? "'Nunito', sans-serif" : "'Fredoka One', cursive",
                fontSize: d === "⌫" ? 20 : d === "✓" ? 22 : 26,
                color: "white", cursor: "pointer",
                boxShadow: d === "✓" ? "4px 4px 0 #1A0A3C" : "3px 3px 0 rgba(0,0,0,0.3)",
                transition: "all 0.1s",
                fontWeight: 800,
              }}>
              {d}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            marginTop: 16, fontSize: 14, color: T.red,
            fontWeight: 700, animation: "fadeUp 0.2s ease",
          }}>
            ❌ Wrong PIN — try again!
          </div>
        )}

        <button type="button" onClick={onBack} style={{
          marginTop: 24, background: "none", border: "none",
          color: "rgba(255,255,255,0.4)", cursor: "pointer",
          fontSize: 13, fontFamily: "'Nunito', sans-serif",
        }}>
          ← Not {kidName}?
        </button>
      </div>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function KidScreen() {
  const { kidId }            = useParams();
  const navigate             = useNavigate();
  const [kid,     setKid]    = useState(null);
  const [loading, setLoading]= useState(true);
  const [unlocked,setUnlocked]= useState(false);

  // Load kid data
  useEffect(() => {
    if (!kidId) { navigate("/"); return; }

    supabase
      .from("kids")
      .select(`
        *,
        teachers ( teacher_name, class_name, goal_amount, goal_label, goal_current ),
        jars ( * ),
        chores ( * )
      `)
      .eq("id", kidId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { navigate("/"); return; }
        setKid(data);
        // If kid has no PIN set, skip PIN screen
        if (!data.pin) setUnlocked(true);
        setLoading(false);
      });
  }, [kidId]);

  const handlePin = (enteredPin, callback) => {
    const ok = enteredPin === kid?.pin;
    if (ok) { setUnlocked(true); }
    if (callback) callback(ok);
  };

  if (loading) return <LoadingScreen message="Opening your Prize Box…"/>;
  if (!kid)    return null;

  if (!unlocked) {
    return (
      <PinScreen
        kidName={kid.name}
        kidAnimal={kid.avatar || "🦊"}
        onSuccess={handlePin}
        onBack={() => navigate("/")}
      />
    );
  }

  return <KidDashboard kid={kid} onRefresh={() => {
    supabase.from("kids").select(`*, teachers(*), jars(*), chores(*)`)
      .eq("id", kidId).single()
      .then(({ data }) => { if (data) setKid(data); });
  }}/>;
}

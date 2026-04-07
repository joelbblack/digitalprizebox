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
      background: T.sky,
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
          color: T.text, marginBottom: 4,
        }}>
          Hi {kidName}! 👋
        </div>
        <div style={{ fontSize: 14, color: T.sub, marginBottom: 32 }}>
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
                : "rgba(0,0,0,0.1)",
              border: `3px solid ${pin.length > i
                ? (error ? T.red : T.purpleL)
                : "rgba(0,0,0,0.15)"}`,
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
                  ? "#0033CC"
                  : d === "⌫"
                    ? "rgba(0,0,0,0.05)"
                    : "rgba(0,0,0,0.08)",
                border: `3px solid ${d === "✓" ? T.purpleL : "rgba(0,0,0,0.15)"}`,
                borderRadius: 16, padding: "18px 0",
                fontFamily: d === "✓" || d === "⌫" ? "'Nunito', sans-serif" : "'Fredoka One', cursive",
                fontSize: d === "⌫" ? 20 : d === "✓" ? 22 : 26,
                color: d === "✓" ? "white" : T.text, cursor: "pointer",
                boxShadow: d === "✓" ? "4px 4px 0 #000000" : "3px 3px 0 rgba(0,0,0,0.15)",
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
          color: T.sub, cursor: "pointer",
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
  const [error,   setError]  = useState(null);
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
      .then(({ data, error: fetchError }) => {
        if (fetchError || !data) {
          setError(fetchError?.message || "Could not load kid data");
          setLoading(false);
          return;
        }
        setKid(data);
        if (!data.pin) setUnlocked(true);
        setLoading(false);
      })
      .catch(() => {
        setError("Something went wrong loading your Prize Box");
        setLoading(false);
      });
  }, [kidId]);

  const handlePin = (enteredPin, callback) => {
    const ok = enteredPin === kid?.pin;
    if (ok) { setUnlocked(true); }
    if (callback) callback(ok);
  };

  if (loading) return <LoadingScreen message="Opening your Prize Box..."/>;
  if (error) return (
    <div style={{
      minHeight: "100vh",
      background: T.sky,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Nunito', sans-serif",
    }}>
      <style>{fontCSS}</style>
      <StarField count={20}/>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>😿</div>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: T.text, marginBottom: 8 }}>
          Oops! Something went wrong
        </div>
        <div style={{ fontSize: 14, color: T.sub, marginBottom: 24 }}>
          {error}
        </div>
        <button type="button" onClick={() => navigate("/")} style={{
          background: "#0033CC",
          border: "3px solid #000000", borderRadius: 14,
          padding: "12px 28px", color: "white",
          fontFamily: "'Fredoka One', cursive", fontSize: 16,
          cursor: "pointer", boxShadow: "4px 4px 0 #000000",
        }}>
          Go Back
        </button>
      </div>
    </div>
  );
  if (!kid) return null;

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
      .then(({ data, error: refreshError }) => {
        if (refreshError) { console.error("Refresh failed:", refreshError); return; }
        if (data) setKid(data);
      })
      .catch((err) => console.error("Refresh failed:", err));
  }}/>;
}

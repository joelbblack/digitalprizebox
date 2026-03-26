import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/auth";

const C = {
  bg:"#0F172A", panel:"#1E293B", border:"#334155",
  text:"#F1F5F9", sub:"#94A3B8", accent:"#6366F1",
  green:"#10B981", orange:"#F97316", red:"#EF4444",
};

const fontCSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
`;

const Field = ({ label, value, onChange, type = "text", placeholder }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: C.sub,
      textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
      {label}
    </div>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", background: C.bg, border: `1.5px solid ${C.border}`,
        borderRadius: 8, padding: "10px 14px", fontSize: 15, color: C.text,
        fontFamily: "Nunito, sans-serif", outline: "none", boxSizing: "border-box",
      }}
    />
  </div>
);

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode,     setMode]     = useState("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [role,     setRole]     = useState("parent");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) { setError(error.message); setLoading(false); return; }
    navigate("/dashboard");
  };

  const handleSignUp = async () => {
    if (!name.trim()) { setError("Please enter your name"); return; }
    setLoading(true);
    setError(null);
    const { data, error: signUpError } = await signUp(email, password, {
      display_name: name, role,
    });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        auth_id:      data.user.id,
        email,
        display_name: name,
        role,
        account_type: role === "teacher" ? "classroom"
                    : role === "principal" ? "classroom"
                    : "family",
      });
      if (profileError) console.error("Profile creation error:", profileError);
    }
    navigate("/setup");
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "Nunito, sans-serif",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
    }}>
      <style>{fontCSS}</style>

      <div style={{
        fontFamily: "Fredoka One, cursive", fontSize: 32,
        background: "linear-gradient(135deg, #6366F1, #F59E0B)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        marginBottom: 8,
      }}>🎁 Digital Prize Box</div>
      <div style={{ fontSize: 13, color: C.sub, marginBottom: 32 }}>
        Kids earn it. Parents control it.
      </div>

      <div style={{
        background: C.panel, borderRadius: 20, padding: "28px 24px",
        border: `1px solid ${C.border}`, width: "100%", maxWidth: 420,
        animation: "fadeUp 0.35s ease",
      }}>
        <div style={{ display: "flex", marginBottom: 24,
          background: "#0F172A", borderRadius: 10, padding: 4 }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null); }}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
                background: mode === m ? C.accent : "transparent",
                color: mode === m ? "white" : C.sub,
                fontSize: 14, fontWeight: 800, cursor: "pointer",
                fontFamily: "Nunito, sans-serif", transition: "all 0.2s",
              }}>
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {mode === "signup" && (
          <>
            <Field label="Your Name" value={name} onChange={setName}
              placeholder="Ms. Black" />
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.sub,
                textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
                I am a...
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { id: "parent",    emoji: "🏠", label: "Parent" },
                  { id: "teacher",   emoji: "🏫", label: "Teacher" },
                  { id: "principal", emoji: "🎓", label: "Principal" },
                ].map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)} style={{
                    flex: 1, padding: "10px 4px",
                    background: role === r.id ? `${C.accent}18` : "#0F172A",
                    border: `2px solid ${role === r.id ? C.accent : C.border}`,
                    borderRadius: 10, color: role === r.id ? C.text : C.sub,
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    fontFamily: "Nunito, sans-serif",
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{r.emoji}</div>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <Field label="Email" value={email} onChange={setEmail}
          type="email" placeholder="you@example.com" />
        <Field label="Password" value={password} onChange={setPassword}
          type="password" placeholder="••••••••" />

        {error && (
          <div style={{
            background: `${C.red}18`, border: `1px solid ${C.red}44`,
            borderRadius: 8, padding: "10px 14px",
            fontSize: 13, color: C.red, marginBottom: 14,
          }}>
            {error}
          </div>
        )}

        <button
          onClick={mode === "login" ? handleLogin : handleSignUp}
          disabled={loading || !email || !password}
          style={{
            width: "100%", padding: "12px 0",
            background: loading || !email || !password ? C.border : C.accent,
            border: "none", borderRadius: 10, color: "white",
            fontSize: 16, fontWeight: 800, cursor: "pointer",
            fontFamily: "Nunito, sans-serif",
            opacity: loading || !email || !password ? 0.6 : 1,
          }}>
          {loading ? "..." : mode === "login" ? "Sign In →" : "Create Account →"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10,
          margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <div style={{ fontSize: 12, color: C.sub }}>or</div>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <button onClick={async () => {
          await supabase.auth.signInWithOAuth({
            provider: "github",
            options: { redirectTo: `${window.location.origin}/dashboard` },
          });
        }} style={{
          width: "100%", padding: "11px 0",
          background: "transparent", border: `1.5px solid ${C.border}`,
          borderRadius: 10, color: C.sub,
          fontSize: 14, fontWeight: 800, cursor: "pointer",
          fontFamily: "Nunito, sans-serif",
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: 8,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={C.sub}>
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>

        {mode === "login" && (
          <div style={{ textAlign: "center", marginTop: 16,
            fontSize: 12, color: C.sub }}>
            <button onClick={async () => {
              if (!email) { setError("Enter your email first"); return; }
              await supabase.auth.resetPasswordForEmail(email);
              setError(null);
              alert("Password reset email sent!");
            }} style={{ background: "none", border: "none",
              color: C.accent, cursor: "pointer", fontSize: 12,
              fontFamily: "Nunito, sans-serif" }}>
              Forgot password?
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, fontSize: 12, color: C.sub, textAlign: "center" }}>
        By signing up you agree to our{" "}
        <a href="/terms" style={{ color: C.accent }}>Terms</a> and{" "}
        <a href="/privacy" style={{ color: C.accent }}>Privacy Policy</a>
      </div>
    </div>
  );
}

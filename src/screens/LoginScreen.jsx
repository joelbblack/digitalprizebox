// ─── src/screens/LoginScreen.jsx ─────────────────────────────────────────────
// Pop-art design: bold outlines, flat colors, Ben-Day dot textures.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect }   from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, supabase }     from "../lib/auth";
import { fontCSS, T }            from "../lib/theme";
import { PrizeBox, StarField }   from "../lib/animals";

const ROLES = [
  { id: "parent",         emoji: "🏠", label: "Parent",          desc: "Manage kids at home"       },
  { id: "teacher",        emoji: "🏫", label: "Teacher",         desc: "Run a classroom"            },
  { id: "both",           emoji: "🔄", label: "Both",            desc: "Parent & teacher"           },
  { id: "principal",      emoji: "🎓", label: "Principal",       desc: "Manage a school"            },
  { id: "superintendent", emoji: "🏛️", label: "Superintendent",  desc: "Manage a district"          },
];

export default function LoginScreen() {
  const { signIn, signUp, refresh, session, loading: authLoading } = useAuth();
  const navigate          = useNavigate();
  const [params]          = useSearchParams();
  const joinCode          = params.get("join") || "";
  const defaultMode       = params.get("mode") === "signup" ? "signup" : "login";

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!authLoading && session) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, session, navigate]);

  const [mode,     setMode]     = useState(defaultMode);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [role,     setRole]     = useState("parent");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [resetSent,setResetSent]= useState(false);

  const handleLogin = async () => {
    setLoading(true); setError(null);
    try {
      const { data, error } = await signIn(email, password);
      if (error) { setError(error.message); setLoading(false); return; }
      // Verify session is actually persisted before redirecting
      for (let i = 0; i < 10; i++) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) { window.location.href = "/dashboard"; return; }
        await new Promise(r => setTimeout(r, 300));
      }
      // If we get here, session never persisted
      setError("Login succeeded but session failed to save. Please try again.");
      setLoading(false);
    } catch (err) {
      setError(err.message || "Login failed — check your connection");
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!name.trim()) { setError("What's your name?"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError(null);

    const { data, error: signUpError } = await signUp(email, password, {
      display_name: name,
      role,
    });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }

    if (data.user) {
      const accountType = role === "superintendent" ? "district"
                        : role === "teacher" || role === "principal" ? "classroom"
                        : role === "both" ? "both" : "family";

      const { data: userRow, error: profileError } = await supabase
        .from("users")
        .insert({
          auth_id:      data.user.id,
          email,
          display_name: name,
          role,
          account_type: accountType,
          plan:         "free",
        })
        .select()
        .single();

      if (profileError) {
        console.error("Profile creation error:", profileError);
        setError("Account created but profile setup failed. Please contact support.");
        setLoading(false);
        return;
      }

      if (role === "teacher" || role === "both" || role === "principal") {
        await supabase.from("teachers").insert({
          user_id:      userRow.id,
          teacher_name: name,
          onboarded:    false,
        });
      }

      if (joinCode) {
        sessionStorage.setItem("pendingJoinCode", joinCode);
      }
    }

    navigate("/setup");
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) { setError("Enter your email first"); return; }
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setResetSent(true);
    setError(null);
  };

  const inp = {
    width: "100%", background: "#FFFFFF",
    border: `3px solid ${T.borderBold}`,
    borderRadius: 14, padding: "12px 16px",
    fontSize: 15, color: T.text,
    fontFamily: "'Nunito', sans-serif",
    outline: "none", boxSizing: "border-box",
    boxShadow: "3px 3px 0 #000000",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: T.sky,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Nunito', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{fontCSS}</style>
      <StarField count={35}/>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440 }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 28, animation: "fadeUp 0.4s ease" }}>
          <div style={{ display: "inline-block", animation: "bounce 3s ease-in-out infinite", marginBottom: 8 }}>
            <PrizeBox size={72}/>
          </div>
          <div style={{
            fontFamily: "'Fredoka One', cursive", fontSize: 32,
            color: T.purple,
            lineHeight: 1.1,
          }}>
            Digital Prize Box
          </div>
          <div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>
            Kids earn it. Parents control it.
          </div>
          {joinCode && (
            <div style={{
              marginTop: 12,
              background: "#FFFFFF", border: `3px solid ${T.green}`,
              borderRadius: 30, padding: "6px 16px",
              fontSize: 13, color: T.green, fontWeight: 700,
              display: "inline-block",
              boxShadow: `3px 3px 0 ${T.green}`,
            }}>
              Joining class: <strong>{joinCode}</strong>
            </div>
          )}
        </div>

        {/* Card */}
        <div style={{
          background: T.panel, borderRadius: 24, padding: "28px 24px",
          border: `3px solid ${T.borderBold}`,
          boxShadow: "7px 7px 0 #000000",
          animation: "pop 0.35s ease",
        }}>

          {/* Mode toggle */}
          <div style={{
            display: "flex", marginBottom: 24,
            background: "#FFFFFF", borderRadius: 14,
            padding: 4, border: `2px solid ${T.border}`,
          }}>
            {[
              { id: "login",  label: "Sign In"        },
              { id: "signup", label: "Create Account" },
            ].map(m => (
              <button key={m.id} type="button"
                onClick={() => { setMode(m.id); setError(null); setResetSent(false); }}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 10, border: "none",
                  background: mode === m.id ? T.purple : "transparent",
                  color: mode === m.id ? "white" : T.sub,
                  fontSize: 14, fontWeight: 800, cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  boxShadow: mode === m.id ? "3px 3px 0 #000000" : "none",
                  transition: "all 0.2s",
                }}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Signup-only fields */}
          {mode === "signup" && (
            <>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.sub,
                  textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
                  Your Name
                </div>
                <input
                  type="text" value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ms. Black"
                  style={inp}
                  onFocus={e => e.target.style.borderColor = T.purpleL}
                  onBlur={e => e.target.style.borderColor = T.borderBold}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.sub,
                  textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
                  I am a...
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {ROLES.map(r => (
                    <button key={r.id} type="button"
                      onClick={() => setRole(r.id)}
                      style={{
                        background: role === r.id ? `${T.purple}15` : "#FFFFFF",
                        border: `3px solid ${role === r.id ? T.purple : T.border}`,
                        borderRadius: 14, padding: "10px 8px",
                        cursor: "pointer", fontFamily: "'Nunito', sans-serif",
                        boxShadow: role === r.id ? `3px 3px 0 ${T.purple}` : "3px 3px 0 #000000",
                        transition: "all 0.15s", textAlign: "center",
                      }}>
                      <div style={{ fontSize: 22, marginBottom: 2 }}>{r.emoji}</div>
                      <div style={{
                        fontSize: 13, fontWeight: 800,
                        color: role === r.id ? T.purple : T.text,
                      }}>{r.label}</div>
                      <div style={{ fontSize: 10, color: T.sub, marginTop: 1 }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.sub,
              textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
              Email
            </div>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inp}
              onFocus={e => e.target.style.borderColor = T.purpleL}
              onBlur={e => e.target.style.borderColor = T.borderBold}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.sub,
              textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
              Password
            </div>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inp}
              onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignUp())}
              onFocus={e => e.target.style.borderColor = T.purpleL}
              onBlur={e => e.target.style.borderColor = T.borderBold}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#FFFFFF", border: `3px solid ${T.red}`,
              borderRadius: 12, padding: "10px 14px",
              fontSize: 13, color: T.red, marginBottom: 14,
              fontWeight: 700, boxShadow: `3px 3px 0 ${T.red}`,
            }}>
              {error}
            </div>
          )}

          {resetSent && (
            <div style={{
              background: "#FFFFFF", border: `3px solid ${T.green}`,
              borderRadius: 12, padding: "10px 14px",
              fontSize: 13, color: T.green, marginBottom: 14,
              fontWeight: 700, boxShadow: `3px 3px 0 ${T.green}`,
            }}>
              Reset email sent! Check your inbox.
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={mode === "login" ? handleLogin : handleSignUp}
            disabled={loading || !email || !password}
            style={{
              width: "100%", padding: "13px 0",
              background: loading || !email || !password
                ? T.border
                : T.purple,
              border: "3px solid #000000",
              borderRadius: 14, color: "white",
              fontSize: 17, fontWeight: 800, cursor: "pointer",
              fontFamily: "'Fredoka One', cursive",
              boxShadow: loading || !email || !password ? "none" : "4px 4px 0 #000000",
              opacity: loading || !email || !password ? 0.5 : 1,
              transition: "all 0.15s",
            }}>
            {loading ? "One moment..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>

          {/* Forgot password */}
          {mode === "login" && (
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button type="button" onClick={handleForgotPassword}
                style={{
                  background: "none", border: "none",
                  color: T.purple, cursor: "pointer",
                  fontSize: 13, fontWeight: 700,
                  fontFamily: "'Nunito', sans-serif",
                  textDecoration: "underline",
                }}>
                Forgot password?
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: T.sub }}>
          By signing up you agree to our{" "}
          <a href="/terms" style={{ color: T.purple }}>Terms</a> and{" "}
          <a href="/privacy" style={{ color: T.purple }}>Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}

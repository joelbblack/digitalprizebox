// Temporary diagnostic page — shows raw Supabase state from the browser.
// Visit /diag to see it. Remove when login is fixed.

import { useState, useEffect } from "react";
import { supabase } from "../lib/auth";

export default function DiagnosticPage() {
  const [log, setLog] = useState([]);
  const add = (msg) => setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  useEffect(() => {
    async function run() {
      add("Starting diagnostics...");

      // 1. Test basic Supabase connectivity
      add("1. Testing Supabase connection...");
      try {
        const start = Date.now();
        const { data, error } = await supabase.from("users").select("count").limit(1);
        const ms = Date.now() - start;
        add(`   Result: ${error ? `ERROR: ${error.message}` : `OK (${ms}ms)`}`);
      } catch (e) {
        add(`   Exception: ${e.message}`);
      }

      // 2. Check session
      add("2. Checking session...");
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          add(`   Session error: ${error.message}`);
        } else if (session) {
          add(`   Session found: ${session.user.email}`);
          add(`   User ID: ${session.user.id}`);
          add(`   Token expires: ${new Date(session.expires_at * 1000).toLocaleString()}`);

          // 3. Fetch profile with this session
          add("3. Fetching profile...");
          try {
            const start = Date.now();
            const { data: profile, error: profErr } = await supabase
              .from("users")
              .select("*")
              .eq("auth_id", session.user.id)
              .single();
            const ms = Date.now() - start;
            if (profErr) {
              add(`   Profile error (${ms}ms): ${profErr.message} [${profErr.code}]`);
            } else {
              add(`   Profile found (${ms}ms): ${profile.display_name}, role=${profile.role}`);
              add(`   signup_fee_paid=${profile.signup_fee_paid}, plan=${profile.plan}`);
            }
          } catch (e) {
            add(`   Profile exception: ${e.message}`);
          }
        } else {
          add("   No session — not logged in");

          // 3b. Try signing in
          add("3. No session. Try logging in below.");
        }
      } catch (e) {
        add(`   Session exception: ${e.message}`);
      }

      add("Done.");
    }
    run();
  }, []);

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loginResult, setLoginResult] = useState("");

  const tryLogin = async () => {
    setLoginResult("Signing in...");
    try {
      const start = Date.now();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw });
      const ms = Date.now() - start;
      if (error) {
        setLoginResult(`Error (${ms}ms): ${error.message}`);
      } else {
        setLoginResult(`Success (${ms}ms)! Session: ${!!data.session}, User: ${data.user?.email}`);
        // Re-run diagnostics
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (e) {
      setLoginResult(`Exception: ${e.message}`);
    }
  };

  return (
    <div style={{ fontFamily: "monospace", fontSize: 13, padding: 24, background: "#111", color: "#0f0", minHeight: "100vh" }}>
      <h2 style={{ color: "#ff0", marginBottom: 16 }}>Digital Prize Box - Diagnostics</h2>
      <div style={{ marginBottom: 24 }}>
        {log.map((line, i) => <div key={i} style={{ marginBottom: 4 }}>{line}</div>)}
      </div>

      <div style={{ borderTop: "1px solid #333", paddingTop: 16 }}>
        <h3 style={{ color: "#ff0" }}>Manual Login Test</h3>
        <div style={{ marginBottom: 8 }}>
          <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ background: "#222", color: "#0f0", border: "1px solid #444", padding: 8, marginRight: 8, fontFamily: "monospace" }} />
          <input placeholder="password" type="password" value={pw} onChange={e => setPw(e.target.value)}
            style={{ background: "#222", color: "#0f0", border: "1px solid #444", padding: 8, marginRight: 8, fontFamily: "monospace" }} />
          <button onClick={tryLogin}
            style={{ background: "#333", color: "#0f0", border: "1px solid #0f0", padding: "8px 16px", cursor: "pointer", fontFamily: "monospace" }}>
            Sign In
          </button>
        </div>
        {loginResult && <div style={{ color: "#ff0", marginTop: 8 }}>{loginResult}</div>}
      </div>
    </div>
  );
}

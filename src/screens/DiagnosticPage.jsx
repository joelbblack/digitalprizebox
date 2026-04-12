// Temporary diagnostic page — uses its OWN Supabase client to avoid
// any interference from AuthProvider's shared client.

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Fresh client — not the shared one from auth.js
const freshSupabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function DiagnosticPage() {
  const [log, setLog] = useState([]);
  const add = (msg) => setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  useEffect(() => {
    async function run() {
      add("Starting diagnostics with FRESH Supabase client...");

      // 0. Show localStorage state
      const keys = Object.keys(localStorage).filter(k => k.includes("supabase") || k.includes("sb-"));
      add(`0. localStorage keys with 'supabase'/'sb-': ${keys.length > 0 ? keys.join(", ") : "none"}`);

      // 1. Test basic connectivity with a simple fetch (no Supabase client)
      add("1. Raw fetch to Supabase REST API...");
      try {
        const start = Date.now();
        const resp = await fetch(
          `${process.env.REACT_APP_SUPABASE_URL}/rest/v1/users?select=id&limit=1`,
          {
            headers: {
              "apikey": process.env.REACT_APP_SUPABASE_ANON_KEY,
              "Authorization": `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
            },
          }
        );
        const ms = Date.now() - start;
        const body = await resp.text();
        add(`   Status: ${resp.status} (${ms}ms) Body: ${body.substring(0, 100)}`);
      } catch (e) {
        add(`   Fetch failed: ${e.message}`);
      }

      // 2. Test Supabase JS client query
      add("2. Supabase JS client query (fresh client)...");
      try {
        const start = Date.now();
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("TIMEOUT after 5s")), 5000)
        );
        const query = freshSupabase.from("users").select("id").limit(1);
        const result = await Promise.race([query, timeout]);
        const ms = Date.now() - start;
        add(`   Result (${ms}ms): ${JSON.stringify(result.data || result.error?.message)}`);
      } catch (e) {
        add(`   Error: ${e.message}`);
      }

      // 3. Test getSession
      add("3. Testing getSession (fresh client)...");
      try {
        const start = Date.now();
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("TIMEOUT after 5s")), 5000)
        );
        const sessionCall = freshSupabase.auth.getSession();
        const { data } = await Promise.race([sessionCall, timeout]);
        const ms = Date.now() - start;
        if (data?.session) {
          add(`   Session found (${ms}ms): ${data.session.user.email}`);
        } else {
          add(`   No session (${ms}ms)`);
        }
      } catch (e) {
        add(`   Error: ${e.message}`);
      }

      add("Done.");
    }
    run();
  }, []);

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loginResult, setLoginResult] = useState("");

  const tryLogin = async () => {
    setLoginResult("Signing in with fresh client...");
    try {
      const start = Date.now();
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT after 10s")), 10000)
      );
      const signInCall = freshSupabase.auth.signInWithPassword({ email, password: pw });
      const { data, error } = await Promise.race([signInCall, timeout]);
      const ms = Date.now() - start;
      if (error) {
        setLoginResult(`Error (${ms}ms): ${error.message}`);
      } else {
        setLoginResult(`SUCCESS (${ms}ms)! User: ${data.user?.email}, Session: ${!!data.session}`);
      }
    } catch (e) {
      setLoginResult(`Exception: ${e.message}`);
    }
  };

  const clearStorage = () => {
    const before = localStorage.length;
    localStorage.clear();
    sessionStorage.clear();
    add(`Cleared localStorage (had ${before} items) and sessionStorage`);
  };

  return (
    <div style={{ fontFamily: "monospace", fontSize: 13, padding: 24, background: "#111", color: "#0f0", minHeight: "100vh" }}>
      <h2 style={{ color: "#ff0", marginBottom: 16 }}>Digital Prize Box - Diagnostics</h2>
      <div style={{ marginBottom: 24 }}>
        {log.map((line, i) => <div key={i} style={{ marginBottom: 4 }}>{line}</div>)}
      </div>

      <div style={{ borderTop: "1px solid #333", paddingTop: 16, marginBottom: 24 }}>
        <button onClick={clearStorage}
          style={{ background: "#600", color: "#fff", border: "1px solid #f00", padding: "8px 16px", cursor: "pointer", fontFamily: "monospace", marginBottom: 16 }}>
          CLEAR ALL localStorage + sessionStorage
        </button>
        <p style={{ color: "#888", fontSize: 11 }}>Click this, then reload the page and run diagnostics again.</p>
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

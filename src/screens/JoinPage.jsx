// src/screens/JoinPage.jsx
// ─── Class Join Page ──────────────────────────────────────────────────────────
//  Route: digitalprizebox.com/join/:code
//  Parent scans QR code → lands here → sees class info → signs up
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/auth";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
@keyframes float  { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
`;

export default function JoinPage() {
  const { code }     = useParams();
  const navigate     = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!code) { setError("Invalid join link"); setLoading(false); return; }
    supabase
      .from("teachers")
      .select("*, users(display_name, email)")
      .eq("join_code", code.toUpperCase())
      .single()
      .then(({ data, error }) => {
        if (error || !data) setError("Class not found — check the code and try again.");
        else setTeacher(data);
        setLoading(false);
      });
  }, [code]);

  const handleJoin = () => {
    // Pass the join code through to signup so it auto-links the kid
    navigate(`/login?join=${code.toUpperCase()}&mode=signup`);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"Nunito, sans-serif", color:"#1E293B" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:12, animation:"float 2s ease-in-out infinite" }}>🎁</div>
        <div style={{ fontSize:16, color:"#64748B" }}>Loading class info...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"Nunito, sans-serif", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>😕</div>
        <div style={{ fontSize:20, fontWeight:800, color:"#1E293B", marginBottom:8 }}>Hmm, that didn't work</div>
        <div style={{ fontSize:14, color:"#64748B", marginBottom:24 }}>{error}</div>
        <button onClick={()=>navigate("/")} style={{
          background:"#6366F1", border:"none", color:"white",
          borderRadius:30, padding:"12px 28px", fontSize:16,
          fontWeight:800, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
          Go Home
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#EEF2FF,#F0FDF4)",
      fontFamily:"Nunito, sans-serif", display:"flex", alignItems:"center",
      justifyContent:"center", padding:24 }}>
      <style>{css}</style>

      <div style={{ maxWidth:480, width:"100%", animation:"fadeUp 0.4s ease" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:56, marginBottom:8, animation:"float 3s ease-in-out infinite" }}>🎁</div>
          <div style={{ fontFamily:"Fredoka One, cursive", fontSize:28,
            background:"linear-gradient(135deg,#6366F1,#F59E0B)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Digital Prize Box
          </div>
          <div style={{ fontSize:14, color:"#64748B", marginTop:4 }}>
            Kids earn it. Parents control it.
          </div>
        </div>

        {/* Class card */}
        <div style={{ background:"white", borderRadius:24, padding:"28px 24px",
          boxShadow:"0 4px 24px rgba(0,0,0,0.08)", marginBottom:16,
          border:"1px solid rgba(0,0,0,0.06)" }}>

          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20,
            paddingBottom:20, borderBottom:"1px solid #F1F5F9" }}>
            <div style={{ width:52, height:52, borderRadius:14,
              background:"linear-gradient(135deg,#6366F1,#8B5CF6)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:24, flexShrink:0 }}>🏫</div>
            <div>
              <div style={{ fontWeight:800, fontSize:18, color:"#1E293B" }}>
                You've been invited!
              </div>
              <div style={{ fontSize:13, color:"#64748B" }}>
                Join your child's class on Digital Prize Box
              </div>
            </div>
          </div>

          {/* Class details */}
          <div style={{ display:"grid", gap:12, marginBottom:24 }}>
            {[
              { label:"Teacher",    value: teacher.users?.display_name || teacher.teacher_name, emoji:"👩‍🏫" },
              { label:"Class",      value: teacher.class_name || "Classroom",                   emoji:"📚" },
              { label:"School",     value: teacher.school_name || "—",                          emoji:"🏫" },
              { label:"Join Code",  value: code.toUpperCase(),                                   emoji:"🔑" },
            ].map(row => (
              <div key={row.label} style={{ display:"flex", alignItems:"center",
                gap:12, padding:"10px 14px", background:"#F8FAFC",
                borderRadius:12, border:"1px solid #E2E8F0" }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{row.emoji}</span>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#94A3B8",
                    textTransform:"uppercase", letterSpacing:1 }}>{row.label}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#1E293B" }}>{row.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div style={{ background:"#F0FDF4", borderRadius:14, padding:"14px 16px",
            marginBottom:24, border:"1px solid #BBF7D0" }}>
            <div style={{ fontWeight:800, fontSize:13, color:"#166534", marginBottom:10 }}>
              How it works for your family:
            </div>
            {[
              "Your child earns 🟠 orange bucks at school for good behavior",
              "They also earn orange at home by completing chores",
              "Save orange toward prizes on a wishlist — you approve everything",
              "Use 🟢 green money for instant digital rewards like Robux",
            ].map((step, i) => (
              <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start",
                fontSize:12, color:"#166534", marginBottom:i<3?8:0, lineHeight:1.5 }}>
                <span style={{ flexShrink:0, fontWeight:800 }}>{i+1}.</span>
                {step}
              </div>
            ))}
          </div>

          <button onClick={handleJoin} style={{
            width:"100%", background:"linear-gradient(135deg,#6366F1,#4F46E5)",
            border:"none", color:"white", borderRadius:14, padding:"14px 0",
            fontSize:18, fontWeight:800, cursor:"pointer",
            fontFamily:"Fredoka One, cursive",
            boxShadow:"0 4px 16px rgba(99,102,241,0.4)" }}>
            Join {teacher.users?.display_name || teacher.teacher_name}'s Class →
          </button>

          <div style={{ textAlign:"center", marginTop:12, fontSize:12, color:"#94A3B8" }}>
            Free to sign up · Takes 2 minutes
          </div>
        </div>

        {/* App store links */}
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:12, color:"#94A3B8", marginBottom:10 }}>
            Also available as a mobile app
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
            {[
              { label:"App Store",   emoji:"🍎" },
              { label:"Google Play", emoji:"▶️" },
            ].map(s => (
              <div key={s.label} style={{ background:"#1E293B", borderRadius:10,
                padding:"8px 16px", display:"flex", alignItems:"center", gap:8,
                cursor:"pointer" }}>
                <span style={{ fontSize:16 }}>{s.emoji}</span>
                <div>
                  <div style={{ fontSize:9, color:"#94A3B8" }}>Download on</div>
                  <div style={{ fontSize:12, fontWeight:700, color:"white" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

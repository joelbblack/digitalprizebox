// src/dashboards/TeacherFlyerAndEditor.jsx
// ─── Teacher Class Editor + QR Flyer Generator ────────────────────────────────
//  Drop into teacher dashboard as a new tab.
//  Generates a printable flyer with QR code linking to digitalprizebox.com/join/:code
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/auth";

const C = {
  bg:"#0F172A", panel:"#1E293B", panel2:"#162032", border:"#334155",
  text:"#F1F5F9", sub:"#94A3B8", accent:"#6366F1",
  green:"#10B981", orange:"#F97316", gold:"#F59E0B",
};

const Field = ({label, value, onChange, placeholder, type="text"}) => (
  <div style={{ marginBottom:16 }}>
    <div style={{ fontSize:11, fontWeight:700, color:C.sub,
      textTransform:"uppercase", letterSpacing:1.5, marginBottom:6 }}>{label}</div>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width:"100%", background:C.bg, border:`1.5px solid ${C.border}`,
        borderRadius:8, padding:"9px 12px", fontSize:14, color:C.text,
        fontFamily:"Nunito, sans-serif", outline:"none", boxSizing:"border-box" }}/>
  </div>
);

// ── QR Code generator (pure JS, no library needed) ────────────────────────────
// Uses Google Charts API to generate QR code image
function QRCode({ url, size=200 }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=FFFFFF&color=1E293B&margin=10`;
  return (
    <img src={src} alt="QR Code" width={size} height={size}
      style={{ borderRadius:12, display:"block" }}/>
  );
}

// ── Printable Flyer ───────────────────────────────────────────────────────────
function PrintableFlyer({ teacher, joinUrl, contactEmail }) {
  const flyerCSS = `
    @media print {
      body * { visibility: hidden; }
      #printable-flyer, #printable-flyer * { visibility: visible; }
      #printable-flyer { position: fixed; top: 0; left: 0; width: 100%; }
    }
    @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
  `;

  return (
    <div id="printable-flyer" style={{
      background:"white", width:"100%", maxWidth:560,
      margin:"0 auto", padding:"40px 36px",
      fontFamily:"Nunito, sans-serif", color:"#1E293B",
      border:"1px solid #E2E8F0", borderRadius:16,
    }}>
      <style>{flyerCSS}</style>

      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:28,
        paddingBottom:24, borderBottom:"2px solid #F1F5F9" }}>
        <div style={{ fontFamily:"Fredoka One, cursive", fontSize:32,
          background:"linear-gradient(135deg,#6366F1,#F59E0B)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          marginBottom:4 }}>
          🎁 Digital Prize Box
        </div>
        <div style={{ fontSize:14, color:"#64748B" }}>
          Kids earn it. Parents control it.
        </div>
      </div>

      {/* Headline */}
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ fontFamily:"Fredoka One, cursive", fontSize:26,
          color:"#1E293B", marginBottom:6 }}>
          Join Our Classroom!
        </div>
        <div style={{ fontSize:15, color:"#475569", lineHeight:1.6 }}>
          {teacher.teacher_name} · {teacher.class_name}
          {teacher.school_name && ` · ${teacher.school_name}`}
        </div>
      </div>

      {/* QR Code + join code */}
      <div style={{ display:"flex", gap:24, alignItems:"center",
        marginBottom:28, background:"#F8FAFC", borderRadius:16,
        padding:20, border:"1px solid #E2E8F0" }}>
        <div style={{ flexShrink:0 }}>
          <QRCode url={joinUrl} size={140}/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, color:"#64748B", marginBottom:8 }}>
            Scan to join our class, or visit:
          </div>
          <div style={{ fontSize:12, color:"#6366F1", fontWeight:700,
            wordBreak:"break-all", marginBottom:12 }}>
            {joinUrl}
          </div>
          <div style={{ background:"white", borderRadius:10,
            padding:"10px 14px", border:"2px solid #6366F1",
            display:"inline-block" }}>
            <div style={{ fontSize:10, color:"#94A3B8", fontWeight:700,
              textTransform:"uppercase", letterSpacing:1 }}>Join Code</div>
            <div style={{ fontFamily:"Fredoka One, cursive", fontSize:28,
              color:"#6366F1", letterSpacing:4 }}>{teacher.join_code}</div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"Fredoka One, cursive", fontSize:16,
          color:"#1E293B", marginBottom:12 }}>How It Works:</div>
        <div style={{ display:"grid", gap:10 }}>
          {[
            { emoji:"🟠", text:"Your child earns Orange Bucks at school for good behavior and effort" },
            { emoji:"🏠", text:"They also earn Orange Bucks at home by completing chores you set up" },
            { emoji:"⭐", text:"Save Orange Bucks toward a prize on their wishlist — you approve everything" },
            { emoji:"💻", text:"Unlock instant digital rewards like Robux when they hit their weekly goal" },
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start",
              background:"#F8FAFC", borderRadius:10, padding:"10px 14px",
              border:"1px solid #E2E8F0" }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{s.emoji}</span>
              <div style={{ fontSize:13, color:"#475569", lineHeight:1.5 }}>{s.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* App store */}
      <div style={{ display:"flex", gap:12, marginBottom:24, justifyContent:"center" }}>
        {[
          { label:"Download on the App Store",   sub:"iPhone & iPad", emoji:"🍎" },
          { label:"Get it on Google Play",        sub:"Android",       emoji:"▶️" },
        ].map(s => (
          <div key={s.label} style={{ background:"#1E293B", borderRadius:10,
            padding:"10px 16px", display:"flex", alignItems:"center", gap:10, flex:1 }}>
            <span style={{ fontSize:22 }}>{s.emoji}</span>
            <div>
              <div style={{ fontSize:9, color:"#94A3B8" }}>{s.label}</div>
              <div style={{ fontSize:12, fontWeight:700, color:"white" }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact + footer */}
      <div style={{ borderTop:"2px solid #F1F5F9", paddingTop:16,
        textAlign:"center", fontSize:12, color:"#94A3B8" }}>
        {contactEmail && (
          <div style={{ marginBottom:6 }}>
            Questions? Email {teacher.teacher_name} at{" "}
            <span style={{ color:"#6366F1", fontWeight:700 }}>{contactEmail}</span>
          </div>
        )}
        <div>digitalprizebox.com · Free for families</div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TeacherFlyerAndEditor({ teacherId, userId }) {
  const [teacher,      setTeacher]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [showFlyer,    setShowFlyer]    = useState(false);
  const [toast,        setToast]        = useState(null);
  const [contactEmail, setContactEmail] = useState("");

  // Editable fields
  const [form, setForm] = useState({
    teacher_name: "",
    class_name:   "",
    school_name:  "",
    goal_label:   "",
  });

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null), 2600); };

  useEffect(() => {
    if (!teacherId && !userId) return;
    const query = teacherId
      ? supabase.from("teachers").select("*, users(email, display_name)").eq("id", teacherId)
      : supabase.from("teachers").select("*, users(email, display_name)").eq("user_id", userId);

    query.single().then(({ data, error }) => {
      if (error) { console.error(error); setLoading(false); return; }
      setTeacher(data);
      setContactEmail(data.users?.email || "");
      setForm({
        teacher_name: data.teacher_name || "",
        class_name:   data.class_name   || "",
        school_name:  data.school_name  || "",
        goal_label:   data.goal_label   || "Pizza Party",
      });
      setLoading(false);
    });
  }, [teacherId, userId]);

  const save = async () => {
    if (!teacher) return;
    setSaving(true);
    const { error } = await supabase
      .from("teachers")
      .update(form)
      .eq("id", teacher.id);
    if (error) { showToast("❌ Failed to save"); console.error(error); }
    else {
      setTeacher(prev => ({ ...prev, ...form }));
      showToast("✅ Class info saved!");
    }
    setSaving(false);
  };

  const print = () => window.print();

  if (loading) return (
    <div style={{ textAlign:"center", padding:"40px 0", color:C.sub }}>
      Loading class info...
    </div>
  );

  if (!teacher) return (
    <div style={{ textAlign:"center", padding:"40px 0", color:C.sub }}>
      No teacher record found.
    </div>
  );

  const joinUrl = `https://digitalprizebox.com/join/${teacher.join_code}`;

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:30, left:"50%", transform:"translateX(-50%)",
          background:`linear-gradient(135deg,${C.accent},#8B5CF6)`,
          color:"white", borderRadius:30, padding:"12px 28px",
          fontFamily:"Fredoka One, cursive", fontSize:16,
          boxShadow:"0 8px 30px rgba(99,102,241,0.5)",
          zIndex:9999, whiteSpace:"nowrap" }}>{toast}</div>
      )}

      {/* Join code banner */}
      <div style={{ background:`linear-gradient(135deg,${C.accent}22,${C.accent}08)`,
        border:`1.5px solid ${C.accent}44`, borderRadius:16,
        padding:"16px 20px", marginBottom:20,
        display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.accent,
            textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>
            Your Class Join Code
          </div>
          <div style={{ fontFamily:"Fredoka One, cursive", fontSize:36,
            color:C.text, letterSpacing:6 }}>{teacher.join_code}</div>
          <div style={{ fontSize:12, color:C.sub, marginTop:4 }}>
            Parents enter this code to link their child to your class
          </div>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button type="button" onClick={()=>{
            navigator.clipboard?.writeText(joinUrl);
            showToast("📋 Link copied!");
          }} style={{ background:"transparent", border:`1.5px solid ${C.border}`,
            color:C.sub, borderRadius:10, padding:"8px 16px", fontSize:13,
            fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
            📋 Copy Link
          </button>
          <button type="button" onClick={()=>setShowFlyer(v=>!v)} style={{
            background:C.accent, border:"none", color:"white",
            borderRadius:10, padding:"8px 16px", fontSize:13,
            fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
            {showFlyer ? "✕ Hide Flyer" : "🖨️ View Flyer"}
          </button>
        </div>
      </div>

      {/* Printable flyer */}
      {showFlyer && (
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"flex-end",
            gap:10, marginBottom:12 }}>
            <button type="button" onClick={print} style={{
              background:C.green, border:"none", color:"white",
              borderRadius:10, padding:"10px 20px", fontSize:14,
              fontWeight:800, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
              🖨️ Print Flyer
            </button>
          </div>
          <PrintableFlyer
            teacher={{ ...teacher, ...form }}
            joinUrl={joinUrl}
            contactEmail={contactEmail}
          />
        </div>
      )}

      {/* Class editor */}
      <div style={{ background:C.panel, borderRadius:14, padding:20,
        border:`1px solid ${C.border}`, marginBottom:16 }}>
        <div style={{ fontSize:16, fontWeight:800, marginBottom:20 }}>
          ✏️ Edit Class Info
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
          <Field label="Teacher Name"
            value={form.teacher_name}
            onChange={v=>setForm(p=>({...p,teacher_name:v}))}
            placeholder="Ms. Black"/>
          <Field label="Class Name"
            value={form.class_name}
            onChange={v=>setForm(p=>({...p,class_name:v}))}
            placeholder="Room 12 — 4th Grade"/>
          <Field label="School Name"
            value={form.school_name}
            onChange={v=>setForm(p=>({...p,school_name:v}))}
            placeholder="Lincoln Elementary"/>
          <Field label="Class Goal Label"
            value={form.goal_label}
            onChange={v=>setForm(p=>({...p,goal_label:v}))}
            placeholder="Pizza Party"/>
        </div>
        <Field label="Contact Email (shown on flyer)"
          value={contactEmail}
          onChange={setContactEmail}
          placeholder="teacher@school.edu"
          type="email"/>
        <button type="button" onClick={save} disabled={saving} style={{
          background:saving?"#334155":C.green, border:"none", color:"white",
          borderRadius:10, padding:"10px 24px", fontSize:14, fontWeight:800,
          cursor:saving?"not-allowed":"pointer", fontFamily:"Nunito, sans-serif",
          opacity:saving?0.6:1 }}>
          {saving?"Saving...":"✅ Save Changes"}
        </button>
      </div>

      {/* QR Code preview */}
      <div style={{ background:C.panel, borderRadius:14, padding:20,
        border:`1px solid ${C.border}` }}>
        <div style={{ fontSize:16, fontWeight:800, marginBottom:16 }}>
          📱 QR Code Preview
        </div>
        <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ background:"white", borderRadius:16, padding:12,
            display:"inline-block" }}>
            <QRCode url={joinUrl} size={160}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, color:C.sub, marginBottom:8 }}>
              This QR code links parents directly to your class join page.
              Print it on the flyer or share it digitally.
            </div>
            <div style={{ background:C.panel2, borderRadius:10, padding:"10px 14px",
              fontSize:12, color:C.accent, wordBreak:"break-all",
              fontFamily:"monospace", marginBottom:12 }}>
              {joinUrl}
            </div>
            <button type="button" onClick={()=>{
              navigator.clipboard?.writeText(joinUrl);
              showToast("📋 Join link copied!");
            }} style={{ background:"transparent", border:`1.5px solid ${C.border}`,
              color:C.sub, borderRadius:10, padding:"8px 16px", fontSize:13,
              fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
              📋 Copy Join Link
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

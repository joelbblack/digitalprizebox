import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/auth";
import { T } from "../lib/theme";
import TeacherFlyerAndEditor from "./TeacherFlyerAndEditor";

// ─── EmojiInput ─────────────────────────────────────────────────────────────
function EmojiInput({ value, onChange, placeholder = "🎁", C }) {
  const [error, setError] = useState(null);
  const validate = (str) => {
    if (!str) { setError(null); return true; }
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const clusters = [...seg.segment(str)];
    if (clusters.length > 1) { setError("One emoji only! ✂️"); return false; }
    const isEmoji = /^\p{Emoji}/u.test(str) && !/^[0-9#*]$/.test(str);
    if (!isEmoji) { setError("Try a single emoji like 🐍!"); return false; }
    setError(null); return true;
  };
  const handleChange = (str) => { validate(str); onChange(str); };
  const border = C ? `1.5px solid ${error ? C.red : C.border}` : `1.5px solid ${error ? "#EF4444" : "#222222"}`;
  return (
    <div>
      <input type="text" value={value} onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        style={{ width:"100%", background:"#FFFFFF", border, borderRadius:8,
          padding:"9px 12px", fontSize:20, color:"#111111",
          fontFamily:"Nunito, sans-serif", outline:"none",
          textAlign:"center", boxSizing:"border-box", transition:"border-color 0.2s" }}/>
      {error && <div style={{ marginTop:5, fontSize:11, color:"#EF4444", fontWeight:700 }}>{error}</div>}
    </div>
  );
}

const fontCSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
@keyframes pop { 0%{transform:scale(0.9);opacity:0;} 60%{transform:scale(1.04);} 100%{transform:scale(1);opacity:1;} }
`;

const CATEGORIES = ["Sticker / Art Supply","Craft Kit","Game / Toy","Book","Digital Code","Food Treat","Other"];

export default function TeacherDashboard({ profile }) {
  // ── Teacher record ──────────────────────────────────────────────────────────
  const [teacher, setTeacher] = useState(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);

  // ── Tab state ───────────────────────────────────────────────────────────────
  const [tab, setTab] = useState("prizes");

  // ── Data from Supabase ──────────────────────────────────────────────────────
  const [students, setStudents]             = useState([]);
  const [jobs, setJobs]                     = useState([]);
  const [classroomPrizes, setClassroomPrizes] = useState([]);
  const [prizes, setPrizes]                 = useState([]);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [bonusAmount, setBonusAmount]       = useState(50);
  const [bonusNote, setBonusNote]           = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toast, setToast]                   = useState(null);
  const [newPrize, setNewPrize]             = useState({ name:"", category:CATEGORIES[0], price:"", physical:true, photo:null });
  const [newJob, setNewJob]                 = useState({ name:"", emoji:"🏅", cost:50 });
  const [newClassroom, setNewClassroom]     = useState({ label:"", emoji:"🎁", cost:50 });
  const photoRef = useRef();

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // ── Load teacher record ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from("teachers")
      .select("*")
      .eq("user_id", profile.id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error("Teacher load:", error);
        setTeacher(data);
        setLoadingTeacher(false);
      });
  }, [profile?.id]);

  // ── Load all teacher data once we have teacher.id ───────────────────────────
  const loadStudents = useCallback(async (teacherId) => {
    // Get kids linked via class_memberships
    const { data: memberships } = await supabase
      .from("class_memberships")
      .select("kid_id")
      .eq("teacher_id", teacherId)
      .eq("is_active", true);

    if (!memberships?.length) {
      // Fallback: also check kids.teacher_id (legacy direct link)
      const { data: directKids } = await supabase
        .from("kids")
        .select("id, name, avatar, orange_balance, green_balance, chores_completed, animal_id")
        .eq("teacher_id", teacherId);
      setStudents(directKids || []);
      return;
    }

    const kidIds = memberships.map(m => m.kid_id);
    const { data: kids } = await supabase
      .from("kids")
      .select("id, name, avatar, orange_balance, green_balance, chores_completed, animal_id")
      .in("id", kidIds);
    setStudents(kids || []);
  }, []);

  const loadJobs = useCallback(async (teacherId) => {
    const { data } = await supabase
      .from("class_jobs")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("sort_order", { ascending: true });
    setJobs(data || []);
  }, []);

  const loadClassroomPrizes = useCallback(async (teacherId) => {
    const { data } = await supabase
      .from("classroom_rewards")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("sort_order", { ascending: true });
    setClassroomPrizes(data || []);
  }, []);

  useEffect(() => {
    if (!teacher?.id) return;
    loadStudents(teacher.id);
    loadJobs(teacher.id);
    loadClassroomPrizes(teacher.id);
  }, [teacher?.id, loadStudents, loadJobs, loadClassroomPrizes]);

  // ── CRUD: Class Jobs ────────────────────────────────────────────────────────
  const addJob = async () => {
    if (!newJob.name || !teacher) return;
    const seg = new Intl.Segmenter(undefined, { granularity:"grapheme" });
    const clusters = [...seg.segment(newJob.emoji || "")];
    const validEmoji = clusters.length===1 && /^\p{Emoji}/u.test(newJob.emoji) && !/^[0-9#*]$/.test(newJob.emoji);
    if (!validEmoji) { showToast("Pick a valid single emoji first!"); return; }

    const { error } = await supabase.from("class_jobs").insert({
      teacher_id: teacher.id,
      name: newJob.name,
      emoji: newJob.emoji,
      orange_cost: newJob.cost,
      sort_order: jobs.length,
    });
    if (error) { showToast("Failed to add job"); console.error(error); return; }
    setNewJob({ name:"", emoji:"🏅", cost:50 });
    showToast("Class job added!");
    loadJobs(teacher.id);
  };

  const deleteJob = async (jobId) => {
    await supabase.from("class_jobs").delete().eq("id", jobId);
    loadJobs(teacher.id);
  };

  // ── CRUD: Classroom Prizes ──────────────────────────────────────────────────
  const addClassroomPrize = async () => {
    if (!newClassroom.label || !teacher) return;
    const seg = new Intl.Segmenter(undefined, { granularity:"grapheme" });
    const clusters = [...seg.segment(newClassroom.emoji || "")];
    const validEmoji = clusters.length===1 && /^\p{Emoji}/u.test(newClassroom.emoji) && !/^[0-9#*]$/.test(newClassroom.emoji);
    if (!validEmoji) { showToast("Pick a valid single emoji first!"); return; }

    const { error } = await supabase.from("classroom_rewards").insert({
      teacher_id: teacher.id,
      label: newClassroom.label,
      emoji: newClassroom.emoji,
      orange_cost: newClassroom.cost,
      sort_order: classroomPrizes.length,
    });
    if (error) { showToast("Failed to add prize"); console.error(error); return; }
    setNewClassroom({ label:"", emoji:"🎁", cost:50 });
    showToast("Classroom prize added!");
    loadClassroomPrizes(teacher.id);
  };

  const toggleClassroomPrize = async (prizeId, currentActive) => {
    await supabase.from("classroom_rewards").update({ is_active: !currentActive }).eq("id", prizeId);
    loadClassroomPrizes(teacher.id);
  };

  // ── Award Orange Bucks ──────────────────────────────────────────────────────
  const awardBonus = async () => {
    if (!selectedStudent || !profile || !teacher) return;
    const student = students.find(s => s.id === selectedStudent);
    if (!student) return;

    // Insert orange_awards record
    const { error: awardErr } = await supabase.from("orange_awards").insert({
      kid_id: selectedStudent,
      awarded_by: profile.id,
      source: "teacher",
      amount: bonusAmount,
      reason: bonusNote || null,
    });
    if (awardErr) { showToast("Failed to award points"); console.error(awardErr); return; }

    // Update kid's orange_balance and orange_from_teacher
    const { error: updateErr } = await supabase
      .from("kids")
      .update({
        orange_balance: student.orange_balance + bonusAmount,
        orange_from_teacher: (student.orange_from_teacher || 0) + bonusAmount,
      })
      .eq("id", selectedStudent);
    if (updateErr) { console.error("Balance update error:", updateErr); }

    // Update class goal
    if (teacher.goal_current !== undefined) {
      await supabase
        .from("teachers")
        .update({ goal_current: teacher.goal_current + bonusAmount })
        .eq("id", teacher.id);
      setTeacher(prev => ({ ...prev, goal_current: prev.goal_current + bonusAmount }));
    }

    showToast(`${bonusAmount} orange bucks awarded to ${student.name}!`);
    setBonusNote("");
    setSelectedStudent(null);
    loadStudents(teacher.id);
  };

  // ── Photo handling (local only — prize catalog is still local state) ────────
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewPrize(prev => ({...prev, photo:ev.target.result}));
    reader.readAsDataURL(file);
  };

  const addPrize = () => {
    if (!newPrize.name || !newPrize.price) return;
    setPrizes(prev => [...prev, { ...newPrize, id:Date.now(), active:true, price:Number(newPrize.price) }]);
    setNewPrize({ name:"", category:CATEGORIES[0], price:"", physical:true, photo:null });
    showToast("Prize added!");
  };

  const togglePrize = (id) => setPrizes(prev => prev.map(p => p.id===id ? {...p, active:!p.active} : p));

  // ── Styles ──────────────────────────────────────────────────────────────────
  const C = {
    bg:"#FFFFFF", panel:"#F5F5F5", border:"#222222",
    text:"#111111", sub:"#555555", accent:"#0033CC",
    green:"#10B981", gold:"#F59E0B", red:"#EF4444",
    orange:"#F97316",
  };

  const tabBtn = (id, lbl, emoji) => (
    <button key={id} onClick={() => setTab(id)} style={{
      background: tab===id ? C.accent : "transparent",
      border: `2px solid ${tab===id ? C.accent : C.border}`,
      color: tab===id ? "white" : C.sub,
      borderRadius:10, padding:"8px 16px",
      fontSize:13, fontWeight:700, cursor:"pointer",
      fontFamily:"Nunito, sans-serif", transition:"all 0.2s",
    }}>{emoji} {lbl}</button>
  );

  const card = (children, extra={}) => (
    <div style={{ background:C.panel, borderRadius:14, padding:"20px",
      border:`1px solid ${C.border}`, marginBottom:16,
      animation:"fadeIn 0.3s ease", ...extra }}>{children}</div>
  );

  const lbl = (text) => (
    <div style={{ fontSize:11, fontWeight:700, color:C.sub, textTransform:"uppercase",
      letterSpacing:1.5, marginBottom:6 }}>{text}</div>
  );

  const inp = (val, onChange, placeholder, type="text") => (
    <input type={type} value={val} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", background:"#FFFFFF", border:`1.5px solid ${C.border}`,
        borderRadius:8, padding:"9px 12px", fontSize:14, color:C.text,
        fontFamily:"Nunito, sans-serif", outline:"none", boxSizing:"border-box" }}/>
  );

  const primaryBtn = (onClick, children, color=C.accent) => (
    <button onClick={onClick} style={{ background:color, border:"none", color:"white",
      borderRadius:10, padding:"10px 20px", fontSize:14, fontWeight:800,
      cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>{children}</button>
  );

  // ── Loading / no teacher record ─────────────────────────────────────────────
  if (loadingTeacher) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex",
      alignItems:"center", justifyContent:"center", fontFamily:"Nunito, sans-serif" }}>
      <div style={{ color:C.sub, fontSize:16 }}>Loading your classroom...</div>
    </div>
  );

  if (!teacher) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex",
      alignItems:"center", justifyContent:"center", fontFamily:"Nunito, sans-serif",
      flexDirection:"column", gap:12, padding:40, textAlign:"center" }}>
      <div style={{ fontSize:48 }}>🍎</div>
      <div style={{ fontSize:18, fontWeight:800, color:C.text }}>No classroom found</div>
      <div style={{ fontSize:14, color:C.sub, maxWidth:400 }}>
        Your teacher record hasn't been created yet. This usually happens during setup.
        Try logging out and signing up again as a teacher.
      </div>
    </div>
  );

  // ── Goal progress ───────────────────────────────────────────────────────────
  const goalPct = teacher.goal_amount > 0
    ? Math.min(100, Math.round((teacher.goal_current / teacher.goal_amount) * 100))
    : 0;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text,
      fontFamily:"Nunito, sans-serif", padding:"0 0 60px" }}>
      <style>{fontCSS}</style>

      {/* Header */}
      <div style={{ background:"#F5F5F5",
        borderBottom:`2px solid ${C.border}`, padding:"16px 24px",
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontFamily:"Fredoka One, cursive", fontSize:26,
            color:"#0033CC" }}>
            Digital Prize Box
          </div>
          <div style={{ fontSize:12, color:C.sub }}>
            Teacher Dashboard — {teacher.teacher_name || profile?.display_name || "My Class"}
            {teacher.class_name && ` — ${teacher.class_name}`}
          </div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ background:"#F5F5F5", border:`1px solid ${C.border}`,
            borderRadius:10, padding:"8px 16px", textAlign:"center" }}>
            <div style={{ fontSize:11, color:C.sub }}>Orange Pool</div>
            <div style={{ fontFamily:"Fredoka One, cursive", fontSize:20, color:C.orange }}>
              {teacher.orange_pool || 0}
            </div>
          </div>
          <div style={{ background:"#F5F5F5", border:`1px solid ${C.border}`,
            borderRadius:10, padding:"8px 16px", textAlign:"center" }}>
            <div style={{ fontSize:11, color:C.sub }}>Students</div>
            <div style={{ fontFamily:"Fredoka One, cursive", fontSize:20, color:C.green }}>{students.length}</div>
          </div>
          <div style={{ background:"#F5F5F5", border:`1px solid ${C.border}`,
            borderRadius:10, padding:"8px 16px", textAlign:"center" }}>
            <div style={{ fontSize:11, color:C.sub }}>Join Code</div>
            <div style={{ fontFamily:"Fredoka One, cursive", fontSize:18, color:C.accent, letterSpacing:2 }}>
              {teacher.join_code}
            </div>
          </div>
        </div>
      </div>

      {/* Class Goal Progress */}
      {teacher.goal_amount > 0 && (
        <div style={{ padding:"12px 24px", borderBottom:`1px solid ${C.border}`,
          background:"#FFFBEB" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text }}>
              Class Goal: {teacher.goal_label || "Pizza Party"}
            </div>
            <div style={{ fontSize:12, color:C.gold, fontWeight:800 }}>
              {teacher.goal_current || 0} / {teacher.goal_amount} orange
            </div>
          </div>
          <div style={{ background:"#E5E7EB", borderRadius:20, height:10, overflow:"hidden" }}>
            <div style={{ background:C.gold, height:"100%", width:`${goalPct}%`,
              borderRadius:20, transition:"width 0.5s ease" }}/>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ padding:"16px 24px", display:"flex", gap:8, flexWrap:"wrap",
        borderBottom:`1px solid ${C.border}` }}>
        {tabBtn("prizes",    "Prize Catalog",   "🛍️")}
        {tabBtn("jobs",      "Class Jobs",       "🏅")}
        {tabBtn("classroom", "Classroom Prizes", "🏫")}
        {tabBtn("students",  "Students",         "👦")}
        {tabBtn("bonus",     "Award Points",     "⭐")}
        {tabBtn("flyer",     "Class & Flyer",    "🖨️")}
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 20px" }}>

        {/* ── PRIZE CATALOG (local state — future: product_cache table) ── */}
        {tab==="prizes" && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{fontSize:13, color:C.sub, marginBottom:16}}>
              Physical and digital prizes available to students. Toggle to show or hide from the store.
            </div>
            {card(<>
              <div style={{fontSize:16, fontWeight:800, marginBottom:16}}>Add Prize</div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12}}>
                <div>{lbl("Prize Name")}{inp(newPrize.name, v=>setNewPrize(p=>({...p,name:v})), "e.g. 3D Wood Fox Kit")}</div>
                <div>
                  {lbl("Category")}
                  <select value={newPrize.category} onChange={e=>setNewPrize(p=>({...p,category:e.target.value}))}
                    style={{ width:"100%", background:"#FFFFFF", border:`1.5px solid ${C.border}`,
                      borderRadius:8, padding:"9px 12px", fontSize:14, color:C.text,
                      fontFamily:"Nunito, sans-serif", outline:"none", boxSizing:"border-box" }}>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"120px 1fr auto", gap:12, alignItems:"end", marginBottom:12}}>
                <div>{lbl("Price ($)")}{inp(newPrize.price, v=>setNewPrize(p=>({...p,price:v})), "12", "number")}</div>
                <div>
                  {lbl("Type")}
                  <div style={{display:"flex", gap:8}}>
                    {[{label:"Physical",val:true},{label:"Digital",val:false}].map(t=>(
                      <button key={t.label} onClick={()=>setNewPrize(p=>({...p,physical:t.val}))} style={{
                        flex:1, background:newPrize.physical===t.val?C.accent:"transparent",
                        border:`2px solid ${newPrize.physical===t.val?C.accent:C.border}`,
                        color:newPrize.physical===t.val?"white":C.sub,
                        borderRadius:8, padding:"9px 0", fontSize:13, fontWeight:700,
                        cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>{t.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  {lbl("Photo")}
                  <button onClick={()=>photoRef.current?.click()} style={{
                    background:"transparent", border:`1.5px solid ${C.border}`,
                    color:C.sub, borderRadius:8, padding:"9px 16px", fontSize:13,
                    cursor:"pointer", fontFamily:"Nunito, sans-serif", whiteSpace:"nowrap" }}>
                    {newPrize.photo?"Photo added":"Add photo"}
                  </button>
                  <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
                </div>
              </div>
              {primaryBtn(addPrize, "Add to Catalog")}
            </>)}
            {prizes.length === 0 && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:C.sub }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🛍️</div>
                <div style={{ fontSize:14 }}>No prizes yet. Add your first prize above!</div>
              </div>
            )}
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:14}}>
              {prizes.map(prize=>(
                <div key={prize.id} style={{ background:C.panel,
                  border:`1px solid ${prize.active?C.border:"#F5F5F5"}`,
                  borderRadius:14, overflow:"hidden", opacity:prize.active?1:0.5,
                  animation:"pop 0.3s ease" }}>
                  {prize.photo
                    ? <img src={prize.photo} alt="" style={{width:"100%",height:120,objectFit:"cover"}}/>
                    : <div style={{height:80, background:"#F5F5F5", display:"flex",
                        alignItems:"center", justifyContent:"center", fontSize:32}}>
                        {prize.physical?"🎁":"💻"}
                      </div>}
                  <div style={{padding:"12px 14px"}}>
                    <div style={{fontWeight:800, fontSize:14, marginBottom:4}}>{prize.name}</div>
                    <div style={{fontSize:11, color:C.sub, marginBottom:8}}>{prize.category}</div>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      <div style={{fontFamily:"Fredoka One, cursive", fontSize:18, color:C.green}}>${prize.price}</div>
                      <button onClick={()=>togglePrize(prize.id)} style={{
                        background:prize.active?C.green+"22":"transparent",
                        border:`1.5px solid ${prize.active?C.green:C.border}`,
                        color:prize.active?C.green:C.sub,
                        borderRadius:20, padding:"4px 12px", fontSize:11,
                        fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                        {prize.active?"Active":"Hidden"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CLASS JOBS (from Supabase) ── */}
        {tab==="jobs" && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{fontSize:13, color:C.sub, marginBottom:16}}>
              Students spend orange bucks to earn classroom jobs each week.
            </div>
            {card(<>
              <div style={{fontSize:16, fontWeight:800, marginBottom:16}}>Add Class Job</div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 80px 120px", gap:12, alignItems:"end"}}>
                <div>{lbl("Job Name")}{inp(newJob.name, v=>setNewJob(p=>({...p,name:v})), "e.g. Attendance Taker")}</div>
                <div>{lbl("Emoji")}<EmojiInput value={newJob.emoji} onChange={v=>setNewJob(p=>({...p,emoji:v}))} placeholder="🏅" C={C}/></div>
                <div>{lbl("Orange Cost")}{inp(newJob.cost, v=>setNewJob(p=>({...p,cost:Number(v)})), "50", "number")}</div>
              </div>
              <div style={{marginTop:12}}>{primaryBtn(addJob, "Add Job", C.green)}</div>
            </>)}
            {jobs.length === 0 && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:C.sub }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🏅</div>
                <div style={{ fontSize:14 }}>No class jobs yet. Add jobs that students can bid on!</div>
              </div>
            )}
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:12}}>
              {jobs.map(job=>(
                <div key={job.id} style={{ background:C.panel, border:`1px solid ${C.border}`,
                  borderRadius:14, padding:"16px", textAlign:"center", animation:"pop 0.3s ease",
                  position:"relative" }}>
                  <button onClick={() => deleteJob(job.id)} style={{
                    position:"absolute", top:8, right:8, background:"transparent",
                    border:"none", cursor:"pointer", fontSize:14, color:C.sub,
                    padding:"2px 6px", borderRadius:4 }}
                    title="Remove job">✕</button>
                  <div style={{fontSize:40, marginBottom:8}}>{job.emoji}</div>
                  <div style={{fontWeight:800, fontSize:15, marginBottom:4}}>{job.name}</div>
                  <div style={{display:"inline-flex", alignItems:"center", gap:4,
                    background:C.orange+"22", border:`1.5px solid ${C.orange}`,
                    borderRadius:20, padding:"4px 14px",
                    fontFamily:"Fredoka One, cursive", fontSize:16, color:C.orange}}>🟠 {job.orange_cost} pts</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CLASSROOM PRIZES (from Supabase) ── */}
        {tab==="classroom" && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{fontSize:13, color:C.sub, marginBottom:16}}>
              Free classroom prizes cost orange bucks only. Great for recognizing effort and behavior.
            </div>
            {card(<>
              <div style={{fontSize:16, fontWeight:800, marginBottom:16}}>Add Classroom Prize</div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 80px 120px", gap:12, alignItems:"end"}}>
                <div>{lbl("Prize Name")}{inp(newClassroom.label, v=>setNewClassroom(p=>({...p,label:v})), "e.g. Pick the Read Aloud")}</div>
                <div>{lbl("Emoji")}<EmojiInput value={newClassroom.emoji} onChange={v=>setNewClassroom(p=>({...p,emoji:v}))} placeholder="🎁" C={C}/></div>
                <div>{lbl("Orange Cost")}{inp(newClassroom.cost, v=>setNewClassroom(p=>({...p,cost:Number(v)})), "50", "number")}</div>
              </div>
              <div style={{marginTop:12}}>{primaryBtn(addClassroomPrize, "Add Prize", C.gold)}</div>
            </>)}
            {classroomPrizes.length === 0 && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:C.sub }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🏫</div>
                <div style={{ fontSize:14 }}>No classroom prizes yet. Add rewards your students can earn!</div>
              </div>
            )}
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:12}}>
              {classroomPrizes.map(p=>(
                <div key={p.id} style={{ background:C.panel, border:`1px solid ${C.border}`,
                  borderRadius:14, padding:"16px", textAlign:"center", animation:"pop 0.3s ease",
                  opacity: p.is_active ? 1 : 0.5 }}>
                  <div style={{fontSize:40, marginBottom:8}}>{p.emoji}</div>
                  <div style={{fontWeight:800, fontSize:14, marginBottom:8}}>{p.label}</div>
                  <div style={{display:"inline-flex", alignItems:"center", gap:4,
                    background:C.orange+"22", border:`1.5px solid ${C.orange}`,
                    borderRadius:20, padding:"4px 14px",
                    fontFamily:"Fredoka One, cursive", fontSize:16, color:C.orange}}>🟠 {p.orange_cost} pts</div>
                  <div style={{ marginTop:8 }}>
                    <button onClick={() => toggleClassroomPrize(p.id, p.is_active)} style={{
                      background: p.is_active ? C.green+"22" : "transparent",
                      border:`1.5px solid ${p.is_active ? C.green : C.border}`,
                      color: p.is_active ? C.green : C.sub,
                      borderRadius:20, padding:"4px 12px", fontSize:11,
                      fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                      {p.is_active ? "Active" : "Hidden"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STUDENTS (from Supabase) ── */}
        {tab==="students" && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{fontSize:13, color:C.sub, marginBottom:16}}>
              Students who joined your class. Parents link their kids using your join code: <strong style={{ color:C.accent, letterSpacing:2 }}>{teacher.join_code}</strong>
            </div>
            {students.length === 0 && (
              <div style={{ textAlign:"center", padding:"60px 20px", color:C.sub }}>
                <div style={{ fontSize:48, marginBottom:12 }}>👦</div>
                <div style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:8 }}>No students yet</div>
                <div style={{ fontSize:14, maxWidth:400, margin:"0 auto", lineHeight:1.6 }}>
                  Share your join code <strong style={{ color:C.accent, letterSpacing:2 }}>{teacher.join_code}</strong> with
                  parents. They'll enter it during setup to link their child to your classroom.
                </div>
                <div style={{ marginTop:16 }}>
                  <button onClick={() => setTab("flyer")} style={{
                    background:C.accent, border:"none", color:"white",
                    borderRadius:10, padding:"10px 20px", fontSize:14, fontWeight:800,
                    cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
                    Print a Flyer with QR Code
                  </button>
                </div>
              </div>
            )}
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:14}}>
              {students.map(s=>(
                <div key={s.id} style={{ background:C.panel, border:`1px solid ${C.border}`,
                  borderRadius:14, padding:"16px", textAlign:"center", animation:"pop 0.3s ease" }}>
                  <div style={{fontSize:44, marginBottom:8}}>{s.avatar || "🦊"}</div>
                  <div style={{fontWeight:800, fontSize:16, marginBottom:12}}>{s.name}</div>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                    <div style={{background:C.orange+"22", border:`1.5px solid ${C.orange}`,
                      borderRadius:10, padding:"8px", textAlign:"center"}}>
                      <div style={{fontSize:9, color:C.orange, fontWeight:700, textTransform:"uppercase", letterSpacing:1}}>🟠 Orange</div>
                      <div style={{fontFamily:"Fredoka One, cursive", fontSize:16, color:C.orange}}>{s.orange_balance}</div>
                    </div>
                    <div style={{background:C.green+"22", border:`1.5px solid ${C.green}`,
                      borderRadius:10, padding:"8px", textAlign:"center"}}>
                      <div style={{fontSize:9, color:C.green, fontWeight:700, textTransform:"uppercase", letterSpacing:1}}>🟢 Green</div>
                      <div style={{fontFamily:"Fredoka One, cursive", fontSize:16, color:C.green}}>{s.green_balance}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AWARD POINTS (real Supabase writes) ── */}
        {tab==="bonus" && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            {students.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:C.sub }}>
                <div style={{ fontSize:32, marginBottom:8 }}>⭐</div>
                <div style={{ fontSize:14 }}>No students to award points to yet. Share your join code first!</div>
              </div>
            ) : (<>
              {card(<>
                <div style={{fontSize:16, fontWeight:800, marginBottom:16}}>Award Orange Bucks</div>
                {lbl("Student")}
                <div style={{display:"flex", flexWrap:"wrap", gap:8, marginBottom:20}}>
                  {students.map(s=>(
                    <button key={s.id} onClick={()=>setSelectedStudent(s.id)} style={{
                      background:selectedStudent===s.id?C.orange:"transparent",
                      border:`2px solid ${selectedStudent===s.id?C.orange:C.border}`,
                      color:selectedStudent===s.id?"white":C.sub,
                      borderRadius:30, padding:"8px 16px", fontSize:14, fontWeight:700,
                      cursor:"pointer", fontFamily:"Nunito, sans-serif",
                      display:"flex", alignItems:"center", gap:6 }}>
                      {s.avatar || "🦊"} {s.name}
                    </button>
                  ))}
                </div>
                {lbl("Amount")}
                <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:20}}>
                  {[10,25,50,100].map(n=>(
                    <button key={n} onClick={()=>setBonusAmount(n)} style={{
                      background:bonusAmount===n?C.orange:"transparent",
                      border:`2px solid ${bonusAmount===n?C.orange:C.border}`,
                      color:bonusAmount===n?"white":C.sub,
                      borderRadius:30, padding:"8px 20px", fontSize:16, fontWeight:800,
                      cursor:"pointer", fontFamily:"Fredoka One, cursive" }}>+{n}</button>
                  ))}
                  <input type="number" value={bonusAmount} onChange={e=>setBonusAmount(Number(e.target.value))}
                    style={{ width:80, background:"#FFFFFF", border:`1.5px solid ${C.border}`,
                      borderRadius:8, padding:"8px 12px", fontSize:14, color:C.text,
                      fontFamily:"Nunito, sans-serif", outline:"none", textAlign:"center" }}/>
                </div>
                {lbl("Reason (optional)")}
                <div style={{marginBottom:16}}>
                  {inp(bonusNote, setBonusNote, "e.g. Amazing effort on the science project!")}
                </div>
                {primaryBtn(awardBonus, `Award ${bonusAmount} Orange Bucks`, C.orange)}
              </>)}
              {card(<>
                <div style={{fontSize:15, fontWeight:800, marginBottom:12}}>Quick Awards</div>
                <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:10}}>
                  {[
                    {label:"Kind Friend",   pts:25,  emoji:"💛"},
                    {label:"Great Effort",  pts:50,  emoji:"💪"},
                    {label:"Helped a Peer", pts:30,  emoji:"🤝"},
                    {label:"Perfect Week",  pts:100, emoji:"🌟"},
                    {label:"Creative Work", pts:40,  emoji:"🎨"},
                    {label:"Reading Goal",  pts:75,  emoji:"📚"},
                  ].map(q=>(
                    <button key={q.label} onClick={()=>{ setBonusAmount(q.pts); setBonusNote(q.label); }} style={{
                      background:C.panel, border:`1.5px solid ${C.border}`,
                      borderRadius:12, padding:"12px", cursor:"pointer",
                      fontFamily:"Nunito, sans-serif", textAlign:"left" }}>
                      <div style={{fontSize:24, marginBottom:4}}>{q.emoji}</div>
                      <div style={{fontSize:13, fontWeight:700, color:C.text}}>{q.label}</div>
                      <div style={{fontSize:12, color:C.orange}}>+{q.pts} pts</div>
                    </button>
                  ))}
                </div>
              </>)}
            </>)}
          </div>
        )}

        {/* ── CLASS & FLYER ── */}
        {tab==="flyer" && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <TeacherFlyerAndEditor teacherId={teacher.id} userId={profile?.id} />
          </div>
        )}

      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:30, left:"50%", transform:"translateX(-50%)",
          background:"#0033CC",
          color:"white", borderRadius:30, padding:"12px 28px",
          fontFamily:"Fredoka One, cursive", fontSize:16,
          boxShadow:"0 8px 30px rgba(0,51,204,0.5)",
          animation:"pop 0.3s ease", zIndex:9999, whiteSpace:"nowrap" }}>{toast}</div>
      )}
    </div>
  );
}

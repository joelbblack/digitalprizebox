import { useState, useRef } from "react";
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
  const border = C ? `1.5px solid ${error ? C.red : C.border}` : `1.5px solid ${error ? "#EF4444" : "#334155"}`;
  return (
    <div>
      <input type="text" value={value} onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        style={{ width:"100%", background:"#0F172A", border, borderRadius:8,
          padding:"9px 12px", fontSize:20, color:"#F1F5F9",
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

const CLASS_JOB_DEFAULTS = [
  { id:1, name:"Line Leader",     emoji:"🚶", cost:50 },
  { id:2, name:"Door Holder",     emoji:"🚪", cost:30 },
  { id:3, name:"Teacher Helper",  emoji:"🍎", cost:60 },
  { id:4, name:"Paper Passer",    emoji:"📄", cost:25 },
  { id:5, name:"Class Librarian", emoji:"📚", cost:40 },
  { id:6, name:"Board Eraser",    emoji:"🧽", cost:20 },
];

const CLASSROOM_DEFAULTS = [
  { label:"Homework Pass",        emoji:"📝", cost:80  },
  { label:"Extra Recess (10min)", emoji:"🏃", cost:100 },
  { label:"Lunch with Teacher",   emoji:"🍕", cost:150 },
  { label:"Sit Anywhere Day",     emoji:"🪑", cost:60  },
];

const STUDENTS = [
  { id:1, name:"Alex",   balance:1500, bonus:120, avatar:"🦊" },
  { id:2, name:"Jordan", balance:800,  bonus:340, avatar:"🐼" },
  { id:3, name:"Sam",    balance:2000, bonus:80,  avatar:"🦋" },
  { id:4, name:"Taylor", balance:500,  bonus:560, avatar:"🐸" },
  { id:5, name:"Morgan", balance:1200, bonus:200, avatar:"🦄" },
];

export default function TeacherDashboard({ profile }) {
  const [tab, setTab]   = useState("prizes");
  const [prizes, setPrizes] = useState([
    { id:1, name:"3D Wood Fox Kit",      category:"Craft Kit",          price:12, photo:null, active:true, physical:true  },
    { id:2, name:"Holographic Stickers", category:"Sticker / Art Supply",price:3,  photo:null, active:true, physical:true  },
    { id:3, name:"$5 Robux Card",        category:"Digital Code",        price:5,  photo:null, active:true, physical:false },
  ]);
  const [jobs,           setJobs]           = useState(CLASS_JOB_DEFAULTS);
  const [classroomPrizes,setClassroomPrizes]= useState(CLASSROOM_DEFAULTS);
  const [students,       setStudents]       = useState(STUDENTS);
  const [bonusAmount,    setBonusAmount]    = useState(50);
  const [bonusNote,      setBonusNote]      = useState("");
  const [selectedStudent,setSelectedStudent]= useState(null);
  const [toast,          setToast]          = useState(null);

  const [newPrize,     setNewPrize]     = useState({ name:"", category:CATEGORIES[0], price:"", physical:true, photo:null });
  const [newJob,       setNewJob]       = useState({ name:"", emoji:"🏅", cost:50 });
  const [newClassroom, setNewClassroom] = useState({ label:"", emoji:"🎁", cost:50 });
  const photoRef = useRef();

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const addPrize = () => {
    if (!newPrize.name || !newPrize.price) return;
    setPrizes(prev => [...prev, { ...newPrize, id:Date.now(), active:true, price:Number(newPrize.price) }]);
    setNewPrize({ name:"", category:CATEGORIES[0], price:"", physical:true, photo:null });
    showToast("✅ Prize added!");
  };

  const togglePrize = (id) => setPrizes(prev => prev.map(p => p.id===id ? {...p, active:!p.active} : p));

  const addJob = () => {
    if (!newJob.name) return;
    const seg = new Intl.Segmenter(undefined, { granularity:"grapheme" });
    const clusters = [...seg.segment(newJob.emoji || "")];
    const validEmoji = clusters.length===1 && /^\p{Emoji}/u.test(newJob.emoji) && !/^[0-9#*]$/.test(newJob.emoji);
    if (!validEmoji) { showToast("⚠️ Pick a valid single emoji first!"); return; }
    setJobs(prev => [...prev, { ...newJob, id:Date.now() }]);
    setNewJob({ name:"", emoji:"🏅", cost:50 });
    showToast("✅ Class job added!");
  };

  const addClassroomPrize = () => {
    if (!newClassroom.label) return;
    const seg = new Intl.Segmenter(undefined, { granularity:"grapheme" });
    const clusters = [...seg.segment(newClassroom.emoji || "")];
    const validEmoji = clusters.length===1 && /^\p{Emoji}/u.test(newClassroom.emoji) && !/^[0-9#*]$/.test(newClassroom.emoji);
    if (!validEmoji) { showToast("⚠️ Pick a valid single emoji first!"); return; }
    setClassroomPrizes(prev => [...prev, { ...newClassroom }]);
    setNewClassroom({ label:"", emoji:"🎁", cost:50 });
    showToast("✅ Classroom prize added!");
  };

  const awardBonus = () => {
    if (!selectedStudent) return;
    setStudents(prev => prev.map(s => s.id===selectedStudent ? {...s, bonus:s.bonus+bonusAmount} : s));
    const student = students.find(s => s.id===selectedStudent);
    showToast(`⭐ ${bonusAmount} bonus points → ${student.name}!`);
    setBonusNote("");
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewPrize(prev => ({...prev, photo:ev.target.result}));
    reader.readAsDataURL(file);
  };

  const C = {
    bg:"#0F172A", panel:"#1E293B", border:"#334155",
    text:"#F1F5F9", sub:"#94A3B8", accent:"#6366F1",
    green:"#10B981", gold:"#F59E0B", red:"#EF4444",
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
      style={{ width:"100%", background:"#0F172A", border:`1.5px solid ${C.border}`,
        borderRadius:8, padding:"9px 12px", fontSize:14, color:C.text,
        fontFamily:"Nunito, sans-serif", outline:"none" }}/>
  );

  const primaryBtn = (onClick, children, color=C.accent) => (
    <button onClick={onClick} style={{ background:color, border:"none", color:"white",
      borderRadius:10, padding:"10px 20px", fontSize:14, fontWeight:800,
      cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>{children}</button>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text,
      fontFamily:"Nunito, sans-serif", padding:"0 0 60px" }}>
      <style>{fontCSS}</style>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg, #1E293B, #0F172A)",
        borderBottom:`2px solid ${C.border}`, padding:"16px 24px",
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontFamily:"Fredoka One, cursive", fontSize:26,
            background:"linear-gradient(135deg, #6366F1, #F59E0B)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            🎁 Digital Prize Box
          </div>
          <div style={{ fontSize:12, color:C.sub }}>
            Teacher Dashboard — {profile?.display_name || "My Class"}
          </div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ background:"#1E293B", border:`1px solid ${C.border}`,
            borderRadius:10, padding:"8px 16px", textAlign:"center" }}>
            <div style={{ fontSize:11, color:C.sub }}>Class Box</div>
            <div style={{ fontFamily:"Fredoka One, cursive", fontSize:20, color:C.gold }}>$34.00</div>
          </div>
          <div style={{ background:"#1E293B", border:`1px solid ${C.border}`,
            borderRadius:10, padding:"8px 16px", textAlign:"center" }}>
            <div style={{ fontSize:11, color:C.sub }}>Students</div>
            <div style={{ fontFamily:"Fredoka One, cursive", fontSize:20, color:C.green }}>{students.length}</div>
          </div>
        </div>
      </div>

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

        {/* ── PRIZE CATALOG ── */}
        {tab==="prizes" && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{fontSize:13, color:C.sub, marginBottom:16}}>
              Physical and digital prizes available to students. Toggle to show or hide from the store.
            </div>
            {card(<>
              <div style={{fontSize:16, fontWeight:800, marginBottom:16}}>➕ Add Prize</div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12}}>
                <div>{lbl("Prize Name")}{inp(newPrize.name, v=>setNewPrize(p=>({...p,name:v})), "e.g. 3D Wood Fox Kit")}</div>
                <div>
                  {lbl("Category")}
                  <select value={newPrize.category} onChange={e=>setNewPrize(p=>({...p,category:e.target.value}))}
                    style={{ width:"100%", background:"#0F172A", border:`1.5px solid ${C.border}`,
                      borderRadius:8, padding:"9px 12px", fontSize:14, color:C.text,
                      fontFamily:"Nunito, sans-serif", outline:"none" }}>
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
                    {newPrize.photo?"✅ Photo":"📷 Add"}
                  </button>
                  <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
                </div>
              </div>
              {primaryBtn(addPrize, "✅ Add to Catalog")}
            </>)}
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:14}}>
              {prizes.map(prize=>(
                <div key={prize.id} style={{ background:C.panel,
                  border:`1px solid ${prize.active?C.border:"#1E293B"}`,
                  borderRadius:14, overflow:"hidden", opacity:prize.active?1:0.5,
                  animation:"pop 0.3s ease" }}>
                  {prize.photo
                    ? <img src={prize.photo} alt="" style={{width:"100%",height:120,objectFit:"cover"}}/>
                    : <div style={{height:80, background:"#162032", display:"flex",
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
                        {prize.active?"✅ Active":"○ Hidden"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CLASS JOBS ── */}
        {tab==="jobs" && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{fontSize:13, color:C.sub, marginBottom:16}}>
              Students spend bonus points to earn classroom jobs.
            </div>
            {card(<>
              <div style={{fontSize:16, fontWeight:800, marginBottom:16}}>➕ Add Class Job</div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 80px 120px", gap:12, alignItems:"end"}}>
                <div>{lbl("Job Name")}{inp(newJob.name, v=>setNewJob(p=>({...p,name:v})), "e.g. Attendance Taker")}</div>
                <div>{lbl("Emoji")}<EmojiInput value={newJob.emoji} onChange={v=>setNewJob(p=>({...p,emoji:v}))} placeholder="🏅" C={C}/></div>
                <div>{lbl("Point Cost")}{inp(newJob.cost, v=>setNewJob(p=>({...p,cost:Number(v)})), "50", "number")}</div>
              </div>
              <div style={{marginTop:12}}>{primaryBtn(addJob, "Add Job", C.green)}</div>
            </>)}
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:12}}>
              {jobs.map(job=>(
                <div key={job.id} style={{ background:C.panel, border:`1px solid ${C.border}`,
                  borderRadius:14, padding:"16px", textAlign:"center", animation:"pop 0.3s ease" }}>
                  <div style={{fontSize:40, marginBottom:8}}>{job.emoji}</div>
                  <div style={{fontWeight:800, fontSize:15, marginBottom:4}}>{job.name}</div>
                  <div style={{display:"inline-flex", alignItems:"center", gap:4,
                    background:C.gold+"22", border:`1.5px solid ${C.gold}`,
                    borderRadius:20, padding:"4px 14px",
                    fontFamily:"Fredoka One, cursive", fontSize:16, color:C.gold}}>⭐ {job.cost} pts</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CLASSROOM PRIZES ── */}
        {tab==="classroom" && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{fontSize:13, color:C.sub, marginBottom:16}}>
              Free classroom prizes cost bonus points only. Great for recognizing effort and behavior.
            </div>
            {card(<>
              <div style={{fontSize:16, fontWeight:800, marginBottom:16}}>➕ Add Classroom Prize</div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 80px 120px", gap:12, alignItems:"end"}}>
                <div>{lbl("Prize Name")}{inp(newClassroom.label, v=>setNewClassroom(p=>({...p,label:v})), "e.g. Pick the Read Aloud")}</div>
                <div>{lbl("Emoji")}<EmojiInput value={newClassroom.emoji} onChange={v=>setNewClassroom(p=>({...p,emoji:v}))} placeholder="🎁" C={C}/></div>
                <div>{lbl("Point Cost")}{inp(newClassroom.cost, v=>setNewClassroom(p=>({...p,cost:Number(v)})), "50", "number")}</div>
              </div>
              <div style={{marginTop:12}}>{primaryBtn(addClassroomPrize, "Add Prize", C.gold)}</div>
            </>)}
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:12}}>
              {classroomPrizes.map((p,i)=>(
                <div key={i} style={{ background:C.panel, border:`1px solid ${C.border}`,
                  borderRadius:14, padding:"16px", textAlign:"center", animation:"pop 0.3s ease" }}>
                  <div style={{fontSize:40, marginBottom:8}}>{p.emoji}</div>
                  <div style={{fontWeight:800, fontSize:14, marginBottom:8}}>{p.label}</div>
                  <div style={{display:"inline-flex", alignItems:"center", gap:4,
                    background:C.gold+"22", border:`1.5px solid ${C.gold}`,
                    borderRadius:20, padding:"4px 14px",
                    fontFamily:"Fredoka One, cursive", fontSize:16, color:C.gold}}>⭐ {p.cost} pts</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STUDENTS ── */}
        {tab==="students" && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{fontSize:13, color:C.sub, marginBottom:16}}>
              Students who joined your class. Parents link their kids using your join code.
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:14}}>
              {students.map(s=>(
                <div key={s.id} style={{ background:C.panel, border:`1px solid ${C.border}`,
                  borderRadius:14, padding:"16px", textAlign:"center", animation:"pop 0.3s ease" }}>
                  <div style={{fontSize:44, marginBottom:8}}>{s.avatar}</div>
                  <div style={{fontWeight:800, fontSize:16, marginBottom:12}}>{s.name}</div>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                    <div style={{background:"#10B98122", border:"1.5px solid #10B981",
                      borderRadius:10, padding:"8px", textAlign:"center"}}>
                      <div style={{fontSize:9, color:"#10B981", fontWeight:700, textTransform:"uppercase", letterSpacing:1}}>🟢 Green</div>
                      <div style={{fontFamily:"Fredoka One, cursive", fontSize:16, color:"#10B981"}}>${(s.balance/100).toFixed(2)}</div>
                    </div>
                    <div style={{background:"#F59E0B22", border:"1.5px solid #F59E0B",
                      borderRadius:10, padding:"8px", textAlign:"center"}}>
                      <div style={{fontSize:9, color:"#F59E0B", fontWeight:700, textTransform:"uppercase", letterSpacing:1}}>⭐ Bonus</div>
                      <div style={{fontFamily:"Fredoka One, cursive", fontSize:16, color:"#F59E0B"}}>{s.bonus}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AWARD POINTS ── */}
        {tab==="bonus" && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            {card(<>
              <div style={{fontSize:16, fontWeight:800, marginBottom:16}}>⭐ Award Bonus Points</div>
              {lbl("Student")}
              <div style={{display:"flex", flexWrap:"wrap", gap:8, marginBottom:20}}>
                {students.map(s=>(
                  <button key={s.id} onClick={()=>setSelectedStudent(s.id)} style={{
                    background:selectedStudent===s.id?C.gold:"transparent",
                    border:`2px solid ${selectedStudent===s.id?C.gold:C.border}`,
                    color:selectedStudent===s.id?"white":C.sub,
                    borderRadius:30, padding:"8px 16px", fontSize:14, fontWeight:700,
                    cursor:"pointer", fontFamily:"Nunito, sans-serif",
                    display:"flex", alignItems:"center", gap:6 }}>
                    {s.avatar} {s.name}
                  </button>
                ))}
              </div>
              {lbl("Amount")}
              <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:20}}>
                {[10,25,50,100].map(n=>(
                  <button key={n} onClick={()=>setBonusAmount(n)} style={{
                    background:bonusAmount===n?C.gold:"transparent",
                    border:`2px solid ${bonusAmount===n?C.gold:C.border}`,
                    color:bonusAmount===n?"white":C.sub,
                    borderRadius:30, padding:"8px 20px", fontSize:16, fontWeight:800,
                    cursor:"pointer", fontFamily:"Fredoka One, cursive" }}>+{n}</button>
                ))}
                <input type="number" value={bonusAmount} onChange={e=>setBonusAmount(Number(e.target.value))}
                  style={{ width:80, background:"#0F172A", border:`1.5px solid ${C.border}`,
                    borderRadius:8, padding:"8px 12px", fontSize:14, color:C.text,
                    fontFamily:"Nunito, sans-serif", outline:"none", textAlign:"center" }}/>
              </div>
              {lbl("Reason (optional)")}
              <div style={{marginBottom:16}}>
                {inp(bonusNote, setBonusNote, "e.g. Amazing effort on the science project!")}
              </div>
              {primaryBtn(awardBonus, `⭐ Award ${bonusAmount} Points`, C.gold)}
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
                    <div style={{fontSize:12, color:C.gold}}>+{q.pts} pts</div>
                  </button>
                ))}
              </div>
            </>)}
          </div>
        )}

        {/* ── CLASS & FLYER ── */}
        {tab==="flyer" && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <TeacherFlyerAndEditor userId={profile?.id} />
          </div>
        )}

      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:30, left:"50%", transform:"translateX(-50%)",
          background:"linear-gradient(135deg, #6366F1, #8B5CF6)",
          color:"white", borderRadius:30, padding:"12px 28px",
          fontFamily:"Fredoka One, cursive", fontSize:16,
          boxShadow:"0 8px 30px rgba(99,102,241,0.5)",
          animation:"pop 0.3s ease", zIndex:9999, whiteSpace:"nowrap" }}>{toast}</div>
      )}
    </div>
  );
}

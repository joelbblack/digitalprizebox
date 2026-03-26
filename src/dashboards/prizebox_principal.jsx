import { useState } from "react";

// ─── Principal Dashboard ───────────────────────────────────────────────────────
//
//  Principal loads PBIS budget → distributes to classrooms → teachers spend it
//  One account covers the whole school.
//  School plan: $49/month unlimited teachers.
// ─────────────────────────────────────────────────────────────────────────────

const fontCSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
@keyframes fadeIn { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
@keyframes pop    { 0%{transform:scale(0.9);opacity:0;} 60%{transform:scale(1.04);} 100%{transform:scale(1);opacity:1;} }
`;

const C = {
  bg:"#0F172A", panel:"#1E293B", panel2:"#162032", border:"#334155",
  text:"#F1F5F9", sub:"#94A3B8", accent:"#6366F1",
  green:"#10B981", orange:"#F97316", gold:"#F59E0B",
  red:"#EF4444", purple:"#8B5CF6", blue:"#3B82F6",
};

// ── Seed data ─────────────────────────────────────────────────────────────────
const SCHOOL = {
  name:          "Lincoln Elementary",
  district:      "Redlands Unified School District",
  principal:     "Mr. Black",
  greenBalance:  125000,  // cents — $1,250 PBIS budget loaded
  greenLoaded:   200000,
  greenDistributed: 75000,
  schoolGoal:    { label:"Spring Field Trip", current:34500, target:100000 },
  plan:          "school",
  joinCode:      "LINC42",
};

const CLASSROOMS = [
  { id:1, teacher:"Ms. Black",   room:"Room 12", grade:"4th", emoji:"🍎",
    kids:24, greenBalance:12500, orangeAwarded:1840,
    activeJars:18, pendingApprovals:3, avgOrange:76 },
  { id:2, teacher:"Mr. Johnson", room:"Room 7",  grade:"3rd", emoji:"📚",
    kids:22, greenBalance:8000,  orangeAwarded:1620,
    activeJars:12, pendingApprovals:1, avgOrange:73 },
  { id:3, teacher:"Ms. Garcia",  room:"Room 4",  grade:"5th", emoji:"🔬",
    kids:26, greenBalance:15000, orangeAwarded:2100,
    activeJars:22, pendingApprovals:5, avgOrange:80 },
  { id:4, teacher:"Ms. Chen",    room:"Room 9",  grade:"2nd", emoji:"🎨",
    kids:20, greenBalance:5000,  orangeAwarded:1200,
    activeJars:8,  pendingApprovals:0, avgOrange:60 },
  { id:5, teacher:"Mr. Davis",   room:"Room 15", grade:"6th", emoji:"⚽",
    kids:28, greenBalance:3000,  orangeAwarded:980,
    activeJars:6,  pendingApprovals:2, avgOrange:35 },
];

const DISTRIBUTIONS = [
  { id:1, date:"2024-10-01", type:"equal",     note:"October PBIS allocation",
    category:"Tier 1", amount:50000, perUnit:10000, units:5 },
  { id:2, date:"2024-09-15", type:"classroom", note:"Attendance incentive boost",
    category:"Attendance", amount:5000, perUnit:5000, units:1,
    teacher:"Ms. Garcia — Room 4" },
  { id:3, date:"2024-09-01", type:"equal",     note:"September PBIS allocation",
    category:"Tier 1", amount:50000, perUnit:10000, units:5 },
];

const PBIS_CATEGORIES = [
  "Tier 1 — Universal",
  "Tier 2 — Targeted",
  "Tier 3 — Intensive",
  "Attendance",
  "Behavior",
  "Academic Achievement",
  "Social-Emotional",
  "Staff Recognition",
];

// ── UI Primitives ─────────────────────────────────────────────────────────────
const Card = ({children,style={}}) => (
  <div style={{background:C.panel,borderRadius:14,padding:"20px",
    border:`1px solid ${C.border}`,marginBottom:16,
    animation:"fadeIn 0.3s ease",...style}}>{children}</div>
);

const Lbl = ({children}) => (
  <div style={{fontSize:11,fontWeight:700,color:C.sub,textTransform:"uppercase",
    letterSpacing:1.5,marginBottom:6}}>{children}</div>
);

const Field = ({value,onChange,placeholder,type="text",style={}}) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)}
    placeholder={placeholder}
    style={{width:"100%",background:C.bg,border:`1.5px solid ${C.border}`,
      borderRadius:8,padding:"9px 12px",fontSize:14,color:C.text,
      fontFamily:"Nunito,sans-serif",outline:"none",boxSizing:"border-box",...style}}/>
);

const Btn = ({onClick,children,color=C.accent,small=false,outline=false,disabled=false,full=false}) => (
  <button onClick={onClick} disabled={disabled} style={{
    background:disabled?"transparent":outline?"transparent":color,
    border:outline||disabled?`1.5px solid ${disabled?C.border:color}`:"none",
    color:disabled?C.sub:outline?color:"white",
    borderRadius:10,padding:small?"6px 14px":"10px 20px",
    fontSize:small?12:14,fontWeight:800,cursor:disabled?"not-allowed":"pointer",
    fontFamily:"Nunito,sans-serif",whiteSpace:"nowrap",
    opacity:disabled?0.5:1,width:full?"100%":undefined,
  }}>{children}</button>
);

const Pill = ({color,bg,children}) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:4,
    background:bg,border:`1.5px solid ${color}`,color,
    borderRadius:20,padding:"3px 12px",
    fontFamily:"Fredoka One,cursive",fontSize:14}}>{children}</span>
);

function Toast({msg}) {
  if (!msg) return null;
  return (
    <div style={{position:"fixed",bottom:30,left:"50%",transform:"translateX(-50%)",
      background:`linear-gradient(135deg,${C.accent},${C.purple})`,
      color:"white",borderRadius:30,padding:"12px 28px",
      fontFamily:"Fredoka One,cursive",fontSize:16,
      boxShadow:"0 8px 30px rgba(99,102,241,0.5)",
      animation:"pop 0.3s ease",zIndex:9999,whiteSpace:"nowrap"}}>{msg}</div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({school,classrooms}) {
  const totalKids     = classrooms.reduce((a,c)=>a+c.kids,0);
  const totalOrange   = classrooms.reduce((a,c)=>a+c.orangeAwarded,0);
  const totalJars     = classrooms.reduce((a,c)=>a+c.activeJars,0);
  const totalPending  = classrooms.reduce((a,c)=>a+c.pendingApprovals,0);
  const pct = Math.round((school.schoolGoal.current/school.schoolGoal.target)*100);

  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>

      {/* Key metrics */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",
        gap:12,marginBottom:20}}>
        {[
          {label:"PBIS Budget Available",value:`$${(school.greenBalance/100).toFixed(2)}`,
           color:C.green,sub:"ready to distribute"},
          {label:"Total Loaded",value:`$${(school.greenLoaded/100).toFixed(2)}`,
           color:C.blue,sub:"this school year"},
          {label:"Distributed",value:`$${(school.greenDistributed/100).toFixed(2)}`,
           color:C.orange,sub:"to classrooms"},
          {label:"Students",value:totalKids,color:C.accent,sub:"across all classes"},
          {label:"Active Jars",value:totalJars,color:C.gold,sub:"kids saving up"},
          {label:"Pending",value:totalPending,color:C.red,sub:"need approval"},
        ].map(m=>(
          <div key={m.label} style={{background:C.panel2,borderRadius:12,
            padding:"14px 16px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.sub,fontWeight:700,textTransform:"uppercase",
              letterSpacing:1.5,marginBottom:6}}>{m.label}</div>
            <div style={{fontFamily:"Fredoka One,cursive",fontSize:26,color:m.color}}>
              {m.value}
            </div>
            <div style={{fontSize:11,color:C.sub,marginTop:2}}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* School goal */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontWeight:800,fontSize:16}}>
              🏫 School Goal — {school.schoolGoal.label}
            </div>
            <div style={{fontSize:12,color:C.sub,marginTop:2}}>
              All classrooms contributing together
            </div>
          </div>
          <div style={{fontFamily:"Fredoka One,cursive",fontSize:20,color:C.gold}}>
            ${(school.schoolGoal.current/100).toFixed(0)} /
            ${(school.schoolGoal.target/100).toFixed(0)}
          </div>
        </div>
        <div style={{background:C.panel2,borderRadius:20,height:16,overflow:"hidden",
          marginBottom:8}}>
          <div style={{width:`${pct}%`,height:"100%",borderRadius:20,
            background:"linear-gradient(90deg,#FFD700,#F97316)",
            transition:"width 0.5s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",
          fontSize:12,color:C.sub}}>
          <span>{pct}% complete</span>
          <span>${((school.schoolGoal.target-school.schoolGoal.current)/100).toFixed(0)} to go</span>
        </div>
      </Card>

      {/* PBIS breakdown */}
      <Card>
        <div style={{fontSize:16,fontWeight:800,marginBottom:16}}>
          💡 How PBIS Budget Flows
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {[
            {step:"1",emoji:"💳",title:"You Load Budget",
             desc:"Load your school's PBIS allocation via Stripe. Money sits in the school green pool."},
            {step:"2",emoji:"🏫",title:"Distribute to Classes",
             desc:"Split equally or send specific amounts to individual classrooms by category."},
            {step:"3",emoji:"🎁",title:"Kids Earn & Spend",
             desc:"Teachers award orange. Kids save in jars. Real prizes via Amazon affiliate links."},
          ].map(s=>(
            <div key={s.step} style={{textAlign:"center"}}>
              <div style={{width:32,height:32,borderRadius:"50%",
                background:C.accent,color:"white",fontWeight:800,fontSize:14,
                display:"flex",alignItems:"center",justifyContent:"center",
                margin:"0 auto 8px"}}>
                {s.step}
              </div>
              <div style={{fontSize:24,marginBottom:6}}>{s.emoji}</div>
              <div style={{fontWeight:800,fontSize:13,marginBottom:4}}>{s.title}</div>
              <div style={{fontSize:11,color:C.sub,lineHeight:1.6}}>{s.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* School info */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontWeight:800,fontSize:16}}>{school.name}</div>
            <div style={{fontSize:12,color:C.sub}}>{school.district}</div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <div style={{background:C.panel2,borderRadius:10,padding:"8px 16px",
              textAlign:"center"}}>
              <div style={{fontSize:10,color:C.sub}}>Join Code</div>
              <div style={{fontFamily:"Fredoka One,cursive",fontSize:18,
                color:C.accent,letterSpacing:2}}>{school.joinCode}</div>
            </div>
            <div style={{background:C.panel2,borderRadius:10,padding:"8px 16px",
              textAlign:"center"}}>
              <div style={{fontSize:10,color:C.sub}}>Plan</div>
              <div style={{fontFamily:"Fredoka One,cursive",fontSize:18,
                color:C.green}}>School $49/mo</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Distribute Tab ────────────────────────────────────────────────────────────
function DistributeTab({school,classrooms,showToast}) {
  const [distType,  setDistType]  = useState("equal");
  const [amount,    setAmount]    = useState("");
  const [toClass,   setToClass]   = useState(null);
  const [note,      setNote]      = useState("");
  const [category,  setCategory]  = useState(PBIS_CATEGORIES[0]);
  const [preview,   setPreview]   = useState(false);

  const amt         = Number(amount) * 100;  // convert to cents
  const enoughFunds = amt > 0 && amt <= school.greenBalance;
  const perClass    = distType==="equal"
    ? Math.floor(amt/classrooms.length)
    : amt;

  const distribute = () => {
    if (!enoughFunds) return;
    showToast(distType==="equal"
      ? `✅ $${(perClass/100).toFixed(2)} distributed to ${classrooms.length} classrooms!`
      : `✅ $${(amt/100).toFixed(2)} sent to ${classrooms.find(c=>c.id===toClass)?.teacher}!`
    );
    setAmount("");
    setNote("");
    setPreview(false);
  };

  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>

      {/* Budget status */}
      <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <div style={{background:`${C.green}18`,border:`1.5px solid ${C.green}`,
          borderRadius:12,padding:"12px 18px",textAlign:"center"}}>
          <div style={{fontSize:10,color:C.green,fontWeight:700,
            textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>
            🟢 Available to Distribute
          </div>
          <div style={{fontFamily:"Fredoka One,cursive",fontSize:28,color:C.green}}>
            ${(school.greenBalance/100).toFixed(2)}
          </div>
        </div>
        <div style={{background:C.panel2,border:`1px solid ${C.border}`,
          borderRadius:12,padding:"12px 18px",textAlign:"center"}}>
          <div style={{fontSize:10,color:C.sub,fontWeight:700,
            textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>
            Classrooms
          </div>
          <div style={{fontFamily:"Fredoka One,cursive",fontSize:28,color:C.accent}}>
            {classrooms.length}
          </div>
        </div>
      </div>

      <Card>
        <div style={{fontSize:16,fontWeight:800,marginBottom:16}}>
          💰 Distribute PBIS Budget
        </div>

        {/* Distribution type */}
        <Lbl>How to distribute</Lbl>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {[
            {id:"equal",    emoji:"⚖️", label:"Split Equally",
             desc:"Divide evenly across all classrooms"},
            {id:"classroom",emoji:"🏫", label:"Specific Classroom",
             desc:"Send a set amount to one classroom"},
          ].map(t=>(
            <div key={t.id} onClick={()=>setDistType(t.id)} style={{
              background:distType===t.id?`${C.accent}18`:C.panel2,
              border:`2px solid ${distType===t.id?C.accent:C.border}`,
              borderRadius:12,padding:"14px",cursor:"pointer",
              transition:"all 0.2s",
            }}>
              <div style={{fontSize:24,marginBottom:6}}>{t.emoji}</div>
              <div style={{fontWeight:800,fontSize:13,
                color:distType===t.id?C.text:C.sub}}>{t.label}</div>
              <div style={{fontSize:11,color:C.sub,marginTop:2}}>{t.desc}</div>
              {distType===t.id&&<div style={{marginTop:6,fontSize:14}}>✅</div>}
            </div>
          ))}
        </div>

        {/* Classroom selector */}
        {distType==="classroom"&&(
          <div style={{marginBottom:16}}>
            <Lbl>Select Classroom</Lbl>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {classrooms.map(c=>(
                <button key={c.id} onClick={()=>setToClass(c.id)} style={{
                  background:toClass===c.id?C.accent:"transparent",
                  border:`2px solid ${toClass===c.id?C.accent:C.border}`,
                  color:toClass===c.id?"white":C.sub,
                  borderRadius:30,padding:"8px 16px",fontSize:13,fontWeight:700,
                  cursor:"pointer",fontFamily:"Nunito,sans-serif",
                  display:"flex",alignItems:"center",gap:6,
                }}>
                  {c.emoji} {c.teacher} — {c.room}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Amount */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <div>
            <Lbl>Amount ($)</Lbl>
            <Field value={amount} onChange={setAmount} placeholder="e.g. 500"
              type="number"/>
            {amount&&(
              <div style={{fontSize:11,color:C.sub,marginTop:4}}>
                {distType==="equal"
                  ? `$${(perClass/100).toFixed(2)} per classroom`
                  : `Full amount to selected classroom`}
              </div>
            )}
          </div>
          <div>
            <Lbl>PBIS Category</Lbl>
            <select value={category} onChange={e=>setCategory(e.target.value)}
              style={{width:"100%",background:C.bg,border:`1.5px solid ${C.border}`,
                borderRadius:8,padding:"9px 12px",fontSize:14,color:C.text,
                fontFamily:"Nunito,sans-serif",outline:"none"}}>
              {PBIS_CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Note */}
        <div style={{marginBottom:16}}>
          <Lbl>Note (optional)</Lbl>
          <Field value={note} onChange={setNote}
            placeholder="e.g. October PBIS allocation — Tier 1"/>
        </div>

        {/* Quick amount presets */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          {[100,250,500,1000].map(n=>(
            <button key={n} onClick={()=>setAmount(String(n))} style={{
              background:Number(amount)===n?C.green:"transparent",
              border:`2px solid ${Number(amount)===n?C.green:C.border}`,
              color:Number(amount)===n?"white":C.sub,
              borderRadius:30,padding:"7px 18px",fontSize:15,fontWeight:800,
              cursor:"pointer",fontFamily:"Fredoka One,cursive",
            }}>${n}</button>
          ))}
        </div>

        {/* Preview */}
        {amount&&enoughFunds&&(
          <div style={{background:C.panel2,borderRadius:12,padding:"14px 16px",
            marginBottom:16,fontSize:13,color:C.sub,lineHeight:2}}>
            <div style={{fontWeight:800,color:C.text,marginBottom:4}}>Preview:</div>
            <div>💰 Total: <strong style={{color:C.green}}>${Number(amount).toFixed(2)}</strong></div>
            {distType==="equal"&&(
              <div>🏫 Per classroom:
                <strong style={{color:C.green}}> ${(perClass/100).toFixed(2)}</strong>
                {" "}× {classrooms.length} classrooms
              </div>
            )}
            {distType==="classroom"&&toClass&&(
              <div>🏫 To:
                <strong style={{color:C.text}}>
                  {" "}{classrooms.find(c=>c.id===toClass)?.teacher}
                </strong>
              </div>
            )}
            <div>📋 Category: <strong style={{color:C.text}}>{category}</strong></div>
            {note&&<div>📝 Note: <em>{note}</em></div>}
            <div style={{marginTop:4,fontSize:11,color:C.sub}}>
              Remaining after distribution:
              <strong style={{color:C.green}}>
                {" "}${((school.greenBalance-amt)/100).toFixed(2)}
              </strong>
            </div>
          </div>
        )}

        {!enoughFunds&&amount&&(
          <div style={{fontSize:12,color:C.red,marginBottom:12}}>
            ⚠️ Insufficient funds — you have ${(school.greenBalance/100).toFixed(2)} available.
            Load more PBIS budget first.
          </div>
        )}

        <Btn onClick={distribute}
          disabled={!enoughFunds||(distType==="classroom"&&!toClass)}
          color={C.green} full>
          💰 Distribute PBIS Budget
        </Btn>
      </Card>

      {/* Distribution history */}
      <Card>
        <div style={{fontSize:15,fontWeight:800,marginBottom:14}}>
          📋 Distribution History
        </div>
        {DISTRIBUTIONS.map(d=>(
          <div key={d.id} style={{background:C.panel2,borderRadius:12,
            padding:"14px 16px",marginBottom:10,
            display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <div style={{fontSize:28}}>
              {d.type==="equal"?"⚖️":"🏫"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:14}}>{d.note}</div>
              <div style={{fontSize:12,color:C.sub,marginTop:2}}>
                {d.date} · {d.category}
                {d.teacher&&` · ${d.teacher}`}
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"Fredoka One,cursive",fontSize:20,color:C.green}}>
                ${(d.amount/100).toFixed(2)}
              </div>
              <div style={{fontSize:11,color:C.sub}}>
                {d.type==="equal"
                  ? `$${(d.perUnit/100).toFixed(2)} × ${d.units} classes`
                  : "single classroom"}
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── Load Budget Tab ───────────────────────────────────────────────────────────
function LoadBudgetTab({school,showToast}) {
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{fontSize:13,color:C.sub,marginBottom:20,lineHeight:1.7}}>
        Load your school's PBIS budget here. Money goes into the school green pool.
        You then distribute it to classrooms. All transactions tracked for district reporting.
      </div>

      {/* Current balance */}
      <Card style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:48,marginBottom:8}}>🏦</div>
        <div style={{fontFamily:"Fredoka One,cursive",fontSize:36,color:C.green,marginBottom:4}}>
          ${(school.greenBalance/100).toFixed(2)}
        </div>
        <div style={{fontSize:13,color:C.sub,marginBottom:16}}>
          available in school PBIS pool
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:20,
          fontSize:12,color:C.sub,flexWrap:"wrap"}}>
          <div>Loaded total: <strong style={{color:C.text}}>
            ${(school.greenLoaded/100).toFixed(2)}
          </strong></div>
          <div>Distributed: <strong style={{color:C.text}}>
            ${(school.greenDistributed/100).toFixed(2)}
          </strong></div>
        </div>
      </Card>

      {/* Stripe load */}
      <Card style={{border:`1.5px dashed ${C.green}66`,background:`${C.green}08`}}>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",
          marginBottom:16}}>
          <div style={{fontSize:48}}>💳</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:16,color:C.green,marginBottom:4}}>
              Stripe — Coming Soon
            </div>
            <div style={{fontSize:13,color:C.sub,lineHeight:1.6}}>
              Load PBIS budget directly from your school credit card or purchase order.
              Every transaction is logged for district reporting.
              School plan: $49/month, unlimited teachers.
            </div>
          </div>
        </div>

        {/* Quick load presets */}
        <Lbl>Common PBIS Budget Amounts</Lbl>
        <div style={{display:"grid",
          gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:16}}>
          {[
            {label:"$500",  sub:"Small school"},
            {label:"$1,000",sub:"Mid-size school"},
            {label:"$2,000",sub:"Large school"},
            {label:"$5,000",sub:"District pilot"},
          ].map(s=>(
            <div key={s.label} style={{background:C.panel,borderRadius:10,
              padding:"12px",textAlign:"center",border:`1px solid ${C.border}`,
              opacity:0.6}}>
              <div style={{fontFamily:"Fredoka One,cursive",fontSize:20,
                color:C.green}}>{s.label}</div>
              <div style={{fontSize:11,color:C.sub,marginTop:2}}>{s.sub}</div>
            </div>
          ))}
        </div>

        <Btn onClick={()=>showToast("💳 Stripe coming soon!")}
          color={C.green} full>
          Load PBIS Budget
        </Btn>
      </Card>

      {/* District reporting note */}
      <Card>
        <div style={{fontSize:15,fontWeight:800,marginBottom:12}}>
          📊 District Reporting
        </div>
        <div style={{fontSize:13,color:C.sub,lineHeight:1.8}}>
          Every dollar loaded and distributed is tracked with:
        </div>
        <div style={{marginTop:10,display:"grid",
          gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            "Date and amount loaded",
            "PBIS category (Tier 1/2/3)",
            "Classroom distribution breakdown",
            "Per-student engagement metrics",
            "Prize redemption by category",
            "Orange award activity by teacher",
          ].map(item=>(
            <div key={item} style={{display:"flex",gap:8,alignItems:"center",
              fontSize:12,color:C.sub}}>
              <span style={{color:C.green,flexShrink:0}}>✅</span>
              {item}
            </div>
          ))}
        </div>
        <div style={{marginTop:14,fontSize:12,color:C.sub,fontStyle:"italic"}}>
          Export to CSV for district PBIS reporting — coming in month 2.
        </div>
      </Card>
    </div>
  );
}

// ── Classrooms Tab ────────────────────────────────────────────────────────────
function ClassroomsTab({classrooms,showToast}) {
  const [selected,setSelected] = useState(null);
  const kid = classrooms.find(c=>c.id===selected);

  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{fontSize:13,color:C.sub,marginBottom:16}}>
        All classrooms in {SCHOOL.name}.
        Teachers join using code <strong style={{color:C.accent,letterSpacing:2}}>
        {SCHOOL.joinCode}</strong>.
      </div>

      {classrooms.map(c=>(
        <div key={c.id} style={{
          background:C.panel,border:`1px solid ${c.pendingApprovals>0?C.gold+"66":C.border}`,
          borderRadius:14,padding:"16px 18px",marginBottom:10,
          display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",
          animation:"fadeIn 0.3s ease",
        }}>
          <div style={{fontSize:36}}>{c.emoji}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:15}}>{c.teacher}</div>
            <div style={{fontSize:12,color:C.sub,marginTop:2}}>
              {c.room} · {c.grade} grade · {c.kids} students
            </div>
          </div>

          {/* Classroom stats */}
          <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:C.sub,marginBottom:2}}>🟢 Balance</div>
              <div style={{fontFamily:"Fredoka One,cursive",fontSize:18,color:C.green}}>
                ${(c.greenBalance/100).toFixed(2)}
              </div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:C.sub,marginBottom:2}}>🟠 Awarded</div>
              <div style={{fontFamily:"Fredoka One,cursive",fontSize:18,color:C.orange}}>
                {c.orangeAwarded}
              </div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:C.sub,marginBottom:2}}>⭐ Jars</div>
              <div style={{fontFamily:"Fredoka One,cursive",fontSize:18,color:C.gold}}>
                {c.activeJars}
              </div>
            </div>
            {c.pendingApprovals>0&&(
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:10,color:C.sub,marginBottom:2}}>⏳ Pending</div>
                <div style={{fontFamily:"Fredoka One,cursive",fontSize:18,color:C.red}}>
                  {c.pendingApprovals}
                </div>
              </div>
            )}
          </div>

          {/* Engagement bar */}
          <div style={{width:"100%",marginTop:8}}>
            <div style={{display:"flex",justifyContent:"space-between",
              fontSize:10,color:C.sub,marginBottom:4}}>
              <span>Weekly avg orange per student</span>
              <span style={{color:c.avgOrange>=70?C.green:c.avgOrange>=50?C.gold:C.red,
                fontWeight:700}}>{c.avgOrange} / week</span>
            </div>
            <div style={{background:C.panel2,borderRadius:20,height:6,overflow:"hidden"}}>
              <div style={{
                width:`${Math.min(100,Math.round(c.avgOrange/3))}%`,
                height:"100%",borderRadius:20,
                background:c.avgOrange>=70
                  ?"linear-gradient(90deg,#10B981,#6EE7B7)"
                  :c.avgOrange>=50
                    ?"linear-gradient(90deg,#F59E0B,#FDE68A)"
                    :"linear-gradient(90deg,#EF4444,#FCA5A5)",
                transition:"width 0.5s",
              }}/>
            </div>
          </div>
        </div>
      ))}

      {/* Add teacher */}
      <Card style={{border:`1.5px dashed ${C.border}`,
        background:"transparent",textAlign:"center"}}>
        <div style={{fontSize:24,marginBottom:8}}>👩‍🏫</div>
        <div style={{fontWeight:800,fontSize:14,marginBottom:4}}>
          Add a Teacher
        </div>
        <div style={{fontSize:12,color:C.sub,marginBottom:14}}>
          Share join code <strong style={{color:C.accent,letterSpacing:2}}>
          {SCHOOL.joinCode}</strong> with teachers.
          They create an account and enter the code during setup.
        </div>
        <Btn onClick={()=>{
          navigator.clipboard?.writeText(SCHOOL.joinCode);
          showToast("📋 Join code copied!");
        }} color={C.accent} small>
          📋 Copy Join Code
        </Btn>
      </Card>
    </div>
  );
}

// ── Reports Tab ───────────────────────────────────────────────────────────────
function ReportsTab({school,classrooms}) {
  const totalOrange = classrooms.reduce((a,c)=>a+c.orangeAwarded,0);
  const totalJars   = classrooms.reduce((a,c)=>a+c.activeJars,0);
  const totalKids   = classrooms.reduce((a,c)=>a+c.kids,0);

  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{fontSize:13,color:C.sub,marginBottom:20}}>
        School-wide engagement data. Export coming in month 2.
      </div>

      {/* Classroom comparison */}
      <Card>
        <div style={{fontSize:15,fontWeight:800,marginBottom:16}}>
          📊 Classroom Engagement
        </div>
        {[...classrooms].sort((a,b)=>b.avgOrange-a.avgOrange).map((c,i)=>(
          <div key={c.id} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",
              fontSize:13,marginBottom:4}}>
              <span style={{fontWeight:700}}>
                {i===0?"🥇":i===1?"🥈":i===2?"🥉":"  "}
                {" "}{c.teacher} — {c.room}
              </span>
              <span style={{color:C.orange,fontWeight:700}}>
                {c.avgOrange} orange/student/week
              </span>
            </div>
            <div style={{background:C.panel2,borderRadius:20,height:10,overflow:"hidden"}}>
              <div style={{
                width:`${Math.round((c.avgOrange/classrooms[0].avgOrange)*100)}%`,
                height:"100%",borderRadius:20,
                background:`linear-gradient(90deg,${C.orange},#FDBA74)`,
                transition:"width 0.5s",
              }}/>
            </div>
          </div>
        ))}
      </Card>

      {/* Summary stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",
        gap:14}}>
        {[
          {label:"Total Orange Awarded",    value:totalOrange.toLocaleString(),
           sub:"this month",               color:C.orange,emoji:"🟠"},
          {label:"Active Wishlist Jars",    value:totalJars,
           sub:"kids saving toward prizes", color:C.gold,  emoji:"⭐"},
          {label:"Avg Orange per Student",  value:Math.round(totalOrange/totalKids),
           sub:"per week across school",   color:C.green, emoji:"📈"},
          {label:"PBIS Budget Used",
           value:`${Math.round((school.greenDistributed/school.greenLoaded)*100)}%`,
           sub:`$${(school.greenDistributed/100).toFixed(0)} of $${(school.greenLoaded/100).toFixed(0)}`,
           color:C.blue,emoji:"💳"},
        ].map(s=>(
          <Card key={s.label} style={{marginBottom:0,textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:8}}>{s.emoji}</div>
            <div style={{fontFamily:"Fredoka One,cursive",fontSize:28,
              color:s.color,marginBottom:4}}>{s.value}</div>
            <div style={{fontWeight:800,fontSize:13,marginBottom:2}}>{s.label}</div>
            <div style={{fontSize:11,color:C.sub}}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Export placeholder */}
      <Card style={{marginTop:4,textAlign:"center",
        border:`1.5px dashed ${C.border}`,background:"transparent"}}>
        <div style={{fontSize:24,marginBottom:8}}>📤</div>
        <div style={{fontWeight:800,fontSize:14,marginBottom:4}}>Export Reports</div>
        <div style={{fontSize:12,color:C.sub,marginBottom:14}}>
          CSV export for district PBIS reporting — coming in month 2.
          Includes all distribution history, engagement metrics, and redemption data.
        </div>
        <Btn color={C.sub} outline small>📤 Export CSV (Coming Soon)</Btn>
      </Card>
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab({school,showToast}) {
  const [goalLabel,  setGoalLabel]  = useState(school.schoolGoal.label);
  const [goalAmount, setGoalAmount] = useState(school.schoolGoal.target/100);
  const [orangeCap,  setOrangeCap]  = useState(school.teacher_orange_weekly_cap||300);

  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <Card>
        <div style={{fontSize:15,fontWeight:800,marginBottom:16}}>🏫 School Goal</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <div>
            <Lbl>Goal Label</Lbl>
            <Field value={goalLabel} onChange={setGoalLabel}
              placeholder="e.g. Spring Field Trip"/>
          </div>
          <div>
            <Lbl>Target Amount ($)</Lbl>
            <Field value={goalAmount} onChange={setGoalAmount}
              type="number" placeholder="1000"/>
          </div>
        </div>
        <Btn onClick={()=>showToast("✅ School goal updated!")} color={C.accent}>
          Save Goal
        </Btn>
      </Card>

      <Card>
        <div style={{fontSize:15,fontWeight:800,marginBottom:8}}>
          🟠 Teacher Orange Cap
        </div>
        <div style={{fontSize:12,color:C.sub,marginBottom:14,lineHeight:1.6}}>
          Maximum orange a teacher can award per student per week school-wide.
          Individual teacher caps can be set higher or lower in the classroom settings.
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          {[200,300,500].map(n=>(
            <button key={n} onClick={()=>setOrangeCap(n)} style={{
              background:orangeCap===n?C.orange:"transparent",
              border:`2px solid ${orangeCap===n?C.orange:C.border}`,
              color:orangeCap===n?"white":C.sub,
              borderRadius:30,padding:"7px 18px",fontSize:15,fontWeight:800,
              cursor:"pointer",fontFamily:"Fredoka One,cursive",
            }}>🟠 {n}/week</button>
          ))}
        </div>
        <Btn onClick={()=>showToast("✅ Orange cap updated!")} color={C.orange}>
          Save Cap
        </Btn>
      </Card>

      <Card>
        <div style={{fontSize:15,fontWeight:800,marginBottom:8}}>
          🔗 Teacher Join Code
        </div>
        <div style={{fontSize:12,color:C.sub,marginBottom:14}}>
          Teachers enter this code during setup to link to your school.
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontFamily:"Fredoka One,cursive",fontSize:32,
            color:C.accent,letterSpacing:6,background:C.panel2,
            borderRadius:12,padding:"12px 20px"}}>
            {school.joinCode}
          </div>
          <Btn onClick={()=>{
            navigator.clipboard?.writeText(school.joinCode);
            showToast("📋 Copied!");
          }} color={C.accent} small>
            📋 Copy
          </Btn>
          <Btn onClick={()=>showToast("🔄 New code generated!")}
            color={C.sub} small outline>
            🔄 Regenerate
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PrincipalDashboard() {
  const [tab,        setTab]        = useState("overview");
  const [school]                    = useState(SCHOOL);
  const [classrooms]                = useState(CLASSROOMS);
  const [toast,      setToast]      = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null),2600); };

  const totalPending = classrooms.reduce((a,c)=>a+c.pendingApprovals,0);

  const TABS = [
    {id:"overview",   label:"Overview",    emoji:"🏠"},
    {id:"distribute", label:"Distribute",  emoji:"💰"},
    {id:"load",       label:"Load Budget", emoji:"💳"},
    {id:"classrooms", label:"Classrooms",  emoji:"🏫"},
    {id:"reports",    label:"Reports",     emoji:"📊"},
    {id:"settings",   label:"Settings",    emoji:"⚙️"},
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,
      fontFamily:"Nunito,sans-serif",paddingBottom:60}}>
      <style>{fontCSS}</style>

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${C.panel},${C.bg})`,
        borderBottom:`2px solid ${C.border}`,padding:"16px 24px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:"Fredoka One,cursive",fontSize:26,
            background:`linear-gradient(135deg,${C.blue},${C.green})`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            🏫 Principal Dashboard
          </div>
          <div style={{fontSize:12,color:C.sub}}>
            {school.name} · {school.district}
          </div>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <div style={{background:C.panel,border:`1px solid ${C.green}44`,
            borderRadius:10,padding:"8px 16px",textAlign:"center"}}>
            <div style={{fontSize:10,color:C.sub}}>🟢 PBIS Pool</div>
            <div style={{fontFamily:"Fredoka One,cursive",fontSize:20,color:C.green}}>
              ${(school.greenBalance/100).toFixed(2)}
            </div>
          </div>
          <div style={{background:C.panel,border:`1px solid ${C.border}`,
            borderRadius:10,padding:"8px 16px",textAlign:"center"}}>
            <div style={{fontSize:10,color:C.sub}}>Classrooms</div>
            <div style={{fontFamily:"Fredoka One,cursive",fontSize:20,color:C.accent}}>
              {classrooms.length}
            </div>
          </div>
          {totalPending>0&&(
            <div style={{background:C.panel,border:`1px solid ${C.gold}66`,
              borderRadius:10,padding:"8px 16px",textAlign:"center"}}>
              <div style={{fontSize:10,color:C.sub}}>⏳ Pending</div>
              <div style={{fontFamily:"Fredoka One,cursive",fontSize:20,color:C.gold}}>
                {totalPending}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{padding:"14px 24px",display:"flex",gap:8,flexWrap:"wrap",
        borderBottom:`1px solid ${C.border}`}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background:tab===t.id?C.accent:"transparent",
            border:`2px solid ${tab===t.id?C.accent:C.border}`,
            color:tab===t.id?"white":C.sub,
            borderRadius:10,padding:"8px 16px",fontSize:13,fontWeight:700,
            cursor:"pointer",fontFamily:"Nunito,sans-serif",transition:"all 0.2s",
          }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div style={{maxWidth:960,margin:"0 auto",padding:"24px 20px"}}>
        {tab==="overview"   && <OverviewTab   school={school} classrooms={classrooms}/>}
        {tab==="distribute" && <DistributeTab school={school} classrooms={classrooms} showToast={showToast}/>}
        {tab==="load"       && <LoadBudgetTab school={school} showToast={showToast}/>}
        {tab==="classrooms" && <ClassroomsTab classrooms={classrooms} showToast={showToast}/>}
        {tab==="reports"    && <ReportsTab    school={school} classrooms={classrooms}/>}
        {tab==="settings"   && <SettingsTab   school={school} showToast={showToast}/>}
      </div>

      <Toast msg={toast}/>
    </div>
  );
}

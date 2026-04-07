import { useState, useEffect } from "react";

// ─── Currency model ────────────────────────────────────────────────────────────
//  🟢 Green  = real dollars  — Stripe loaded, buys digital codes instantly
//  🟠 Orange = bonus bucks   — chores/awards, unlocks wishlist + rewards
//  ⭐ Wishlist = physical prizes — orange unlocks jar, parent buys via Amazon
//  💻 Digital = instant codes   — green only, Tango Card, +convenience fee
// ──────────────────────────────────────────────────────────────────────────────

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

const fontCSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
@keyframes bounce      { 0%,100%{transform:translateY(0) rotate(-2deg) scale(1);} 50%{transform:translateY(-18px) rotate(2deg) scale(1.04);} }
@keyframes wiggle      { 0%,100%{transform:rotate(-3deg) scale(1.05);} 50%{transform:rotate(3deg) scale(1.05);} }
@keyframes lidPop      { 0%{transform:translateY(0) rotate(0deg);opacity:1;} 40%{transform:translateY(-80px) rotate(-15deg);opacity:1;} 100%{transform:translateY(-200px) rotate(-30deg);opacity:0;} }
@keyframes boxOpen     { 0%{transform:scaleY(1);} 100%{transform:scaleY(0.85);} }
@keyframes reveal      { 0%{opacity:0;transform:translateY(40px) scale(0.7);} 60%{transform:translateY(-8px) scale(1.08);} 100%{opacity:1;transform:translateY(0) scale(1);} }
@keyframes confettiFall{ 0%{transform:translateY(-20px) rotate(0deg);opacity:1;} 100%{transform:translateY(100vh) rotate(720deg);opacity:0;} }
@keyframes starPop     { 0%{transform:scale(0) rotate(0deg);opacity:0;} 60%{transform:scale(1.3) rotate(180deg);opacity:1;} 100%{transform:scale(1) rotate(360deg);opacity:1;} }
@keyframes float       { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-6px);} }
@keyframes teacherAward{ 0%{opacity:0;transform:translateY(60px) scale(0.5) rotate(-10deg);} 40%{opacity:1;transform:translateY(-20px) scale(1.2) rotate(5deg);} 60%{transform:translateY(0px) scale(1.05) rotate(-2deg);} 100%{opacity:1;transform:translateY(0px) scale(1) rotate(0deg);} }
@keyframes orangeGlow  { 0%,100%{box-shadow:0 0 15px rgba(249,115,22,0.3);} 50%{box-shadow:0 0 40px rgba(249,115,22,0.8);} }
@keyframes avatarPop   { 0%{transform:scale(0);opacity:0;} 70%{transform:scale(1.15);} 100%{transform:scale(1);opacity:1;} }
@keyframes fadeUp      { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
@keyframes slideIn     { from{opacity:0;transform:translateX(-12px);} to{opacity:1;transform:translateX(0);} }
@keyframes shake       { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
@keyframes shimmer     { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
@keyframes jarFill     { from{width:0%;} to{width:var(--pct);} }
@keyframes unlockPop   { 0%{transform:scale(0.8);opacity:0;} 70%{transform:scale(1.1);} 100%{transform:scale(1);opacity:1;} }
`;

// ── Interest → category mapping (no AI needed) ────────────────────────────────
const INTEREST_CATEGORY_MAP = {
  gaming:    ["gaming"],
  art:       ["art"],
  science:   ["science"],
  reading:   ["books"],
  outdoors:  ["outdoor"],
  collecting:["collect"],
  animals:   ["art","books"],
  building:  ["science","outdoor"],
  music:     ["collect"],
  cooking:   ["books"],
  space:     ["science"],
  magic:     ["collect"],
};

function sortCategoriesByInterests(categories, interests) {
  if (!interests?.length) return categories;
  const boosted = new Set(interests.flatMap(i => INTEREST_CATEGORY_MAP[i] || []));
  return [
    ...categories.filter(c => boosted.has(c.id)),
    ...categories.filter(c => !boosted.has(c.id)),
  ];
}

const ANIMALS = [
  "🦊","🐼","🦋","🐸","🦄","🐯","🦁","🐨","🦝","🐺",
  "🐻","🦙","🦘","🐧","🦜","🦩","🦚","🐙","🦈","🐬",
  "🦭","🦦","🦥","🐢","🦎","🦕","🐝","🦋","🐞","🦓",
];

const INTEREST_TAGS = [
  {id:"animals",  emoji:"🐾",label:"Animals"},
  {id:"gaming",   emoji:"🎮",label:"Gaming"},
  {id:"art",      emoji:"🎨",label:"Art & Crafts"},
  {id:"science",  emoji:"🔬",label:"Science"},
  {id:"reading",  emoji:"📚",label:"Reading"},
  {id:"building", emoji:"🔧",label:"Building"},
  {id:"outdoors", emoji:"⚽",label:"Outdoors"},
  {id:"music",    emoji:"🎵",label:"Music"},
  {id:"collecting",emoji:"✨",label:"Collecting"},
  {id:"cooking",  emoji:"🍳",label:"Cooking"},
  {id:"space",    emoji:"🚀",label:"Space"},
  {id:"magic",    emoji:"🪄",label:"Magic Tricks"},
];

const ORANGE_REWARDS = [
  {id:"r1", emoji:"📝",label:"Homework Pass",        orange:80, tag:"classroom"},
  {id:"r2", emoji:"🏃",label:"Extra Recess (10 min)",orange:100,tag:"classroom"},
  {id:"r3", emoji:"🍕",label:"Lunch with Teacher",   orange:150,tag:"classroom"},
  {id:"r4", emoji:"🪑",label:"Sit Anywhere Day",     orange:60, tag:"classroom"},
  {id:"r5", emoji:"🎮",label:"Extra Game Time",      orange:40, tag:"home"},
  {id:"r6", emoji:"🌙",label:"Stay Up 30 Min Late",  orange:60, tag:"home"},
  {id:"r7", emoji:"👯",label:"Have a Friend Over",   orange:100,tag:"home"},
  {id:"r8", emoji:"🍕",label:"Pick Dinner Tonight",  orange:50, tag:"home"},
  {id:"r9", emoji:"🚫",label:"Skip One Chore",       orange:35, tag:"home"},
  {id:"r10",emoji:"🎬",label:"Movie Night Pick",     orange:45, tag:"home"},
];

const CONFETTI_COLORS = ["#FF6B6B","#4ECDC4","#FFE66D","#A8E6CF","#C3A6FF","#FF8B94","#FFD93D","#FF9F43"];

// ── Emoji validation ──────────────────────────────────────────────────────────
function emojiError(str) {
  if (!str?.trim()) return null;
  const s = str.trim();
  const seg = new Intl.Segmenter(undefined, {granularity:"grapheme"});
  const clusters = [...seg.segment(s)];
  if (!/\p{Emoji}/u.test(s)) {
    const l = s.toLowerCase();
    if (l.includes("snake"))  return "Try a single emoji like 🐍!";
    if (l.includes("dog"))    return "Try a single emoji like 🐶!";
    if (l.includes("cat"))    return "Try a single emoji like 🐱!";
    if (l.includes("dragon")) return "Try a single emoji like 🐉!";
    if (l.includes("robot"))  return "Try a single emoji like 🤖!";
    return "That's text, not an emoji! Try something like 🐍 or 🦄";
  }
  if (/^[0-9#*]$/.test(s)) return "Try a real emoji like 🐍 or 🦄!";
  if (clusters.length > 1)  return `Pick just one! Like ${clusters[0].segment} — not the whole crew 😄`;
  return null;
}

// ── API helpers ───────────────────────────────────────────────────────────────
async function fetchCategories() {
  try {
    const r = await fetch(`${API_BASE}/api/categories`);
    const d = await r.json();
    return d.categories;
  } catch {
    return [
      {id:"art",    emoji:"🎨",label:"Art & Crafts",  color:"#FF6B6B",desc:"Kits, supplies & creative stuff"},
      {id:"gaming", emoji:"🎮",label:"Gaming",         color:"#4ECDC4",desc:"Toys, games & collectibles"},
      {id:"books",  emoji:"📚",label:"Books",          color:"#FFE66D",desc:"Stories, comics & guides"},
      {id:"science",emoji:"🔬",label:"Science",        color:"#A8E6CF",desc:"Kits, experiments & gadgets"},
      {id:"outdoor",emoji:"⚽",label:"Outdoor & Sport",color:"#FF8B94",desc:"Games, balls & outdoor fun"},
      {id:"collect",emoji:"✨",label:"Collectibles",   color:"#C3A6FF",desc:"Cards, figures & stickers"},
    ];
  }
}

async function fetchWishlistItems(category) {
  const r = await fetch(`${API_BASE}/api/wishlist/${category}`);
  if (!r.ok) throw new Error(`API ${r.status}`);
  const d = await r.json();
  return d.items;
}

async function fetchDigitalCatalog() {
  const r = await fetch(`${API_BASE}/api/digital`);
  if (!r.ok) throw new Error(`API ${r.status}`);
  const d = await r.json();
  return d.items;
}

async function purchaseDigitalCode(itemId, kidId, kidName, recipientEmail) {
  const r = await fetch(`${API_BASE}/api/digital/purchase`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({kidId, kidName, itemId, recipientEmail}),
  });
  if (!r.ok) throw new Error("Purchase failed");
  return r.json();
}

async function addToWishlist(kidId, item) {
  const r = await fetch(`${API_BASE}/api/wishlist/add`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({kidId, item}),
  });
  return r.json();
}

async function contributeToJar(kidId, jarId, currency, amount) {
  const r = await fetch(`${API_BASE}/api/wishlist/contribute`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({kidId, jarId, currency, amount}),
  });
  return r.json();
}

async function requestUnlock(kidId, kidName, jarId, item, amazonUrl) {
  const r = await fetch(`${API_BASE}/api/wishlist/unlock`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({kidId, kidName, jarId, item, amazonUrl}),
  });
  return r.json();
}

// ── Shimmer loader ────────────────────────────────────────────────────────────
function ShimmerCard() {
  return (
    <div style={{background:"rgba(255,255,255,0.06)",borderRadius:20,padding:"18px 14px",
      border:"2px dashed rgba(255,255,255,0.15)"}}>
      {[60,14,11,30,38].map((h,i)=>(
        <div key={i} style={{height:h,borderRadius:8,marginBottom:8,
          background:"linear-gradient(90deg,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.14) 50%,rgba(255,255,255,0.06) 100%)",
          backgroundSize:"200% 100%",animation:"shimmer 1.5s ease-in-out infinite",
          animationDelay:`${i*0.1}s`,width:i===3?"60%":i===4?"100%":"100%",
          margin:i===3?"0 auto 8px":undefined}}/>
      ))}
    </div>
  );
}

// ── Confetti ──────────────────────────────────────────────────────────────────
function Confetti({active}) {
  if (!active) return null;
  const pieces = Array.from({length:40},(_,i)=>({
    id:i,color:CONFETTI_COLORS[i%CONFETTI_COLORS.length],
    left:`${Math.random()*100}%`,delay:`${Math.random()*0.8}s`,
    duration:`${1.5+Math.random()*1.5}s`,size:`${8+Math.random()*12}px`,
    shape:Math.random()>0.5?"50%":"2px",
  }));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1000}}>
      {pieces.map(p=>(
        <div key={p.id} style={{position:"absolute",top:"-20px",left:p.left,
          width:p.size,height:p.size,background:p.color,borderRadius:p.shape,
          animation:`confettiFall ${p.duration} ${p.delay} ease-in forwards`}}/>
      ))}
    </div>
  );
}

// ── Avatar Picker ─────────────────────────────────────────────────────────────
function AvatarPicker({onSelect}) {
  const [custom,setCustom] = useState("");
  const [error,setError]   = useState(null);
  const submit = () => {
    const t = custom.trim();
    if (!t) return;
    const err = emojiError(t);
    if (err) { setError(err); return; }
    setError(null); onSelect(t);
  };
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#1a0533,#2d1b69,#11998e)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 20px"}}>
      <div style={{fontFamily:"Fredoka One,cursive",fontSize:36,
        background:"linear-gradient(135deg,#FFD700,#FF6B6B,#4ECDC4)",
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8,textAlign:"center"}}>
        Pick Your Avatar!
      </div>
      <div style={{color:"rgba(255,255,255,0.6)",fontSize:14,marginBottom:24,textAlign:"center"}}>
        Choose an animal that's YOU 🎉
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:24,maxWidth:360}}>
        {ANIMALS.map((a,i)=>(
          <button key={i} onClick={()=>onSelect(a)} style={{background:"rgba(255,255,255,0.1)",
            border:"2px solid rgba(255,255,255,0.15)",borderRadius:14,padding:"10px",
            fontSize:28,cursor:"pointer",transition:"all 0.15s"}}
            onMouseOver={e=>{e.currentTarget.style.transform="scale(1.2)";e.currentTarget.style.background="rgba(255,255,255,0.25)";}}
            onMouseOut={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.background="rgba(255,255,255,0.1);"}}
          >{a}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,width:"100%",maxWidth:340}}>
        <div style={{display:"flex",gap:8,width:"100%"}}>
          <input value={custom} onChange={e=>{setCustom(e.target.value);setError(null);}}
            onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Type your own emoji..."
            style={{flex:1,background:"rgba(255,255,255,0.1)",
              border:`2px solid ${error?"#FF6B6B":"rgba(255,255,255,0.2)"}`,
              borderRadius:30,padding:"10px 18px",fontSize:20,color:"white",outline:"none",
              fontFamily:"Nunito,sans-serif",textAlign:"center",
              animation:error?"shake 0.4s ease":"none"}}/>
          <button onClick={submit} style={{background:"linear-gradient(135deg,#FFD700,#FF6B6B)",
            border:"none",color:"white",borderRadius:30,padding:"10px 20px",fontSize:14,
            fontWeight:800,cursor:"pointer",fontFamily:"Nunito,sans-serif",whiteSpace:"nowrap"}}>
            That's me! →
          </button>
        </div>
        {error&&<div style={{background:"rgba(255,107,107,0.18)",border:"1.5px solid rgba(255,107,107,0.6)",
          borderRadius:20,padding:"9px 20px",color:"#FFB3B3",fontSize:13,fontWeight:700,
          fontFamily:"Nunito,sans-serif",textAlign:"center",width:"100%",boxSizing:"border-box",
          animation:"fadeUp 0.25s ease"}}>{error}</div>}
      </div>
    </div>
  );
}

// ── Interest Picker (simple sort signal, no AI) ───────────────────────────────
function InterestPicker({avatar,onDone}) {
  const [selected,setSelected] = useState([]);
  const toggle = (id) => setSelected(prev=>
    prev.includes(id)?prev.filter(x=>x!==id):prev.length<3?[...prev,id]:prev
  );
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#1a0533,#2d1b69,#11998e)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 20px"}}>
      <div style={{fontSize:60,marginBottom:8,animation:"avatarPop 0.5s ease"}}>{avatar}</div>
      <div style={{fontFamily:"Fredoka One,cursive",fontSize:28,
        background:"linear-gradient(135deg,#FFD700,#FF6B6B,#4ECDC4)",
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:6,textAlign:"center"}}>
        What do you love?
      </div>
      <div style={{color:"rgba(255,255,255,0.6)",fontSize:13,marginBottom:6,textAlign:"center"}}>
        Pick up to 3 — we'll show those first
      </div>
      <div style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginBottom:22,fontFamily:"Fredoka One,cursive"}}>
        {selected.length}/3
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:380,marginBottom:28}}>
        {INTEREST_TAGS.map((tag,i)=>{
          const isSel=selected.includes(tag.id);
          const isFull=selected.length>=3&&!isSel;
          return (
            <button key={tag.id} onClick={()=>!isFull&&toggle(tag.id)} style={{
              background:isSel?"linear-gradient(135deg,#FFD700,#FF8C00)":"rgba(255,255,255,0.08)",
              border:`2px solid ${isSel?"#FFD700":"rgba(255,255,255,0.15)"}`,
              borderRadius:16,padding:"14px 8px",textAlign:"center",
              cursor:isFull?"not-allowed":"pointer",opacity:isFull?0.4:1,
              transform:isSel?"scale(1.04)":"scale(1)",transition:"all 0.2s"}}>
              <div style={{fontSize:28,marginBottom:4}}>{tag.emoji}</div>
              <div style={{fontFamily:"Fredoka One,cursive",fontSize:12,
                color:isSel?"white":"rgba(255,255,255,0.8)"}}>{tag.label}</div>
            </button>
          );
        })}
      </div>
      <button onClick={()=>onDone(selected)} style={{background:"linear-gradient(135deg,#FFD700,#FF6B6B)",
        border:"none",color:"white",borderRadius:30,padding:"14px 40px",fontSize:18,
        fontWeight:800,cursor:"pointer",fontFamily:"Fredoka One,cursive",
        boxShadow:"0 4px 20px rgba(255,150,0,0.4)"}}>
        {selected.length===0?"Skip →":"Let's go! 🚀"}
      </button>
    </div>
  );
}

// ── Teacher Award Banner ──────────────────────────────────────────────────────
function TeacherAwardBanner({award,onDone}) {
  useEffect(()=>{const t=setTimeout(onDone,4000);return()=>clearTimeout(t);},[]);
  return (
    <div onClick={onDone} style={{position:"fixed",inset:0,zIndex:2000,cursor:"pointer",
      display:"flex",alignItems:"center",justifyContent:"center",
      background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)"}}>
      <div style={{background:"linear-gradient(135deg,#431407,#7C2D12)",
        border:"3px solid #F97316",borderRadius:24,padding:"36px 48px",textAlign:"center",
        animation:"teacherAward 0.7s cubic-bezier(.17,.67,.35,1.3) forwards",
        boxShadow:"0 0 60px rgba(249,115,22,0.5)",maxWidth:340}}>
        <div style={{fontSize:60,marginBottom:8,animation:"orangeGlow 1.5s ease-in-out infinite"}}>🟠</div>
        <div style={{fontFamily:"Fredoka One,cursive",fontSize:32,color:"#FED7AA",marginBottom:4}}>
          +{award.orange} Orange Bucks!
        </div>
        <div style={{fontFamily:"Fredoka One,cursive",fontSize:18,color:"#FDBA74",marginBottom:16}}>
          from {award.from} 🎉
        </div>
        {award.reason&&<div style={{background:"rgba(249,115,22,0.15)",borderRadius:12,
          padding:"10px 16px",fontSize:14,color:"#FED7AA",
          fontFamily:"Nunito,sans-serif",fontStyle:"italic"}}>"{award.reason}"</div>}
        <div style={{marginTop:16,fontSize:12,color:"#FED7AA",opacity:0.6,fontFamily:"Nunito,sans-serif"}}>
          Tap to continue
        </div>
      </div>
    </div>
  );
}

// ── Wishlist Jar Card ─────────────────────────────────────────────────────────
function WishlistJarCard({jar,orange,green,kidId,kidName,onUnlock,onContribute}) {
  const total     = jar.orangeContributed + jar.greenContributed;
  const needed    = jar.item.orangeRequired;
  const pct       = Math.min(100, Math.round((total / needed) * 100));
  const isFull    = pct >= 100;
  const [unlocking,setUnlocking] = useState(false);

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      await requestUnlock(kidId, kidName, jar.id, jar.item, jar.item.amazonUrl);
      onUnlock(jar.id);
    } catch { setUnlocking(false); }
  };

  return (
    <div style={{background:"white",borderRadius:20,padding:"18px 16px",
      border:`3px solid ${isFull?"#10B981":"#E8E8E8"}`,
      boxShadow:isFull?"0 8px 30px rgba(16,185,129,0.3)":"none",
      transition:"all 0.3s",position:"relative",overflow:"hidden"}}>
      {isFull&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,
        background:"linear-gradient(90deg,#FFD700,#10B981,#6366F1)"}}/>}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
        <div style={{fontSize:40}}>{jar.item.emoji}</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"Fredoka One,cursive",fontSize:15,color:"#2D2D2D",
            lineHeight:1.2,marginBottom:2}}>{jar.item.name}</div>
          <div style={{fontSize:11,color:"#888",fontFamily:"Nunito,sans-serif"}}>{jar.item.desc}</div>
        </div>
      </div>

      {/* Progress jar */}
      <div style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,
          color:"#888",fontFamily:"Nunito,sans-serif",marginBottom:4}}>
          <span>{pct}% saved</span>
          <span style={{color:isFull?"#10B981":"#888"}}>{total} / {needed}</span>
        </div>
        <div style={{background:"#F1F5F9",borderRadius:20,height:12,overflow:"hidden"}}>
          <div style={{
            width:`${pct}%`,height:"100%",borderRadius:20,
            background:isFull
              ?"linear-gradient(90deg,#FFD700,#10B981)"
              :"linear-gradient(90deg,#F97316,#FDBA74)",
            transition:"width 0.5s ease",
          }}/>
        </div>
        <div style={{display:"flex",gap:6,marginTop:6,fontSize:11,fontFamily:"Nunito,sans-serif"}}>
          {jar.orangeContributed>0&&(
            <span style={{background:"rgba(249,115,22,0.1)",color:"#C2410C",
              borderRadius:10,padding:"2px 8px",fontWeight:700}}>
              🟠 {jar.orangeContributed}
            </span>
          )}
          {jar.greenContributed>0&&(
            <span style={{background:"rgba(16,185,129,0.1)",color:"#065F46",
              borderRadius:10,padding:"2px 8px",fontWeight:700}}>
              🟢 {jar.greenContributed}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {isFull ? (
        <button onClick={handleUnlock} disabled={unlocking} style={{
          width:"100%",background:unlocking?"#E8E8E8":"linear-gradient(135deg,#10B981,#059669)",
          color:unlocking?"#888":"white",border:"none",borderRadius:30,padding:"12px 0",
          fontSize:15,fontWeight:800,cursor:unlocking?"not-allowed":"pointer",
          fontFamily:"Nunito,sans-serif",animation:"unlockPop 0.4s ease"}}>
          {unlocking?"Sending...":"🔓 Unlock! Tell Parent →"}
        </button>
      ) : (
        <div style={{display:"flex",gap:8}}>
          {orange>0&&(
            <button onClick={()=>onContribute(jar.id,"orange",Math.min(orange,needed-total))} style={{
              flex:1,background:"rgba(249,115,22,0.1)",border:"1.5px solid #F97316",
              color:"#C2410C",borderRadius:20,padding:"8px 0",fontSize:13,
              fontWeight:800,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>
              + 🟠 Add Orange
            </button>
          )}
          {green>0&&(
            <button onClick={()=>onContribute(jar.id,"green",Math.min(green,needed-total))} style={{
              flex:1,background:"rgba(16,185,129,0.1)",border:"1.5px solid #10B981",
              color:"#065F46",borderRadius:20,padding:"8px 0",fontSize:13,
              fontWeight:800,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>
              + 🟢 Add Green
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Wishlist Browse ───────────────────────────────────────────────────────────
function WishlistBrowse({interests,orange,onAddToWishlist}) {
  const [categories,setCategories] = useState([]);
  const [category,setCategory]     = useState(null);
  const [items,setItems]           = useState([]);
  const [loading,setLoading]       = useState(true);
  const [loadingItems,setLoadingItems] = useState(false);
  const [added,setAdded]           = useState({});
  const [toast,setToast]           = useState(null);
  const showToast = msg => {setToast(msg);setTimeout(()=>setToast(null),2500);};

  useEffect(()=>{
    fetchCategories().then(cats=>{
      // Sort by interests — no AI, just array ordering
      const sorted = sortCategoriesByInterests(cats, interests);
      setCategories(sorted);
      setLoading(false);
    });
  },[]);

  useEffect(()=>{
    if (!category) return;
    setLoadingItems(true);
    fetchWishlistItems(category)
      .then(i=>{ setItems(i); setLoadingItems(false); })
      .catch(()=>setLoadingItems(false));
  },[category]);

  const handleAdd = async (item) => {
    setAdded(prev=>({...prev,[item.id]:true}));
    onAddToWishlist(item);
    showToast(`⭐ ${item.name} added to your wishlist!`);
  };

  if (!category) return (
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <div style={{textAlign:"center",marginBottom:8,
        fontFamily:"Fredoka One,cursive",fontSize:22,color:"white"}}>
        Browse & Save Prizes ⭐
      </div>
      <div style={{textAlign:"center",fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:20}}>
        Save items to your wishlist jar — earn orange to unlock them!
      </div>
      {loading?(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:14}}>
          {[0,1,2,3,4,5].map(i=><ShimmerCard key={i}/>)}
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:14}}>
          {categories.map((cat,i)=>(
            <button key={cat.id} onClick={()=>setCategory(cat.id)} style={{
              background:"rgba(255,255,255,0.07)",border:`2px solid ${cat.color}66`,
              borderRadius:20,padding:"20px 12px",textAlign:"center",cursor:"pointer",
              transition:"all 0.2s",position:"relative"}}
              onMouseOver={e=>{e.currentTarget.style.background=`${cat.color}22`;e.currentTarget.style.borderColor=cat.color;e.currentTarget.style.transform="translateY(-3px)";}}
              onMouseOut={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.borderColor=`${cat.color}66`;e.currentTarget.style.transform="translateY(0)";}}>
              {/* "Top pick" badge for interest-matched categories */}
              {i<interests?.length&&interests?.length>0&&(
                <div style={{position:"absolute",top:-6,right:-6,background:"#FFD700",
                  borderRadius:10,padding:"2px 8px",fontSize:9,fontWeight:800,color:"#7C5800",
                  fontFamily:"Nunito,sans-serif"}}>⭐ For you</div>
              )}
              <div style={{fontSize:44,marginBottom:8}}>{cat.emoji}</div>
              <div style={{fontFamily:"Fredoka One,cursive",fontSize:15,color:"white",marginBottom:4}}>
                {cat.label}
              </div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>{cat.desc}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const cat = categories.find(c=>c.id===category);
  return (
    <div style={{animation:"slideIn 0.3s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <button onClick={()=>{setCategory(null);setItems([]);}} style={{
          background:"rgba(255,255,255,0.1)",border:"none",color:"white",
          borderRadius:20,padding:"8px 16px",fontSize:13,fontWeight:700,
          cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>← Back</button>
        <div style={{fontFamily:"Fredoka One,cursive",fontSize:22,color:"white"}}>
          {cat?.emoji} {cat?.label}
        </div>
      </div>
      {loadingItems?(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:14}}>
          {[0,1,2,3].map(i=><ShimmerCard key={i}/>)}
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:14}}>
          {items.map(item=>{
            const isAdded=!!added[item.id];
            return (
              <div key={item.id} style={{background:"white",borderRadius:20,
                padding:"18px 14px",textAlign:"center",
                border:`3px solid ${isAdded?"#10B981":cat?.color}`,
                boxShadow:`0 8px 30px ${cat?.color}33`,
                transition:"all 0.3s",position:"relative",overflow:"hidden"}}>
                {isAdded&&<div style={{position:"absolute",top:10,right:10,
                  background:"#10B981",borderRadius:10,padding:"2px 8px",
                  fontSize:9,fontWeight:800,color:"white",fontFamily:"Nunito,sans-serif"}}>
                  ⭐ Saved
                </div>}
                <div style={{fontSize:44,marginBottom:8,lineHeight:1}}>{item.emoji}</div>
                <div style={{fontFamily:"Fredoka One,cursive",fontSize:14,color:"#2D2D2D",
                  marginBottom:4,lineHeight:1.2}}>{item.name}</div>
                <div style={{fontSize:11,color:"#888",marginBottom:6,
                  fontFamily:"Nunito,sans-serif",lineHeight:1.4}}>{item.desc}</div>
                <div style={{fontSize:11,color:"#888",marginBottom:6}}>
                  ⭐ {item.rating} ({item.reviews?.toLocaleString()})
                </div>
                {item.prime&&<div style={{fontSize:10,color:"#00A8E1",fontWeight:700,marginBottom:8}}>⚡ Prime</div>}
                {/* Cost badge */}
                <div style={{display:"inline-flex",alignItems:"center",gap:4,
                  background:"rgba(249,115,22,0.1)",border:"2px solid #F97316",
                  borderRadius:20,padding:"4px 12px",
                  fontFamily:"Fredoka One,cursive",fontSize:15,color:"#C2410C",marginBottom:12}}>
                  🟠 {item.orangeRequired} · {item.priceDisplay}
                </div>
                <button onClick={()=>!isAdded&&handleAdd(item)} disabled={isAdded} style={{
                  background:isAdded?"#E8E8E8":`linear-gradient(135deg,${cat?.color},${cat?.color}BB)`,
                  color:isAdded?"#AAA":"white",border:"none",borderRadius:30,
                  padding:"10px 0",width:"100%",fontSize:14,fontWeight:800,
                  cursor:isAdded?"default":"pointer",fontFamily:"Nunito,sans-serif"}}>
                  {isAdded?"⭐ In Wishlist":"+ Add to Wishlist"}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {toast&&<div style={{position:"fixed",bottom:40,left:"50%",transform:"translateX(-50%)",
        background:"linear-gradient(135deg,#F97316,#EA580C)",color:"white",
        borderRadius:30,padding:"12px 28px",zIndex:2000,
        fontFamily:"Fredoka One,cursive",fontSize:16,
        boxShadow:"0 8px 30px rgba(249,115,22,0.5)",
        animation:"reveal 0.4s ease",whiteSpace:"nowrap"}}>{toast}</div>}
    </div>
  );
}

// ── Digital Store ─────────────────────────────────────────────────────────────
function DigitalStore({green,kidId,kidName,onPurchase}) {
  const [items,setItems]       = useState([]);
  const [loading,setLoading]   = useState(true);
  const [modal,setModal]       = useState(null);
  const [email,setEmail]       = useState("");
  const [purchasing,setPurch]  = useState(false);
  const [done,setDone]         = useState({});
  const [toast,setToast]       = useState(null);
  const showToast = msg => {setToast(msg);setTimeout(()=>setToast(null),3000);};

  useEffect(()=>{
    fetchDigitalCatalog()
      .then(i=>{ setItems(i); setLoading(false); })
      .catch(()=>setLoading(false));
  },[]);

  const handlePurchase = async () => {
    if (!email.trim()||!modal) return;
    setPurch(true);
    try {
      const result = await purchaseDigitalCode(modal.id, kidId, kidName, email);
      setDone(prev=>({...prev,[modal.id]:result}));
      onPurchase(modal.totalCost);
      showToast(`🎉 ${modal.name} sent to ${email}!`);
      setModal(null);
      setEmail("");
    } catch {
      showToast("❌ Something went wrong — try again!");
    }
    setPurch(false);
  };

  return (
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <div style={{textAlign:"center",marginBottom:8,
        fontFamily:"Fredoka One,cursive",fontSize:22,color:"white"}}>
        Digital Codes 💻
      </div>
      <div style={{textAlign:"center",fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:20}}>
        Instant delivery to your email — spend 🟢 green
      </div>

      {/* Purchase modal */}
      {modal&&(
        <div style={{position:"fixed",inset:0,zIndex:3000,
          display:"flex",alignItems:"center",justifyContent:"center",
          background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",padding:20}}>
          <div style={{background:"#1E293B",border:"2px solid #334155",borderRadius:24,
            padding:"28px 24px",maxWidth:360,width:"100%",animation:"reveal 0.3s ease"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:56,marginBottom:8}}>{modal.emoji}</div>
              <div style={{fontFamily:"Fredoka One,cursive",fontSize:20,color:"#F1F5F9",marginBottom:4}}>
                {modal.name}
              </div>
              <div style={{fontSize:13,color:"#94A3B8",marginBottom:12}}>{modal.desc}</div>
              <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:4,
                  background:"rgba(16,185,129,0.15)",border:"2px solid #10B981",
                  borderRadius:20,padding:"5px 14px",
                  fontFamily:"Fredoka One,cursive",fontSize:18,color:"#6EE7B7"}}>
                  🟢 {modal.totalCost} green
                </div>
              </div>
              <div style={{fontSize:11,color:"#6366F1",marginTop:8}}>
                Includes {modal.convenienceFeeDisplay} convenience fee
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",
                textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>
                Send code to email
              </div>
              <input value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="your@email.com" type="email"
                style={{width:"100%",background:"#0F172A",border:"1.5px solid #334155",
                  borderRadius:8,padding:"10px 12px",fontSize:14,color:"#F1F5F9",
                  fontFamily:"Nunito,sans-serif",outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{background:"#162032",borderRadius:12,padding:"12px 14px",
              marginBottom:16,fontSize:12,color:"#94A3B8",lineHeight:1.7}}>
              <div>⚡ Code delivered instantly</div>
              <div>📧 Check your email in seconds</div>
              <div>🟢 {modal.totalCost} green deducted</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setModal(null);setEmail("");}} style={{flex:1,
                background:"transparent",border:"2px solid #334155",color:"#94A3B8",
                borderRadius:12,padding:"11px",fontSize:14,fontWeight:800,
                cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Cancel</button>
              <button onClick={handlePurchase}
                disabled={purchasing||!email.trim()||green<modal.totalCost} style={{flex:2,
                background:purchasing||!email.trim()||green<modal.totalCost
                  ?"#334155":"linear-gradient(135deg,#10B981,#059669)",
                border:"none",color:"white",borderRadius:12,padding:"11px",
                fontSize:14,fontWeight:800,
                cursor:purchasing||!email.trim()||green<modal.totalCost?"not-allowed":"pointer",
                fontFamily:"Nunito,sans-serif"}}>
                {purchasing?"Sending...":green<modal.totalCost?"Need more 🟢":"Get Code! ⚡"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading?(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:14}}>
          {[0,1,2,3].map(i=><ShimmerCard key={i}/>)}
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:14}}>
          {items.map(item=>{
            const canAfford=green>=item.totalCost;
            const isDone=!!done[item.id];
            return (
              <div key={item.id} style={{background:"white",borderRadius:20,
                padding:"18px 14px",textAlign:"center",
                border:`3px solid ${canAfford?item.color:"#E8E8E8"}`,
                opacity:canAfford?1:0.5,
                boxShadow:canAfford?`0 8px 30px ${item.color}33`:"none",
                transition:"all 0.3s",position:"relative",overflow:"hidden"}}>
                {item.popular&&!isDone&&(
                  <div style={{position:"absolute",top:10,left:10,
                    background:"#FF6B6B",borderRadius:10,padding:"2px 8px",
                    fontSize:9,fontWeight:800,color:"white",fontFamily:"Nunito,sans-serif"}}>
                    🔥 Popular
                  </div>
                )}
                {isDone&&(
                  <div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.92)",
                    display:"flex",flexDirection:"column",alignItems:"center",
                    justifyContent:"center",borderRadius:17,gap:4}}>
                    <div style={{fontSize:36}}>✅</div>
                    <div style={{fontSize:11,fontWeight:800,color:"#10B981"}}>Code sent!</div>
                  </div>
                )}
                <div style={{fontSize:44,marginBottom:6,lineHeight:1,
                  marginTop:item.popular?"12px":"0"}}>{item.emoji}</div>
                <div style={{fontFamily:"Fredoka One,cursive",fontSize:14,color:"#2D2D2D",
                  marginBottom:2,lineHeight:1.2}}>{item.name}</div>
                <div style={{fontSize:10,color:"#888",marginBottom:8,fontFamily:"Nunito,sans-serif"}}>
                  {item.desc}
                </div>
                <div style={{display:"inline-flex",alignItems:"center",gap:4,
                  background:"rgba(16,185,129,0.1)",border:"2px solid #10B981",
                  borderRadius:20,padding:"4px 12px",
                  fontFamily:"Fredoka One,cursive",fontSize:16,color:"#065F46",marginBottom:4}}>
                  🟢 {item.totalCost}
                </div>
                <div style={{fontSize:10,color:"#999",marginBottom:10,fontFamily:"Nunito,sans-serif"}}>
                  {item.priceDisplay} + {item.convenienceFeeDisplay} fee
                </div>
                <button onClick={()=>canAfford&&!isDone&&setModal(item)}
                  disabled={!canAfford||isDone} style={{
                  background:canAfford&&!isDone
                    ?`linear-gradient(135deg,${item.color},${item.color}BB)`:"#E8E8E8",
                  color:canAfford&&!isDone?"white":"#AAA",
                  border:"none",borderRadius:30,padding:"10px 0",width:"100%",
                  fontSize:14,fontWeight:800,
                  cursor:canAfford&&!isDone?"pointer":"not-allowed",
                  fontFamily:"Nunito,sans-serif"}}>
                  {isDone?"Sent! ✅":canAfford?"⚡ Get Instantly":"Need more 🟢"}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {toast&&<div style={{position:"fixed",bottom:40,left:"50%",transform:"translateX(-50%)",
        background:"linear-gradient(135deg,#10B981,#059669)",color:"white",
        borderRadius:30,padding:"12px 28px",zIndex:2000,
        fontFamily:"Fredoka One,cursive",fontSize:16,
        boxShadow:"0 8px 30px rgba(16,185,129,0.5)",
        animation:"reveal 0.4s ease",whiteSpace:"nowrap"}}>{toast}</div>}
    </div>
  );
}

// ── Orange Rewards ────────────────────────────────────────────────────────────
function OrangeRewards({orange,rewards,onClaim}) {
  const [filter,setFilter]   = useState("all");
  const [claimed,setClaimed] = useState({});
  const [toast,setToast]     = useState(null);
  const showToast = msg => {setToast(msg);setTimeout(()=>setToast(null),2500);};
  const claim = r => {
    if (orange<r.orange) return;
    setClaimed(prev=>({...prev,[r.id]:true}));
    onClaim(r); showToast(`🎉 ${r.label} — enjoy!`);
  };
  const visible = rewards.filter(r=>filter==="all"||r.tag===filter);
  return (
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <div style={{textAlign:"center",marginBottom:16,
        fontFamily:"Fredoka One,cursive",fontSize:22,color:"white"}}>
        Spend Your Orange Bucks 🟠
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {[{id:"all",label:"🎯 All"},{id:"home",label:"🏠 Home"},{id:"classroom",label:"🏫 Classroom"}].map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{
            background:filter===f.id?"#F97316":"rgba(255,255,255,0.1)",
            border:`2px solid ${filter===f.id?"#F97316":"rgba(255,255,255,0.2)"}`,
            color:"white",borderRadius:30,padding:"8px 18px",fontSize:13,fontWeight:700,
            cursor:"pointer",fontFamily:"Nunito,sans-serif",transition:"all 0.2s"}}>
            {f.label}
          </button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14}}>
        {visible.map(r=>{
          const canAfford=orange>=r.orange;
          const isClaimed=!!claimed[r.id];
          return (
            <div key={r.id} style={{background:"white",borderRadius:20,padding:"18px 14px",
              textAlign:"center",border:`3px solid ${canAfford?"#F97316":"#E8E8E8"}`,
              opacity:canAfford?1:0.5,
              boxShadow:canAfford?"0 8px 30px rgba(249,115,22,0.25)":"none",
              transition:"all 0.3s",position:"relative",overflow:"hidden"}}>
              {isClaimed&&<div style={{position:"absolute",inset:0,
                background:"rgba(255,255,255,0.9)",display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:40,borderRadius:17}}>✅</div>}
              <div style={{position:"absolute",top:10,right:10,
                background:r.tag==="home"?"#DBEAFE":"#DCFCE7",
                color:r.tag==="home"?"#1E40AF":"#166534",
                borderRadius:10,padding:"2px 8px",fontSize:9,fontWeight:800,
                fontFamily:"Nunito,sans-serif",textTransform:"uppercase",letterSpacing:0.5}}>
                {r.tag==="home"?"🏠":"🏫"}
              </div>
              <div style={{fontSize:44,marginBottom:8,lineHeight:1,marginTop:8}}>{r.emoji}</div>
              <div style={{fontFamily:"Fredoka One,cursive",fontSize:14,color:"#2D2D2D",
                marginBottom:12,lineHeight:1.2}}>{r.label}</div>
              <div style={{display:"inline-flex",alignItems:"center",gap:5,
                background:"rgba(249,115,22,0.1)",border:"2px solid #F97316",
                borderRadius:20,padding:"4px 14px",
                fontFamily:"Fredoka One,cursive",fontSize:18,color:"#7C2D12",marginBottom:12}}>
                🟠 {r.orange}
              </div>
              <button onClick={()=>claim(r)} disabled={!canAfford||isClaimed} style={{
                background:canAfford&&!isClaimed?"linear-gradient(135deg,#F97316,#EA580C)":"#E8E8E8",
                color:canAfford&&!isClaimed?"white":"#AAA",
                border:"none",borderRadius:30,padding:"10px 0",width:"100%",
                fontSize:14,fontWeight:800,cursor:canAfford&&!isClaimed?"pointer":"not-allowed",
                fontFamily:"Nunito,sans-serif"}}>
                {isClaimed?"Redeemed! ✓":canAfford?"🎉 Redeem!":"Need more 🟠"}
              </button>
            </div>
          );
        })}
      </div>
      {toast&&<div style={{position:"fixed",bottom:40,left:"50%",transform:"translateX(-50%)",
        background:"linear-gradient(135deg,#F97316,#EA580C)",color:"white",
        borderRadius:30,padding:"12px 28px",zIndex:2000,
        fontFamily:"Fredoka One,cursive",fontSize:16,
        boxShadow:"0 8px 30px rgba(249,115,22,0.5)",
        animation:"reveal 0.4s ease",whiteSpace:"nowrap"}}>{toast}</div>}
    </div>
  );
}

// ── The Box ───────────────────────────────────────────────────────────────────
function TheBox({phase,onOpen}) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 0 32px"}}>
      <div onClick={phase==="closed"?onOpen:undefined}
        style={{cursor:phase==="closed"?"pointer":"default",position:"relative",userSelect:"none"}}>
        <div style={{width:200,height:50,background:"linear-gradient(135deg,#FF6B6B,#FF8E53)",
          borderRadius:"12px 12px 0 0",boxShadow:"0 -4px 20px rgba(255,100,0,0.4)",
          position:"relative",zIndex:2,display:"flex",alignItems:"center",justifyContent:"center",
          animation:phase==="shaking"?"wiggle 0.15s ease-in-out infinite"
            :phase==="opening"?"lidPop 0.8s ease-out forwards"
            :"bounce 2s ease-in-out infinite"}}>
          <div style={{width:60,height:16,background:"rgba(255,255,255,0.3)",borderRadius:20}}/>
        </div>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",
          width:24,height:"100%",background:"rgba(255,255,255,0.25)",zIndex:3,borderRadius:4,
          animation:phase==="shaking"?"wiggle 0.15s ease-in-out infinite":"bounce 2s ease-in-out infinite"}}/>
        <div style={{width:200,height:160,background:"linear-gradient(160deg,#FF8E53,#FF6B6B)",
          borderRadius:"0 0 16px 16px",
          boxShadow:"0 12px 40px rgba(255,100,0,0.4),inset 0 1px 0 rgba(255,255,255,0.2)",
          display:"flex",alignItems:"center",justifyContent:"center",
          animation:phase==="shaking"?"wiggle 0.15s ease-in-out infinite"
            :phase==="opening"?"boxOpen 0.5s ease forwards"
            :"bounce 2s ease-in-out infinite",
          position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:"50%",left:0,right:0,height:24,
            background:"rgba(255,255,255,0.25)",transform:"translateY(-50%)"}}/>
          <div style={{fontFamily:"Fredoka One,cursive",fontSize:28,color:"white",
            textShadow:"0 2px 8px rgba(0,0,0,0.2)",position:"relative",zIndex:2}}>
            {phase==="closed"?"Tap me!":phase==="shaking"?"✨✨✨":"🎉"}
          </div>
        </div>
        {phase==="closed"&&["⭐","✨","🌟"].map((s,i)=>(
          <div key={i} style={{position:"absolute",
            top:i===0?"-20px":i===1?"30px":"-10px",
            left:i===0?"-30px":i===1?"-40px":"210px",fontSize:20,
            animation:`starPop 0.5s ease ${i*0.2}s both, float ${2+i*0.5}s ease-in-out ${i*0.3}s infinite`}}>
            {s}
          </div>
        ))}
      </div>
      {phase==="closed"&&(
        <div style={{marginTop:20,color:"rgba(255,255,255,0.7)",fontSize:14,
          fontFamily:"Fredoka One,cursive",animation:"float 2s ease-in-out infinite"}}>
          Tap the box to open! 🎁
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const DEFAULT_CFG = {
  storeEnabled:true, greenEnabled:true, orangeStore:true,
  delivery:"home", orangePerDollar:100,
};

export default function PrizeBox({cfg=DEFAULT_CFG, kidId="", kidName=""}) {
  const [avatar,   setAvatar]   = useState(null);
  const [interests,setInterests]= useState(null);   // array of interest ids, or []
  const [phase,    setPhase]    = useState("closed");
  const [activeTab,setActiveTab]= useState("wishlist");
  const [green,    setGreen]    = useState(1500);   // cents
  const [orange,   setOrange]   = useState(320);    // bonus bucks
  const [confetti, setConfetti] = useState(false);
  const [award,    setAward]    = useState(null);
  const [rewards]               = useState(ORANGE_REWARDS);

  // Wishlist jars — in prod these come from the backend per kid
  const [jars,setJars] = useState([]);

  useEffect(()=>{
    if (phase==="open") {
      const t = setTimeout(()=>{
        setAward({orange:50,from:"Ms. Black",reason:"Amazing work on your science project!"});
        setOrange(p=>p+50);
        setConfetti(true);
        setTimeout(()=>setConfetti(false),3000);
      },2500);
      return ()=>clearTimeout(t);
    }
  },[phase]);

  const handleOpen = () => {
    setPhase("shaking");
    setTimeout(()=>setPhase("opening"),1000);
    setTimeout(()=>{setPhase("open");setConfetti(true);},1800);
    setTimeout(()=>setConfetti(false),3500);
  };

  const handleAddToWishlist = (item) => {
    // Create a new jar for this item if it doesn't exist
    if (jars.find(j=>j.item.id===item.id)) return;
    const jar = {
      id:              `jar_${Date.now()}`,
      item,
      orangeContributed: 0,
      greenContributed:  0,
    };
    setJars(prev=>[...prev,jar]);
    addToWishlist(kidId, item).catch(console.error);
  };

  const handleContribute = (jarId, currency, amount) => {
    setJars(prev=>prev.map(j=>{
      if (j.id!==jarId) return j;
      const contributed = Math.min(amount, j.item.orangeRequired - j.orangeContributed - j.greenContributed);
      if (currency==="orange") {
        setOrange(p=>p-contributed);
        return {...j, orangeContributed: j.orangeContributed + contributed};
      } else {
        setGreen(p=>p-contributed);
        return {...j, greenContributed: j.greenContributed + contributed};
      }
    }));
    contributeToJar(kidId, jarId, currency, amount).catch(console.error);
    setConfetti(true);
    setTimeout(()=>setConfetti(false),2000);
  };

  const handleUnlock = (jarId) => {
    setJars(prev=>prev.map(j=>j.id===jarId?{...j,unlocked:true}:j));
    setConfetti(true);
    setTimeout(()=>setConfetti(false),3000);
  };

  const TABS = [
    {id:"wishlist", label:"⭐ Wishlist",  show:cfg.storeEnabled},
    {id:"digital",  label:"💻 Digital",   show:cfg.greenEnabled},
    {id:"rewards",  label:"🟠 Rewards",   show:true},
  ].filter(t=>t.show);

  if (!avatar)    return <><style>{fontCSS}</style><AvatarPicker onSelect={setAvatar}/></>;
  if (!interests) return <><style>{fontCSS}</style><InterestPicker avatar={avatar} onDone={i=>setInterests(i)}/></>;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#1a0533,#2d1b69,#11998e)",
      fontFamily:"Nunito,sans-serif",overflow:"hidden",position:"relative"}}>
      <style>{fontCSS}</style>
      <Confetti active={confetti}/>
      {award&&<TeacherAwardBanner award={award} onDone={()=>setAward(null)}/>}

      {/* Stars */}
      {Array.from({length:20}).map((_,i)=>(
        <div key={i} style={{position:"fixed",
          left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,
          width:i%3===0?"5px":"3px",height:i%3===0?"5px":"3px",
          background:"white",borderRadius:"50%",opacity:0.3+Math.random()*0.4,
          animation:`float ${2+Math.random()*3}s ease-in-out infinite`,
          animationDelay:`${Math.random()*3}s`}}/>
      ))}

      {/* Header */}
      <div style={{textAlign:"center",paddingTop:28,paddingBottom:16,position:"relative",zIndex:10}}>
        <div style={{fontFamily:"Fredoka One,cursive",fontSize:40,
          background:"linear-gradient(135deg,#FFD700,#FF6B6B,#4ECDC4)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          lineHeight:1,filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.3))"}}>
          🎁 Prize Box
        </div>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,marginTop:8,
          background:"rgba(255,255,255,0.1)",borderRadius:30,padding:"6px 16px",
          border:"1.5px solid rgba(255,255,255,0.15)",
          animation:"avatarPop 0.5s cubic-bezier(.17,.67,.35,1.3)"}}>
          <span style={{fontSize:28}}>{avatar}</span>
          <span style={{color:"white",fontWeight:800,fontSize:15}}>Alex</span>
        </div>

        {/* Balances */}
        <div style={{marginTop:14,padding:"0 16px",display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
          {cfg.greenEnabled&&(
            <div style={{background:"rgba(16,185,129,0.15)",border:"2px solid #10B981",
              borderRadius:20,padding:"10px 20px",textAlign:"center",animation:"float 3s ease-in-out infinite"}}>
              <div style={{fontSize:11,color:"#6EE7B7",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>
                🟢 Green Money
              </div>
              <div style={{fontFamily:"Fredoka One,cursive",fontSize:28,color:"#6EE7B7"}}>
                ${(green/100).toFixed(2)}
              </div>
              <div style={{fontSize:10,color:"rgba(110,231,183,0.6)"}}>digital codes</div>
            </div>
          )}
          <div style={{background:"rgba(249,115,22,0.15)",border:"2px solid #F97316",
            borderRadius:20,padding:"10px 20px",textAlign:"center",animation:"float 3s ease-in-out 0.5s infinite"}}>
            <div style={{fontSize:11,color:"#FDBA74",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>
              🟠 Orange Bucks
            </div>
            <div style={{fontFamily:"Fredoka One,cursive",fontSize:28,color:"#FDBA74"}}>
              {orange}
            </div>
            <div style={{fontSize:10,color:"rgba(253,186,116,0.6)"}}>wishlist + rewards</div>
          </div>
        </div>
      </div>

      {/* Class goal */}
      <div style={{maxWidth:400,margin:"0 auto 16px",padding:"0 20px",position:"relative",zIndex:10}}>
        <div style={{background:"rgba(255,255,255,0.08)",borderRadius:16,padding:"12px 16px",
          border:"1px solid rgba(255,255,255,0.12)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{color:"white",fontSize:13,fontWeight:700}}>🏫 Class Box Goal</span>
            <span style={{color:"#FFD700",fontSize:13,fontWeight:800}}>$34 / $50</span>
          </div>
          <div style={{background:"rgba(255,255,255,0.12)",borderRadius:20,height:10,overflow:"hidden"}}>
            <div style={{width:"68%",height:"100%",borderRadius:20,
              background:"linear-gradient(90deg,#FFD700,#FF6B6B)",
              boxShadow:"0 0 10px rgba(255,200,0,0.5)"}}/>
          </div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,marginTop:4}}>
            🎯 $16 away from a Pizza Party!
          </div>
        </div>
      </div>

      {/* Box or content */}
      {phase!=="open"?(
        <TheBox phase={phase} onOpen={handleOpen}/>
      ):(
        <div style={{maxWidth:860,margin:"0 auto",padding:"0 16px 60px",position:"relative",zIndex:10}}>

          {/* Tabs */}
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:24,flexWrap:"wrap"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
                background:activeTab===t.id?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.07)",
                border:`2px solid ${activeTab===t.id?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.15)"}`,
                color:"white",borderRadius:30,padding:"10px 24px",fontSize:15,fontWeight:800,
                cursor:"pointer",fontFamily:"Fredoka One,cursive",transition:"all 0.2s",
                position:"relative"}}>
                {t.label}
                {t.id==="wishlist"&&jars.length>0&&(
                  <span style={{position:"absolute",top:-6,right:-6,background:"#F97316",
                    color:"white",borderRadius:"50%",width:18,height:18,fontSize:10,
                    fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",
                    fontFamily:"Nunito,sans-serif"}}>{jars.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Wishlist tab — shows jars + browse */}
          {activeTab==="wishlist"&&cfg.storeEnabled&&(
            <div>
              {/* Active jars */}
              {jars.length>0&&(
                <div style={{marginBottom:28}}>
                  <div style={{fontFamily:"Fredoka One,cursive",fontSize:18,color:"white",
                    marginBottom:14}}>⭐ Your Wishlist Jars</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
                    {jars.map(jar=>(
                      <WishlistJarCard key={jar.id} jar={jar}
                        orange={orange} green={green}
                        kidId={kidId} kidName={kidName}
                        onUnlock={handleUnlock}
                        onContribute={handleContribute}/>
                    ))}
                  </div>
                  <div style={{height:1,background:"rgba(255,255,255,0.1)",margin:"24px 0"}}/>
                </div>
              )}
              {/* Browse catalog */}
              <WishlistBrowse
                interests={interests}
                orange={orange}
                onAddToWishlist={handleAddToWishlist}/>
            </div>
          )}

          {activeTab==="digital"&&cfg.greenEnabled&&(
            <DigitalStore
              green={green} kidId={kidId} kidName={kidName}
              onPurchase={amt=>setGreen(p=>p-amt)}/>
          )}

          {activeTab==="rewards"&&(
            <OrangeRewards
              orange={orange} rewards={rewards}
              onClaim={r=>setOrange(p=>p-r.orange)}/>
          )}
        </div>
      )}
    </div>
  );
}

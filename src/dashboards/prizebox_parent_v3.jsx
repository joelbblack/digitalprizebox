import { useState, useEffect } from "react";

const fontCSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
@keyframes fadeIn  { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
@keyframes pop     { 0%{transform:scale(0.9);opacity:0;} 60%{transform:scale(1.04);} 100%{transform:scale(1);opacity:1;} }
@keyframes slide   { from{opacity:0;transform:translateX(-10px);} to{opacity:1;transform:translateX(0);} }
`;

const C = {
  bg:"#0F172A",panel:"#1E293B",panel2:"#162032",border:"#334155",
  text:"#F1F5F9",sub:"#94A3B8",accent:"#6366F1",
  green:"#10B981",greenL:"#A7F3D0",
  orange:"#F97316",orangeL:"#FED7AA",
  gold:"#F59E0B",red:"#EF4444",purple:"#8B5CF6",
};

const SEED_KIDS = [];
const SEED_CHORES = [];
const SEED_PROPOSALS = [];
const DEFAULT_HOME_REWARDS = [
  { id:"hr1", emoji:"🎮", label:"Extra Game Time (30 min)", orange:40  },
  { id:"hr2", emoji:"🌙", label:"Stay Up 30 Min Late",      orange:60  },
  { id:"hr3", emoji:"👯", label:"Have a Friend Over",        orange:100 },
  { id:"hr4", emoji:"🍕", label:"Pick Dinner Tonight",       orange:50  },
  { id:"hr5", emoji:"🚫", label:"Skip One Chore",            orange:35  },
  { id:"hr6", emoji:"🎬", label:"Movie Night Pick",          orange:45  },
];

const CHORE_PRESETS = [
  { emoji:"🛏️", name:"Make your bed",       orange:10 },
  { emoji:"🍽️", name:"Unload dishwasher",   orange:15 },
  { emoji:"🧹", name:"Sweep the floor",     orange:20 },
  { emoji:"🐶", name:"Feed the pet",        orange:10 },
  { emoji:"🗑️", name:"Take out trash",      orange:20 },
  { emoji:"📖", name:"Read for 20 minutes", orange:25 },
  { emoji:"🧺", name:"Put away laundry",    orange:15 },
  { emoji:"🪴", name:"Water the plants",    orange:10 },
];

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
  <button type="button" onClick={onClick} disabled={disabled} style={{
    background:disabled?"transparent":outline?"transparent":color,
    border:outline||disabled?`1.5px solid ${disabled?C.border:color}`:"none",
    color:disabled?C.sub:outline?color:"white",
    borderRadius:10,padding:small?"6px 14px":"10px 20px",
    fontSize:small?12:14,fontWeight:800,cursor:disabled?"not-allowed":"pointer",
    fontFamily:"Nunito,sans-serif",whiteSpace:"nowrap",opacity:disabled?0.5:1,
    width:full?"100%":undefined,
  }}>{children}</button>
);

const Card = ({children,style={}}) => (
  <div style={{background:C.panel,borderRadius:14,padding:"20px",
    border:`1px solid ${C.border}`,marginBottom:16,
    animation:"fadeIn 0.3s ease",...style}}>{children}</div>
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

function OverviewTab({kids}) {
  if (kids.length === 0) return (
    <div style={{textAlign:"center",padding:"60px 20px"}}>
      <div style={{fontSize:56,marginBottom:16}}>👨‍👩‍👧‍👦</div>
      <div style={{fontFamily:"Fredoka One,cursive",fontSize:24,color:C.text,marginBottom:8}}>
        Welcome to Digital Prize Box!
      </div>
      <div style={{fontSize:14,color:C.sub,marginBottom:24,lineHeight:1.7,maxWidth:400,margin:"0 auto 24px"}}>
        Get started by adding your first kid in the Chores tab,
        then create some chores for them to complete.
      </div>
    </div>
  );
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
        {kids.map(kid=>(
          <Card key={kid.id}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
              <div style={{fontSize:44}}>{kid.avatar}</div>
              <div>
                <div style={{fontWeight:800,fontSize:18}}>{kid.name}</div>
                <div style={{fontSize:12,color:C.sub}}>{kid.grade} grade</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div style={{background:`${C.green}18`,border:`1.5px solid ${C.green}`,
                borderRadius:12,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:10,color:C.green,fontWeight:700,
                  textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>🟢 Green</div>
                <div style={{fontFamily:"Fredoka One,cursive",fontSize:22,color:C.green}}>
                  ${(kid.greenBalance/100).toFixed(2)}
                </div>
                <div style={{fontSize:10,color:C.sub,marginTop:2}}>digital codes</div>
              </div>
              <div style={{background:`${C.orange}18`,border:`1.5px solid ${C.orange}`,
                borderRadius:12,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:10,color:C.orange,fontWeight:700,
                  textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>🟠 Orange</div>
                <div style={{fontFamily:"Fredoka One,cursive",fontSize:22,color:C.orange}}>
                  {kid.orangeBalance}
                </div>
                <div style={{fontSize:10,color:C.sub,marginTop:2}}>available</div>
              </div>
            </div>
            {kid.jars&&kid.jars.length>0&&(
              <div style={{fontSize:12,color:C.sub}}>
                ⭐ {kid.jars.length} wishlist jar{kid.jars.length>1?"s":""} active
              </div>
            )}
          </Card>
        ))}
      </div>
      <Card style={{marginTop:4}}>
        <div style={{fontSize:16,fontWeight:800,marginBottom:16}}>💡 How it works</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16}}>
          {[
            {e:"🟢",title:"Green — Real $",color:C.green,desc:"Load via Stripe. Kid buys instant digital codes."},
            {e:"🟠",title:"Orange — Bonus Bucks",color:C.orange,desc:"You award for chores. Kid saves toward prizes."},
            {e:"⭐",title:"Wishlist Jar",color:C.gold,desc:"Orange pools toward a prize. Kid unlocks, you buy on Amazon."},
          ].map(item=>(
            <div key={item.title}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:20}}>{item.e}</span>
                <span style={{fontWeight:800,color:item.color,fontSize:13}}>{item.title}</span>
              </div>
              <div style={{fontSize:12,color:C.sub,lineHeight:1.6}}>{item.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function JarsTab({kids,setKids,proposals,setProposals,showToast,onApproveProposal,onDeclineProposal}) {
  const [selectedKid,setSelectedKid] = useState(kids[0]?.id||null);
  const [allocating,setAllocating]   = useState(null);
  const [allocAmount,setAllocAmount] = useState("");
  const [editAmount,setEditAmount]   = useState({});

  useEffect(()=>{
    if (!selectedKid && kids.length>0) setSelectedKid(kids[0].id);
  },[kids]);

  const kid = kids.find(k=>k.id===selectedKid);
  const kidProposals = proposals.filter(p=>p.kidId===selectedKid&&p.status==="pending");

  const jarTotal = (jar) => (jar.orangeConfirmed||0) + (jar.orangePending||0);
  const jarPct   = (jar) => Math.min(100, Math.round((jarTotal(jar)/(jar.item?.orangeRequired||1))*100));
  const confirmedPct = (jar) => Math.min(100, Math.round(((jar.orangeConfirmed||0)/(jar.item?.orangeRequired||1))*100));

  const confirmAllocate = (kidId, jarId, amount) => {
    const amt = Number(amount);
    if (!amt||amt<=0) return;
    setKids(prev=>prev.map(k=>{
      if (k.id!==kidId) return k;
      const newOrange = Math.max(0, k.orangeBalance - amt);
      const newJars   = (k.jars||[]).map(j=>j.id===jarId
        ? {...j, orangeConfirmed:(j.orangeConfirmed||0)+Math.min(amt,k.orangeBalance)} : j);
      return {...k, orangeBalance:newOrange, jars:newJars};
    }));
    setAllocating(null); setAllocAmount("");
    showToast(`🟠 ${amt} orange → jar!`);
  };

  const approveProposal = async (proposal, overrideAmount=null) => {
    const amt = overrideAmount || proposal.proposed;
    if (onApproveProposal) {
      try { await onApproveProposal(proposal, amt); }
      catch(e){ showToast("❌ Error approving"); return; }
    }
    setKids(prev=>prev.map(k=>{
      if (k.id!==proposal.kidId) return k;
      const newOrange = Math.max(0, k.orangeBalance-amt);
      const newJars = (k.jars||[]).map(j=>j.id===proposal.jarId
        ?{...j, orangeConfirmed:(j.orangeConfirmed||0)+Math.min(amt,k.orangeBalance),
           orangePending:Math.max(0,(j.orangePending||0)-proposal.proposed)} : j);
      return {...k, orangeBalance:newOrange, jars:newJars};
    }));
    setProposals(prev=>prev.map(p=>p.id===proposal.id?{...p,status:"approved"}:p));
    showToast(`✅ ${amt} 🟠 approved!`);
  };

  const declineProposal = async (proposal) => {
    if (onDeclineProposal) {
      try { await onDeclineProposal(proposal); }
      catch(e){ showToast("❌ Error declining"); return; }
    }
    setProposals(prev=>prev.map(p=>p.id===proposal.id?{...p,status:"declined"}:p));
    showToast("❌ Proposal declined");
  };

  if (kids.length===0) return (
    <div style={{textAlign:"center",color:C.sub,padding:"40px 0",fontSize:14}}>
      Add kids first in the Chores tab.
    </div>
  );

  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      {proposals.filter(p=>p.status==="pending").length>0&&(
        <div style={{background:`${C.gold}18`,border:`1.5px solid ${C.gold}`,
          borderRadius:14,padding:"14px 18px",marginBottom:16,
          display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div style={{fontSize:24}}>⏳</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,color:C.gold,fontSize:14}}>
              {proposals.filter(p=>p.status==="pending").length} pending proposal{proposals.filter(p=>p.status==="pending").length>1?"s":""}
            </div>
            <div style={{fontSize:12,color:C.sub}}>Your kids want to contribute orange to their wishlist jars</div>
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
        {kids.map(k=>(
          <button type="button" key={k.id} onClick={()=>setSelectedKid(k.id)} style={{
            background:selectedKid===k.id?C.accent:"transparent",
            border:`2px solid ${selectedKid===k.id?C.accent:C.border}`,
            color:selectedKid===k.id?"white":C.sub,
            borderRadius:30,padding:"8px 18px",fontSize:13,fontWeight:700,
            cursor:"pointer",fontFamily:"Nunito,sans-serif",
            display:"flex",alignItems:"center",gap:6}}>
            {k.avatar} {k.name}
          </button>
        ))}
      </div>
      {kid&&(
        <>
          <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
            <div style={{background:`${C.orange}18`,border:`1.5px solid ${C.orange}`,
              borderRadius:12,padding:"10px 18px",textAlign:"center"}}>
              <div style={{fontSize:10,color:C.orange,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>🟠 Available</div>
              <div style={{fontFamily:"Fredoka One,cursive",fontSize:24,color:C.orange}}>{kid.orangeBalance}</div>
            </div>
          </div>
          {kidProposals.length>0&&(
            <Card style={{border:`1.5px solid ${C.gold}55`}}>
              <div style={{fontSize:15,fontWeight:800,marginBottom:14,color:C.gold}}>
                ⏳ {kid.name} wants to contribute
              </div>
              {kidProposals.map(p=>(
                <div key={p.id} style={{background:C.panel2,borderRadius:12,
                  padding:"14px 16px",marginBottom:10,
                  display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <div style={{fontSize:28}}>{p.jarEmoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:14}}>{p.jarName}</div>
                    {p.message&&<div style={{fontSize:12,color:C.sub,marginTop:2,fontStyle:"italic"}}>"{p.message}"</div>}
                  </div>
                  <Pill color={C.orange} bg={`${C.orange}18`}>🟠 {p.proposed}</Pill>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <input type="number"
                      value={editAmount[p.id]!==undefined?editAmount[p.id]:p.proposed}
                      onChange={e=>setEditAmount(prev=>({...prev,[p.id]:Number(e.target.value)}))}
                      style={{width:70,background:C.bg,border:`1.5px solid ${C.border}`,
                        borderRadius:8,padding:"6px 8px",fontSize:13,color:C.orange,
                        fontFamily:"Nunito,sans-serif",outline:"none",textAlign:"center"}}/>
                    <Btn onClick={()=>approveProposal(p,editAmount[p.id]||p.proposed)} color={C.green} small>✅ Approve</Btn>
                    <Btn onClick={()=>declineProposal(p)} color={C.red} small outline>✕</Btn>
                  </div>
                </div>
              ))}
            </Card>
          )}
          {(!kid.jars||kid.jars.length===0)?(
            <div style={{textAlign:"center",color:C.sub,padding:"40px 0",fontSize:14}}>
              {kid.name} hasn't added anything to their wishlist yet.
            </div>
          ):(
            kid.jars.map(jar=>{
              const total=jarTotal(jar);
              const pct=jarPct(jar);
              const confPct=confirmedPct(jar);
              const isFull=pct>=100;
              const isAllocatingThis=allocating?.jarId===jar.id&&allocating?.kidId===kid.id;
              return (
                <Card key={jar.id} style={{border:`1.5px solid ${isFull?C.green:C.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                    <div style={{fontSize:44}}>{jar.item?.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:800,fontSize:16}}>{jar.item?.name}</div>
                      <div style={{fontSize:12,color:C.sub}}>{jar.item?.desc}</div>
                      <div style={{fontSize:12,color:C.orange,marginTop:2}}>
                        {jar.item?.priceDisplay} · needs {jar.item?.orangeRequired} orange
                      </div>
                    </div>
                    {isFull&&!jar.unlockedAt&&(
                      <div style={{fontSize:11,background:`${C.green}22`,border:`1.5px solid ${C.green}`,
                        borderRadius:10,padding:"4px 10px",color:C.green,fontWeight:700}}>READY 🔓</div>
                    )}
                  </div>
                  <div style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.sub,marginBottom:4}}>
                      <span>{pct}% total</span>
                      <span>{total} / {jar.item?.orangeRequired}</span>
                    </div>
                    <div style={{background:"#1E293B",borderRadius:20,height:14,overflow:"hidden",position:"relative"}}>
                      <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${confPct}%`,borderRadius:20,
                        background:isFull?"linear-gradient(90deg,#FFD700,#10B981)":"linear-gradient(90deg,#F97316,#FDBA74)",
                        transition:"width 0.5s ease"}}/>
                      {(jar.orangePending||0)>0&&(
                        <div style={{position:"absolute",left:`${confPct}%`,top:0,height:"100%",
                          width:`${Math.min(pct-confPct,100-confPct)}%`,
                          background:"rgba(249,115,22,0.35)",borderLeft:"2px dashed rgba(249,115,22,0.6)"}}/>
                      )}
                    </div>
                    <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                      {(jar.orangeConfirmed||0)>0&&<span style={{fontSize:11,background:`${C.orange}18`,color:C.orange,borderRadius:10,padding:"2px 8px",fontWeight:700}}>🟠 {jar.orangeConfirmed} confirmed</span>}
                      {(jar.orangePending||0)>0&&<span style={{fontSize:11,background:"rgba(249,115,22,0.1)",color:"#FDBA74",borderRadius:10,padding:"2px 8px",fontWeight:700,border:"1px dashed rgba(249,115,22,0.4)"}}>⏳ {jar.orangePending} pending</span>}
                    </div>
                  </div>
                  {jar.unlockedAt?(
                    <div style={{background:`${C.green}12`,border:`1px solid ${C.green}44`,borderRadius:10,padding:"10px 14px",fontSize:13,color:C.green}}>
                      ✅ Unlocked — Amazon link sent.
                    </div>
                  ):isFull?(
                    <a href={jar.item?.amazonUrl} target="_blank" rel="noopener noreferrer"
                      style={{display:"block",textAlign:"center",background:`linear-gradient(135deg,${C.green},#059669)`,
                        color:"white",borderRadius:10,padding:"11px 0",fontSize:14,fontWeight:800,textDecoration:"none"}}>
                      🛒 Buy on Amazon →
                    </a>
                  ):(
                    isAllocatingThis?(
                      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                        <div style={{fontSize:13,color:C.sub}}>Add orange:</div>
                        <input type="number" value={allocAmount} onChange={e=>setAllocAmount(e.target.value)}
                          placeholder="amount" style={{width:80,background:C.bg,border:`1.5px solid ${C.orange}`,
                            borderRadius:8,padding:"7px 10px",fontSize:14,color:C.orange,
                            fontFamily:"Nunito,sans-serif",outline:"none",textAlign:"center"}}/>
                        <Btn onClick={()=>confirmAllocate(kid.id,jar.id,allocAmount)} color={C.orange} small
                          disabled={!allocAmount||Number(allocAmount)<=0||Number(allocAmount)>kid.orangeBalance}>
                          Confirm 🟠
                        </Btn>
                        <Btn onClick={()=>{setAllocating(null);setAllocAmount("");}} color={C.sub} small outline>Cancel</Btn>
                      </div>
                    ):(
                      <Btn onClick={()=>{setAllocating({jarId:jar.id,kidId:kid.id});setAllocAmount("");}}
                        color={C.orange} small disabled={kid.orangeBalance<=0}>
                        + Allocate 🟠 Orange
                      </Btn>
                    )
                  )}
                </Card>
              );
            })
          )}
        </>
      )}
    </div>
  );
}

function ChoresTab({kids,setKids,chores,setChores,showToast,onAddChore,onApproveChore,onRejectChore}) {
  const [selected,setSelected] = useState("all");
  const [showAdd,setShowAdd]   = useState(false);
  const [showAddKid,setShowAddKid] = useState(false);
  const [newChore,setNewChore] = useState({name:"",emoji:"🧹",orange:10,kidId:""});
  const [newKid,setNewKid]     = useState({name:"",avatar:"🦊",grade:""});
  const [addingKid,setAddingKid] = useState(false);

  const visible   = chores.filter(c=>selected==="all"||c.kidId===selected);
  const kidName   = id => kids.find(k=>k.id===id)?.name??"?";
  const kidAvatar = id => kids.find(k=>k.id===id)?.avatar??"👤";
  const doneCount = visible.filter(c=>c.status==="done").length;

  const approve = async (chore) => {
    if (onApproveChore) {
      try { await onApproveChore(chore); }
      catch(e){ showToast("❌ Error approving"); return; }
    } else {
      setChores(prev=>prev.map(c=>c.id===chore.id?{...c,status:"approved"}:c));
      setKids(prev=>prev.map(k=>k.id===chore.kidId?{...k,orangeBalance:k.orangeBalance+chore.orange}:k));
    }
    showToast(`🟠 +${chore.orange} orange → ${kidName(chore.kidId)}!`);
  };

  const reject = async (choreId) => {
    if (onRejectChore) {
      try { await onRejectChore(choreId); }
      catch(e){ showToast("❌ Error rejecting"); return; }
    } else {
      setChores(prev=>prev.map(c=>c.id===choreId?{...c,status:"rejected"}:c));
    }
    showToast("❌ Chore sent back");
  };

  const addChore = async () => {
    if (!newChore.name||!newChore.kidId) {
      showToast("⚠️ Enter a name and select a kid");
      return;
    }
    try {
      if (onAddChore) {
        await onAddChore({
          kidId:  newChore.kidId,
          name:   newChore.name,
          emoji:  newChore.emoji,
          orange: Number(newChore.orange),
        });
      } else {
        setChores(prev=>[...prev,{
          ...newChore, id:Date.now(), status:"pending", orange:Number(newChore.orange)
        }]);
      }
      setNewChore({name:"",emoji:"🧹",orange:10,kidId:""});
      setShowAdd(false);
      showToast("✅ Chore added!");
    } catch(err) {
      showToast("❌ Failed to add chore");
      console.error(err);
    }
  };

  const addKid = async () => {
    if (!newKid.name.trim()) { showToast("⚠️ Enter a name"); return; }
    setAddingKid(true);
    try {
      if (window.onAddKidProp) {
        await window.onAddKidProp(newKid);
      } else {
        setKids(prev=>[...prev,{...newKid,id:Date.now(),greenBalance:0,orangeBalance:0,jars:[]}]);
      }
      setNewKid({name:"",avatar:"🦊",grade:""});
      setShowAddKid(false);
      showToast("✅ Kid added!");
    } catch(err) {
      showToast("❌ Failed to add kid");
      console.error(err);
    }
    setAddingKid(false);
  };

  const AVATARS = ["🦊","🐼","🦋","🐸","🦄","🐯","🦁","🐨","🦝","🐺","🐻","🦙"];

  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:13,color:C.sub}}>
          {doneCount>0
            ?`${doneCount} chore${doneCount>1?"s":""} waiting — approve to release 🟠 orange`
            :"No chores waiting for approval"}
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>{setShowAddKid(v=>!v);setShowAdd(false);}} small outline color={C.accent}>
            {showAddKid?"✕ Cancel":"👤 Add Kid"}
          </Btn>
          <Btn onClick={()=>{setShowAdd(v=>!v);setShowAddKid(false);}} small>
            {showAdd?"✕ Cancel":"➕ Add Chore"}
          </Btn>
        </div>
      </div>

      {/* Add Kid form */}
      {showAddKid&&(
        <Card style={{border:`1.5px solid ${C.accent}55`}}>
          <div style={{fontSize:15,fontWeight:800,marginBottom:14}}>👤 Add a Kid</div>
          <div style={{marginBottom:12}}>
            <Lbl>Name</Lbl>
            <Field value={newKid.name} onChange={v=>setNewKid(p=>({...p,name:v}))}
              placeholder="e.g. Alex"/>
          </div>
          <div style={{marginBottom:12}}>
            <Lbl>Grade (optional)</Lbl>
            <Field value={newKid.grade} onChange={v=>setNewKid(p=>({...p,grade:v}))}
              placeholder="e.g. 4th"/>
          </div>
          <div style={{marginBottom:16}}>
            <Lbl>Avatar</Lbl>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {AVATARS.map(a=>(
                <button type="button" key={a} onClick={()=>setNewKid(p=>({...p,avatar:a}))} style={{
                  fontSize:28,background:newKid.avatar===a?`${C.accent}22`:"transparent",
                  border:`2px solid ${newKid.avatar===a?C.accent:C.border}`,
                  borderRadius:10,padding:"6px 10px",cursor:"pointer"}}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <Btn onClick={addKid} color={C.accent} disabled={addingKid}>
            {addingKid?"Adding...":"✅ Add Kid"}
          </Btn>
        </Card>
      )}

      {/* Add Chore form */}
      {showAdd&&(
        <Card>
          <div style={{fontSize:15,fontWeight:800,marginBottom:14}}>➕ New Chore</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
            {CHORE_PRESETS.map((p,i)=>(
              <button type="button" key={i}
                onClick={()=>setNewChore(prev=>({...prev,name:p.name,emoji:p.emoji,orange:p.orange}))}
                style={{background:newChore.name===p.name?`${C.orange}18`:"transparent",
                  border:`1.5px solid ${newChore.name===p.name?C.orange:C.border}`,
                  color:newChore.name===p.name?C.orange:C.sub,
                  borderRadius:20,padding:"5px 12px",fontSize:12,
                  cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"56px 1fr 100px",gap:10,marginBottom:12}}>
            <Field value={newChore.emoji} onChange={v=>setNewChore(p=>({...p,emoji:v}))}
              placeholder="🧹" style={{fontSize:20,textAlign:"center",padding:"8px 4px"}}/>
            <Field value={newChore.name} onChange={v=>setNewChore(p=>({...p,name:v}))}
              placeholder="e.g. Clean your room"/>
            <Field value={newChore.orange} onChange={v=>setNewChore(p=>({...p,orange:v}))}
              placeholder="10" type="number"/>
          </div>
          <div style={{marginBottom:16}}>
            <Lbl>Assign To</Lbl>
            {kids.length===0?(
              <div style={{fontSize:13,color:C.sub}}>Add a kid first using the "Add Kid" button above.</div>
            ):(
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {kids.map(k=>(
                  <button type="button" key={k.id} onClick={()=>setNewChore(p=>({...p,kidId:k.id}))} style={{
                    background:newChore.kidId===k.id?C.orange:"transparent",
                    border:`2px solid ${newChore.kidId===k.id?C.orange:C.border}`,
                    color:newChore.kidId===k.id?"white":C.sub,
                    borderRadius:30,padding:"8px 16px",fontSize:13,fontWeight:700,
                    cursor:"pointer",fontFamily:"Nunito,sans-serif",
                    display:"flex",alignItems:"center",gap:6}}>
                    {k.avatar} {k.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Btn onClick={addChore} color={C.orange} disabled={!newChore.name||!newChore.kidId}>
            ✅ Create Chore
          </Btn>
        </Card>
      )}

      {/* Kid filter */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        <button type="button" onClick={()=>setSelected("all")} style={{
          background:selected==="all"?C.accent:"transparent",
          border:`2px solid ${selected==="all"?C.accent:C.border}`,
          color:selected==="all"?"white":C.sub,
          borderRadius:30,padding:"7px 16px",fontSize:13,fontWeight:700,
          cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>All Kids</button>
        {kids.map(k=>(
          <button type="button" key={k.id} onClick={()=>setSelected(k.id)} style={{
            background:selected===k.id?C.accent:"transparent",
            border:`2px solid ${selected===k.id?C.accent:C.border}`,
            color:selected===k.id?"white":C.sub,
            borderRadius:30,padding:"7px 16px",fontSize:13,fontWeight:700,
            cursor:"pointer",fontFamily:"Nunito,sans-serif",
            display:"flex",alignItems:"center",gap:6}}>
            {k.avatar} {k.name}
          </button>
        ))}
      </div>

      {visible.length===0&&(
        <div style={{textAlign:"center",color:C.sub,padding:"40px 0",fontSize:14}}>
          No chores yet — add some above!
        </div>
      )}

      {visible.map(chore=>{
        const isDone=chore.status==="done";
        const statusColor=chore.status==="approved"?C.green:chore.status==="rejected"?C.red:isDone?C.gold:C.sub;
        return (
          <div key={chore.id} style={{background:C.panel,
            border:`1px solid ${isDone?C.gold+"66":C.border}`,
            borderRadius:14,padding:"14px 18px",marginBottom:10,
            display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",
            opacity:chore.status==="rejected"?0.45:1,animation:"slide 0.25s ease"}}>
            <div style={{fontSize:28}}>{chore.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:15}}>{chore.name}</div>
              <div style={{fontSize:12,color:C.sub,display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                <span>{kidAvatar(chore.kidId)}</span>
                <span>{kidName(chore.kidId)}</span>
                <span style={{color:statusColor,fontWeight:700,marginLeft:4}}>
                  {chore.status==="done"?"✋ Waiting"
                    :chore.status==="approved"?"✅ Approved"
                    :chore.status==="rejected"?"❌ Sent back"
                    :"📋 Assigned"}
                </span>
              </div>
            </div>
            <Pill color={C.orange} bg={`${C.orange}18`}>🟠 {chore.orange}</Pill>
            {isDone&&(
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>approve(chore)} color={C.green} small>✅ Approve</Btn>
                <Btn onClick={()=>reject(chore.id)} color={C.red} small outline>✕</Btn>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AwardTab({kids,setKids,showToast,onAwardOrange}) {
  const [selectedKid,setSelectedKid] = useState(null);
  const [amount,setAmount]           = useState(25);
  const [reason,setReason]           = useState("");
  const [justAwarded,setJustAwarded] = useState(null);

  const award = async () => {
    if (!selectedKid) return;
    const amt = Number(amount);
    if (!amt||amt<=0) return;
    const kid = kids.find(k=>k.id===selectedKid);
    try {
      if (onAwardOrange) {
        await onAwardOrange(selectedKid, amt, reason);
      } else {
        setKids(prev=>prev.map(k=>k.id===selectedKid?{...k,orangeBalance:k.orangeBalance+amt}:k));
      }
      setJustAwarded({name:kid.name,avatar:kid.avatar,amount:amt,reason});
      showToast(`🟠 +${amt} orange → ${kid.name}!`);
      setReason("");
      setTimeout(()=>setJustAwarded(null),3000);
    } catch(err) {
      showToast("❌ Failed to award orange");
      console.error(err);
    }
  };

  const quickAwards = [
    {label:"Did all chores",emoji:"🧹",amt:20},
    {label:"Great attitude",emoji:"😊",amt:25},
    {label:"Helped a sibling",emoji:"🤝",amt:30},
    {label:"Read without being asked",emoji:"📚",amt:35},
    {label:"Perfect week",emoji:"🌟",amt:75},
    {label:"Being extra kind",emoji:"💛",amt:20},
  ];

  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{fontSize:13,color:C.sub,marginBottom:20}}>
        Award 🟠 orange for effort, kindness, or anything worth celebrating.
      </div>
      {justAwarded&&(
        <div style={{background:"linear-gradient(135deg,#431407,#7C2D12)",
          border:`2px solid ${C.orange}`,borderRadius:16,padding:"18px 24px",marginBottom:20,
          display:"flex",alignItems:"center",gap:16,animation:"pop 0.5s ease"}}>
          <div style={{fontSize:48}}>{justAwarded.avatar}</div>
          <div>
            <div style={{fontFamily:"Fredoka One,cursive",fontSize:24,color:C.orangeL}}>
              +{justAwarded.amount} orange to {justAwarded.name}!
            </div>
            {justAwarded.reason&&<div style={{fontSize:13,color:C.orangeL,opacity:0.8,fontStyle:"italic"}}>"{justAwarded.reason}"</div>}
          </div>
        </div>
      )}
      <Card>
        <div style={{fontSize:16,fontWeight:800,marginBottom:16}}>🟠 Award Orange Bucks</div>
        <Lbl>Who</Lbl>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
          {kids.map(k=>(
            <button type="button" key={k.id} onClick={()=>setSelectedKid(k.id)} style={{
              background:selectedKid===k.id?C.orange:"transparent",
              border:`2px solid ${selectedKid===k.id?C.orange:C.border}`,
              color:selectedKid===k.id?"white":C.sub,
              borderRadius:30,padding:"8px 16px",fontSize:14,fontWeight:700,
              cursor:"pointer",fontFamily:"Nunito,sans-serif",
              display:"flex",alignItems:"center",gap:6}}>
              {k.avatar} {k.name}
            </button>
          ))}
        </div>
        <Lbl>Amount</Lbl>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
          {[10,25,50,100].map(n=>(
            <button type="button" key={n} onClick={()=>setAmount(n)} style={{
              background:amount===n?C.orange:"transparent",
              border:`2px solid ${amount===n?C.orange:C.border}`,
              color:amount===n?"white":C.sub,
              borderRadius:30,padding:"8px 20px",fontSize:16,fontWeight:800,
              cursor:"pointer",fontFamily:"Fredoka One,cursive"}}>+{n}</button>
          ))}
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)}
            style={{width:80,background:C.bg,border:`1.5px solid ${C.border}`,
              borderRadius:8,padding:"8px 12px",fontSize:14,color:C.text,
              fontFamily:"Nunito,sans-serif",outline:"none",textAlign:"center"}}/>
        </div>
        <Lbl>Reason (optional)</Lbl>
        <div style={{marginBottom:20}}>
          <Field value={reason} onChange={setReason} placeholder="e.g. Amazing effort on the science project!"/>
        </div>
        <Btn onClick={award} color={C.orange} disabled={!selectedKid}>
          🟠 Award Orange Bucks
        </Btn>
      </Card>
      <Card>
        <div style={{fontSize:15,fontWeight:800,marginBottom:12}}>⚡ Quick Awards</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
          {quickAwards.map(q=>(
            <button type="button" key={q.label}
              onClick={()=>{setAmount(q.amt);setReason(q.label);}}
              style={{background:C.panel2,border:`1.5px solid ${C.border}`,
                borderRadius:12,padding:"12px",cursor:"pointer",
                fontFamily:"Nunito,sans-serif",textAlign:"left"}}>
              <div style={{fontSize:26,marginBottom:4}}>{q.emoji}</div>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2}}>{q.label}</div>
              <div style={{fontSize:12,color:C.orange}}>+{q.amt} orange</div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function RewardsTab({rewards,setRewards,showToast,onAddReward,onUpdateReward,onDeleteReward}) {
  const [editing,setEditing] = useState(null);
  const [showAdd,setShowAdd] = useState(false);
  const [newR,setNewR]       = useState({emoji:"🎁",label:"",orange:50});

  const addReward = async () => {
    if (!newR.label.trim()) return;
    try {
      if (onAddReward) { await onAddReward({emoji:newR.emoji,label:newR.label,orange:Number(newR.orange)}); }
      else { setRewards(prev=>[...prev,{...newR,id:`hr_${Date.now()}`,orange:Number(newR.orange)}]); }
      setNewR({emoji:"🎁",label:"",orange:50});
      setShowAdd(false);
      showToast("✅ Reward added!");
    } catch(err){ showToast("❌ Failed"); console.error(err); }
  };

  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{fontSize:13,color:C.sub,marginBottom:16}}>
        Kids spend 🟠 orange directly on these — no jar needed.
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
        <Btn onClick={()=>setShowAdd(v=>!v)} small>{showAdd?"✕ Cancel":"➕ Add Reward"}</Btn>
      </div>
      {showAdd&&(
        <Card>
          <div style={{fontSize:15,fontWeight:800,marginBottom:12}}>➕ New Reward</div>
          <div style={{display:"grid",gridTemplateColumns:"56px 1fr 110px",gap:10,marginBottom:12}}>
            <Field value={newR.emoji} onChange={v=>setNewR(p=>({...p,emoji:v}))}
              placeholder="🎁" style={{fontSize:20,textAlign:"center",padding:"8px 4px"}}/>
            <Field value={newR.label} onChange={v=>setNewR(p=>({...p,label:v}))}
              placeholder="e.g. Stay up an hour late"/>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:12,color:C.orange}}>🟠</span>
              <Field value={newR.orange} onChange={v=>setNewR(p=>({...p,orange:v}))} type="number"/>
            </div>
          </div>
          <Btn onClick={addReward} color={C.orange}>✅ Add Reward</Btn>
        </Card>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14}}>
        {rewards.map(r=>(
          <div key={r.id} style={{background:C.panel,border:`1px solid ${C.border}`,
            borderRadius:16,padding:"18px 16px",textAlign:"center",animation:"pop 0.3s ease"}}>
            <div style={{fontSize:44,marginBottom:8}}>{r.emoji}</div>
            <div style={{fontWeight:800,fontSize:14,marginBottom:10,lineHeight:1.3}}>{r.label}</div>
            <Pill color={C.orange} bg={`${C.orange}18`}>🟠 {r.orange}</Pill>
            <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:14}}>
              <Btn onClick={()=>{
                if(onDeleteReward){onDeleteReward(r.id).then(()=>showToast("🗑️ Removed")).catch(()=>{})}
                else{setRewards(prev=>prev.filter(x=>x.id!==r.id));showToast("🗑️ Removed");}
              }} color={C.red} small outline>🗑️</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FundGreenTab({kids}) {
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{fontSize:13,color:C.sub,marginBottom:20}}>
        🟢 Green is real money. Kids spend it on instant digital codes — Robux, iTunes, V-Bucks.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14,marginBottom:20}}>
        {kids.map(k=>(
          <Card key={k.id} style={{marginBottom:0,textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:8}}>{k.avatar}</div>
            <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>{k.name}</div>
            <div style={{fontFamily:"Fredoka One,cursive",fontSize:30,color:C.green}}>
              ${(k.greenBalance/100).toFixed(2)}
            </div>
            <div style={{fontSize:11,color:C.sub,marginTop:2}}>current balance</div>
          </Card>
        ))}
      </div>
      <Card style={{border:`1.5px dashed ${C.green}66`,background:`${C.green}08`}}>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          <div style={{fontSize:48}}>💳</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:16,color:C.green,marginBottom:4}}>Stripe — Coming Soon</div>
            <div style={{fontSize:13,color:C.sub,lineHeight:1.6}}>
              Set up weekly or monthly auto-deposits. $1 = 100 green in the digital store.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function ParentConsole({
  profile, initialKids, initialChores, initialProposals, initialRewards,
  onAddKid, onAddChore, onApproveChore, onRejectChore,
  onAwardOrange, onApproveProposal, onDeclineProposal,
  onAddReward, onUpdateReward, onDeleteReward,
}) {
  const [tab,setTab]             = useState("overview");
  const [kids,setKids]           = useState(initialKids      || SEED_KIDS);
  const [chores,setChores]       = useState(initialChores    || SEED_CHORES);
  const [rewards,setRewards]     = useState(initialRewards   || DEFAULT_HOME_REWARDS);
  const [proposals,setProposals] = useState(initialProposals || SEED_PROPOSALS);
  const [toast,setToast]         = useState(null);

  useEffect(()=>{
    if (initialKids      && initialKids.length      >= 0) setKids(initialKids);
    if (initialChores    && initialChores.length    >= 0) setChores(initialChores);
    if (initialRewards   && initialRewards.length   >= 0) setRewards(initialRewards);
    if (initialProposals && initialProposals.length >= 0) setProposals(initialProposals);
  },[initialKids,initialChores,initialRewards,initialProposals]);

  // Make onAddKid available to ChoresTab via window (avoids deep prop drilling)
  useEffect(()=>{ window.onAddKidProp = onAddKid; },[onAddKid]);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null),2600); };

  const pendingChores    = chores.filter(c=>c.status==="done").length;
  const pendingProposals = proposals.filter(p=>p.status==="pending").length;
  const totalPending     = pendingChores + pendingProposals;

  const TABS = [
    {id:"overview", label:"Overview",     emoji:"🏠"},
    {id:"jars",     label:"Wishlist Jars",emoji:"⭐", badge:pendingProposals||null},
    {id:"chores",   label:"Chores",       emoji:"✅", badge:pendingChores||null},
    {id:"rewards",  label:"Home Rewards", emoji:"🎉"},
    {id:"award",    label:"Award Orange", emoji:"🟠"},
    {id:"green",    label:"Fund Green",   emoji:"🟢"},
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,
      fontFamily:"Nunito,sans-serif",paddingBottom:60}}>
      <style>{fontCSS}</style>
      <div style={{background:`linear-gradient(135deg,${C.panel},${C.bg})`,
        borderBottom:`2px solid ${C.border}`,padding:"16px 24px",
        display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:"Fredoka One,cursive",fontSize:26,
            background:`linear-gradient(135deg,${C.green},${C.orange})`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            🏠 Parent Console
          </div>
          <div style={{fontSize:12,color:C.sub}}>Digital Prize Box — Family Dashboard</div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <div style={{background:C.panel,border:`1px solid ${C.green}44`,
            borderRadius:10,padding:"8px 16px",textAlign:"center"}}>
            <div style={{fontSize:10,color:C.sub}}>🟢 Total</div>
            <div style={{fontFamily:"Fredoka One,cursive",fontSize:20,color:C.green}}>
              ${(kids.reduce((a,k)=>a+(k.greenBalance||0),0)/100).toFixed(2)}
            </div>
          </div>
          {totalPending>0&&(
            <div style={{background:C.panel,border:`1px solid ${C.gold}66`,
              borderRadius:10,padding:"8px 16px",textAlign:"center"}}>
              <div style={{fontSize:10,color:C.sub}}>⏳ Waiting</div>
              <div style={{fontFamily:"Fredoka One,cursive",fontSize:20,color:C.gold}}>{totalPending}</div>
            </div>
          )}
        </div>
      </div>
      <div style={{padding:"14px 24px",display:"flex",gap:8,flexWrap:"wrap",
        borderBottom:`1px solid ${C.border}`}}>
        {TABS.map(t=>(
          <button type="button" key={t.id} onClick={()=>setTab(t.id)} style={{
            background:tab===t.id?C.accent:"transparent",
            border:`2px solid ${tab===t.id?C.accent:C.border}`,
            color:tab===t.id?"white":C.sub,
            borderRadius:10,padding:"8px 16px",fontSize:13,fontWeight:700,
            cursor:"pointer",fontFamily:"Nunito,sans-serif",transition:"all 0.2s",
            position:"relative"}}>
            {t.emoji} {t.label}
            {t.badge&&(
              <span style={{position:"absolute",top:-6,right:-6,background:C.gold,
                color:"white",borderRadius:"50%",width:18,height:18,fontSize:10,
                fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"Nunito,sans-serif"}}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>
      <div style={{maxWidth:900,margin:"0 auto",padding:"24px 20px"}}>
        {tab==="overview"&&<OverviewTab kids={kids}/>}
        {tab==="jars"    &&<JarsTab kids={kids} setKids={setKids}
          proposals={proposals} setProposals={setProposals} showToast={showToast}
          onApproveProposal={onApproveProposal} onDeclineProposal={onDeclineProposal}/>}
        {tab==="chores"  &&<ChoresTab kids={kids} setKids={setKids}
          chores={chores} setChores={setChores} showToast={showToast}
          onAddChore={onAddChore} onApproveChore={onApproveChore} onRejectChore={onRejectChore}/>}
        {tab==="rewards" &&<RewardsTab rewards={rewards} setRewards={setRewards} showToast={showToast}
          onAddReward={onAddReward} onUpdateReward={onUpdateReward} onDeleteReward={onDeleteReward}/>}
        {tab==="award"   &&<AwardTab kids={kids} setKids={setKids} showToast={showToast} onAwardOrange={onAwardOrange}/>}
        {tab==="green"   &&<FundGreenTab kids={kids}/>}
      </div>
      <Toast msg={toast}/>
    </div>
  );
}

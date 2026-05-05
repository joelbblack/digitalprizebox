// ─── src/dashboards/ParentDashboard.jsx ──────────────────────────────────────
// Complete rewrite of prizebox_parent_v3.jsx
// Fixed:
//  ✅ No seed data anywhere
//  ✅ No window.onAddKidProp hack — proper prop drilling
//  ✅ All actions write to Supabase via useParentData
//  ✅ DEFAULT_HOME_REWARDS only shown when DB returns nothing
//  ✅ Saturday Morning Cartoon design throughout
//  ✅ Family circle tab added
//  ✅ chores_completed incremented on approve
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { fontCSS, T }          from "../lib/theme";
import {
  Fox, Bear, StarField, Toast, Confetti,
  ANIMALS, getAnimal, unlockedAnimals,
} from "../lib/animals";
import { benday } from "../lib/theme";
import { supabase } from "../lib/auth";

// ── Shared primitives ─────────────────────────────────────────────────────────
const Lbl = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 800, color: T.sub,
    textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
    {children}
  </div>
);

const Field = ({ value, onChange, placeholder, type = "text", style = {} }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: "100%", background: T.sky,
      border: `3px solid ${T.borderBold}`,
      borderRadius: 12, padding: "9px 12px",
      fontSize: 14, color: T.text,
      fontFamily: "'Nunito', sans-serif",
      outline: "none", boxSizing: "border-box",
      boxShadow: "3px 3px 0 #000000", ...style,
    }}/>
);

const Btn = ({ onClick, children, color = T.purple, small = false,
  outline = false, disabled = false, full = false }) => (
  <button type="button" onClick={onClick} disabled={disabled} style={{
    background: disabled ? "transparent" : outline ? "transparent" : color,
    border: `3px solid ${disabled ? T.border : color}`,
    color: disabled ? T.sub : outline ? color : "white",
    borderRadius: 50, padding: small ? "6px 16px" : "10px 22px",
    fontSize: small ? 12 : 14, fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Nunito', sans-serif",
    boxShadow: disabled ? "none" : `3px 3px 0 #000000`,
    opacity: disabled ? 0.5 : 1,
    width: full ? "100%" : undefined,
    whiteSpace: "nowrap",
  }}>{children}</button>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.panel2, borderRadius: 20,
    padding: "20px", border: `3px solid ${T.borderBold}`,
    boxShadow: "4px 4px 0 #000000",
    marginBottom: 16, animation: "fadeIn 0.3s ease", ...style,
  }}>{children}</div>
);

const Pill = ({ color, children }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    background: `${color}22`, border: `2px solid ${color}`,
    color, borderRadius: 20, padding: "3px 12px",
    fontFamily: "'Fredoka One', cursive", fontSize: 14,
  }}>{children}</span>
);

// ── CHORE PRESETS ─────────────────────────────────────────────────────────────
const CHORE_PRESETS = [
  { emoji: "🛏️", name: "Make your bed",       orange: 10 },
  { emoji: "🍽️", name: "Unload dishwasher",   orange: 15 },
  { emoji: "🧹", name: "Sweep the floor",     orange: 20 },
  { emoji: "🐶", name: "Feed the pet",        orange: 10 },
  { emoji: "🗑️", name: "Take out trash",      orange: 20 },
  { emoji: "📖", name: "Read for 20 minutes", orange: 25 },
  { emoji: "🧺", name: "Put away laundry",    orange: 15 },
  { emoji: "🪴", name: "Water the plants",    orange: 10 },
  { emoji: "📞", name: "Call Grandma",        orange: 30 },
];

// Free animals available for avatar selection
const AVATAR_ANIMALS = ANIMALS.filter(a => a.free || a.choreThreshold <= 25);

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({ kids, profile }) {
  if (kids.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ marginBottom: 16 }}><Fox size={80} animate/></div>
      <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 26,
        color: T.text, marginBottom: 8 }}>
        Welcome to Digital Prize Box!
      </div>
      <div style={{ fontSize: 14, color: T.sub, lineHeight: 1.7,
        maxWidth: 380, margin: "0 auto 24px" }}>
        Get started by adding your first kid in the Chores tab,
        then create some chores for them to complete.
      </div>
    </div>
  );

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
        gap: 16,
      }}>
        {kids.map(kid => {
          const animal = getAnimal(kid.animal_id || "fox");
          return (
            <Card key={kid.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <animal.Component size={52}/>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: T.text }}>{kid.name}</div>
                  <div style={{ fontSize: 12, color: T.sub }}>
                    {kid.grade ? `${kid.grade} grade · ` : ""}
                    ✅ {kid.chores_completed || 0} chores
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: `${T.green}18`, border: `2px solid ${T.green}`,
                  borderRadius: 12, padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: T.greenL, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>🟢 Green</div>
                  <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: T.greenL }}>
                    ${((kid.greenBalance || 0) / 100).toFixed(2)}
                  </div>
                </div>
                <div style={{ background: `${T.orange}18`, border: `2px solid ${T.orange}`,
                  borderRadius: 12, padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: T.orangeL, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>🟠 Orange</div>
                  <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: T.orangeL }}>
                    {kid.orangeBalance || 0}
                  </div>
                </div>
              </div>
              {kid.jars?.length > 0 && (
                <div style={{ fontSize: 12, color: T.sub, marginTop: 10 }}>
                  ⭐ {kid.jars.length} wishlist jar{kid.jars.length > 1 ? "s" : ""} active
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Chores tab ────────────────────────────────────────────────────────────────
function ChoresTab({ kids, chores, showToast, onAddKid, onAddChore, onApproveChore, onRejectChore }) {
  const [selected,    setSelected]    = useState("all");
  const [showAdd,     setShowAdd]     = useState(false);
  const [showAddKid,  setShowAddKid]  = useState(false);
  const [newChore,    setNewChore]    = useState({ name: "", emoji: "🧹", orange: 10, kidId: "" });
  const [newKid,      setNewKid]      = useState({ name: "", animal_id: "fox", grade: "", pin: "", joinCode: "" });
  const [addingKid,   setAddingKid]   = useState(false);

  const visible   = chores.filter(c => selected === "all" || c.kidId === selected);
  const doneCount = visible.filter(c => c.status === "done").length;
  const kidName   = id => kids.find(k => k.id === id)?.name ?? "?";
  const kidAnimal = id => {
    const k = kids.find(k => k.id === id);
    const a = getAnimal(k?.animal_id || "fox");
    return <a.Component size={24}/>;
  };

  const approve = async (chore) => {
    try { await onApproveChore(chore); showToast(`🟠 +${chore.orange} → ${kidName(chore.kidId)}!`); }
    catch { showToast("❌ Error approving"); }
  };

  const reject = async (choreId) => {
    try { await onRejectChore(choreId); showToast("❌ Chore sent back"); }
    catch { showToast("❌ Error rejecting"); }
  };

  const addChore = async () => {
    if (!newChore.name || !newChore.kidId) { showToast("⚠️ Name and kid required"); return; }
    try {
      await onAddChore({ kidId: newChore.kidId, name: newChore.name,
        emoji: newChore.emoji, orange: Number(newChore.orange) });
      setNewChore({ name: "", emoji: "🧹", orange: 10, kidId: "" });
      setShowAdd(false);
      showToast("✅ Chore added!");
    } catch { showToast("❌ Failed to add chore"); }
  };

  const addKid = async () => {
    if (!newKid.name.trim()) { showToast("⚠️ Enter a name"); return; }
    setAddingKid(true);
    try {
      await onAddKid({ ...newKid, avatar: "🐾" });
      setNewKid({ name: "", animal_id: "fox", grade: "", pin: "", joinCode: "" });
      setShowAddKid(false);
      showToast("✅ Kid added!");
    } catch (err) { showToast(`❌ ${err.message || "Failed to add kid"}`); }
    setAddingKid(false);
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 13, color: T.sub }}>
          {doneCount > 0
            ? `${doneCount} chore${doneCount > 1 ? "s" : ""} waiting — approve to release 🟠 orange`
            : "No chores waiting for approval"}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={() => { setShowAddKid(v => !v); setShowAdd(false); }}
            small outline color={T.purple}>
            {showAddKid ? "✕ Cancel" : "👤 Add Kid"}
          </Btn>
          <Btn onClick={() => { setShowAdd(v => !v); setShowAddKid(false); }} small>
            {showAdd ? "✕ Cancel" : "➕ Add Chore"}
          </Btn>
        </div>
      </div>

      {/* Add Kid */}
      {showAddKid && (
        <Card style={{ border: `3px solid ${T.purple}` }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 14 }}>
            👤 Add a Kid
          </div>
          <div style={{ marginBottom: 10 }}>
            <Lbl>Name</Lbl>
            <Field value={newKid.name} onChange={v => setNewKid(p => ({ ...p, name: v }))} placeholder="e.g. Alex"/>
          </div>
          <div style={{ marginBottom: 10 }}>
            <Lbl>Grade (optional)</Lbl>
            <Field value={newKid.grade} onChange={v => setNewKid(p => ({ ...p, grade: v }))} placeholder="e.g. 4th"/>
          </div>
          <div style={{ marginBottom: 10 }}>
            <Lbl>4-Digit PIN (for kid login)</Lbl>
            <Field value={newKid.pin} onChange={v => setNewKid(p => ({ ...p, pin: v.replace(/\D/g,"").slice(0,4) }))}
              placeholder="1234" style={{ letterSpacing: 4, fontWeight: 800 }}/>
          </div>
          <div style={{ marginBottom: 10 }}>
            <Lbl>Teacher Join Code (optional)</Lbl>
            <Field value={newKid.joinCode}
              onChange={v => setNewKid(p => ({ ...p, joinCode: v.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6) }))}
              placeholder="e.g. ABC123"
              style={{ letterSpacing: 3, fontWeight: 800, textTransform: "uppercase" }}/>
            <div style={{ fontSize: 11, color: T.sub, marginTop: 4 }}>
              Got a code from your kid's teacher? Enter it to link them to the classroom.
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Lbl>Choose an Animal</Lbl>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {AVATAR_ANIMALS.map(a => (
                <button type="button" key={a.id} onClick={() => setNewKid(p => ({ ...p, animal_id: a.id }))} style={{
                  background: newKid.animal_id === a.id ? `${a.color}22` : "#FFFFFF",
                  border: `3px solid ${newKid.animal_id === a.id ? a.color : T.border}`,
                  borderRadius: 14, padding: "8px 12px", cursor: "pointer",
                  boxShadow: newKid.animal_id === a.id ? `3px 3px 0 ${a.color}` : "3px 3px 0 #000000",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}>
                  <a.Component size={36}/>
                  <div style={{ fontSize: 10, fontWeight: 700, color: newKid.animal_id === a.id ? a.color : T.sub }}>
                    {a.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <Btn onClick={addKid} color={T.purple} disabled={addingKid}>
            {addingKid ? "Adding..." : "✅ Add Kid"}
          </Btn>
        </Card>
      )}

      {/* Add Chore */}
      {showAdd && (
        <Card>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 14 }}>
            ➕ New Chore
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {CHORE_PRESETS.map((p, i) => (
              <button type="button" key={i}
                onClick={() => setNewChore(prev => ({ ...prev, name: p.name, emoji: p.emoji, orange: p.orange }))}
                style={{
                  background: newChore.name === p.name ? `${T.orange}22` : "transparent",
                  border: `2px solid ${newChore.name === p.name ? T.orange : T.border}`,
                  color: newChore.name === p.name ? T.orange : T.sub,
                  borderRadius: 20, padding: "5px 12px", fontSize: 12,
                  cursor: "pointer", fontFamily: "'Nunito', sans-serif",
                }}>
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 100px", gap: 10, marginBottom: 12 }}>
            <Field value={newChore.emoji} onChange={v => setNewChore(p => ({ ...p, emoji: v }))}
              placeholder="🧹" style={{ fontSize: 20, textAlign: "center", padding: "8px 4px" }}/>
            <Field value={newChore.name} onChange={v => setNewChore(p => ({ ...p, name: v }))}
              placeholder="e.g. Clean your room"/>
            <Field value={newChore.orange} onChange={v => setNewChore(p => ({ ...p, orange: v }))}
              placeholder="10" type="number"/>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Lbl>Assign To</Lbl>
            {kids.length === 0
              ? <div style={{ fontSize: 13, color: T.sub }}>Add a kid first.</div>
              : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {kids.map(k => (
                    <button type="button" key={k.id}
                      onClick={() => setNewChore(p => ({ ...p, kidId: k.id }))}
                      style={{
                        background: newChore.kidId === k.id ? T.orange : "transparent",
                        border: `3px solid ${newChore.kidId === k.id ? T.orange : T.border}`,
                        color: newChore.kidId === k.id ? "white" : T.sub,
                        borderRadius: 30, padding: "8px 16px", fontSize: 13,
                        fontWeight: 700, cursor: "pointer",
                        fontFamily: "'Nunito', sans-serif",
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                      {(() => { const a = getAnimal(k.animal_id || "fox"); return <a.Component size={18}/>; })()} {k.name}
                    </button>
                  ))}
                </div>
              )}
          </div>
          <Btn onClick={addChore} color={T.orange} disabled={!newChore.name || !newChore.kidId}>
            ✅ Create Chore
          </Btn>
        </Card>
      )}

      {/* Kid filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button type="button" onClick={() => setSelected("all")} style={{
          background: selected === "all" ? T.purple : "transparent",
          border: `3px solid ${selected === "all" ? T.purple : T.border}`,
          color: selected === "all" ? "white" : T.sub,
          borderRadius: 30, padding: "7px 16px", fontSize: 13,
          fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif",
        }}>All Kids</button>
        {kids.map(k => (
          <button type="button" key={k.id} onClick={() => setSelected(k.id)} style={{
            background: selected === k.id ? T.purple : "transparent",
            border: `3px solid ${selected === k.id ? T.purple : T.border}`,
            color: selected === k.id ? "white" : T.sub,
            borderRadius: 30, padding: "7px 16px", fontSize: 13,
            fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif",
            display: "flex", alignItems: "center", gap: 6,
          }}>{(() => { const a = getAnimal(k.animal_id || "fox"); return <a.Component size={18}/>; })()} {k.name}</button>
        ))}
      </div>

      {visible.length === 0 && (
        <div style={{ textAlign: "center", color: T.sub, padding: "40px 0", fontSize: 14 }}>
          No chores yet — add some above!
        </div>
      )}

      {visible.map(chore => {
        const isDone = chore.status === "done";
        return (
          <div key={chore.id} style={{
            background: T.panel2,
            border: `3px solid ${isDone ? T.gold + "88" : T.borderBold}`,
            borderRadius: 16, padding: "14px 18px", marginBottom: 10,
            display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
            opacity: chore.status === "rejected" ? 0.45 : 1,
            boxShadow: isDone ? `0 0 12px ${T.gold}44, 3px 3px 0 #000000` : "3px 3px 0 #000000",
            animation: "slideIn 0.25s ease",
          }}>
            <div style={{ fontSize: 28 }}>{chore.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{chore.name}</div>
              <div style={{ fontSize: 12, color: T.sub, display: "flex",
                alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{ display: "flex", alignItems: "center" }}>
                  {kidAnimal(chore.kidId)}
                </span>
                <span>{kidName(chore.kidId)}</span>
                <span style={{
                  color: chore.status === "approved" ? T.green
                    : chore.status === "rejected" ? T.red
                    : isDone ? T.gold : T.sub,
                  fontWeight: 700, marginLeft: 4,
                }}>
                  {chore.status === "done" ? "✋ Waiting"
                    : chore.status === "approved" ? "✅ Approved"
                    : chore.status === "rejected" ? "❌ Sent back"
                    : "📋 Assigned"}
                </span>
              </div>
            </div>
            <Pill color={T.orange}>🟠 {chore.orange}</Pill>
            {isDone && (
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={() => approve(chore)} color={T.green} small>✅ Approve</Btn>
                <Btn onClick={() => reject(chore.id)} color={T.red} small outline>✕</Btn>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Jars tab ──────────────────────────────────────────────────────────────────
function JarsTab({ kids, proposals, showToast, onApproveProposal, onDeclineProposal }) {
  const [selectedKid, setSelectedKid] = useState(null);
  const [editAmount,  setEditAmount]  = useState({});

  useEffect(() => {
    if (!selectedKid && kids.length > 0) setSelectedKid(kids[0].id);
  }, [kids]);

  const kid        = kids.find(k => k.id === selectedKid);
  const kidProposals = proposals.filter(p => p.kidId === selectedKid && p.status === "pending");
  const pendingAll   = proposals.filter(p => p.status === "pending").length;

  const approve = async (p, amt) => {
    try { await onApproveProposal(p, amt || p.proposed); showToast(`✅ ${amt || p.proposed} 🟠 approved!`); }
    catch { showToast("❌ Error approving"); }
  };

  const decline = async (p) => {
    try { await onDeclineProposal(p); showToast("❌ Proposal declined"); }
    catch { showToast("❌ Error declining"); }
  };

  if (kids.length === 0) return (
    <div style={{ textAlign: "center", color: T.sub, padding: "40px 0", fontSize: 14 }}>
      Add kids first in the Chores tab.
    </div>
  );

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {pendingAll > 0 && (
        <div style={{
          background: `${T.gold}18`, border: `3px solid ${T.gold}`,
          borderRadius: 16, padding: "14px 18px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          boxShadow: "3px 3px 0 #000000",
        }}>
          <div style={{ fontSize: 24 }}>⏳</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: T.goldL, fontSize: 14 }}>
              {pendingAll} pending proposal{pendingAll > 1 ? "s" : ""}
            </div>
            <div style={{ fontSize: 12, color: T.sub }}>
              Your kids want to contribute orange to their wishlist jars
            </div>
          </div>
        </div>
      )}

      {/* Kid selector */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {kids.map(k => (
          <button type="button" key={k.id} onClick={() => setSelectedKid(k.id)} style={{
            background: selectedKid === k.id ? T.purple : "transparent",
            border: `3px solid ${selectedKid === k.id ? T.purple : T.border}`,
            color: selectedKid === k.id ? "white" : T.sub,
            borderRadius: 30, padding: "8px 18px", fontSize: 13,
            fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif",
            display: "flex", alignItems: "center", gap: 6,
          }}>{(() => { const a = getAnimal(k.animal_id || "fox"); return <a.Component size={18}/>; })()} {k.name}</button>
        ))}
      </div>

      {kid && (
        <>
          <div style={{ marginBottom: 20 }}>
            <div style={{
              background: `${T.orange}18`, border: `2px solid ${T.orange}`,
              borderRadius: 12, padding: "10px 18px",
              display: "inline-flex", flexDirection: "column", alignItems: "center",
            }}>
              <div style={{ fontSize: 10, color: T.orange, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>🟠 Available</div>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 24, color: T.orangeL }}>
                {kid.orangeBalance || 0}
              </div>
            </div>
          </div>

          {/* Pending proposals */}
          {kidProposals.length > 0 && (
            <Card style={{ border: `3px solid ${T.gold}` }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.goldL, marginBottom: 14 }}>
                ⏳ {kid.name} wants to contribute
              </div>
              {kidProposals.map(p => (
                <div key={p.id} style={{
                  background: T.panel, borderRadius: 12, padding: "14px 16px",
                  marginBottom: 10, display: "flex", alignItems: "center",
                  gap: 12, flexWrap: "wrap", border: `2px solid ${T.border}`,
                }}>
                  <div style={{ fontSize: 28 }}>{p.jarEmoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: T.text }}>{p.jarName}</div>
                    {p.kid_message && (
                      <div style={{ fontSize: 12, color: T.sub, marginTop: 2, fontStyle: "italic" }}>
                        "{p.kid_message}"
                      </div>
                    )}
                  </div>
                  <Pill color={T.orange}>🟠 {p.proposed}</Pill>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="number"
                      value={editAmount[p.id] !== undefined ? editAmount[p.id] : p.proposed}
                      onChange={e => setEditAmount(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                      style={{
                        width: 70, background: T.sky,
                        border: `2px solid ${T.orange}`, borderRadius: 8,
                        padding: "6px 8px", fontSize: 13, color: T.orangeL,
                        fontFamily: "'Nunito', sans-serif", outline: "none", textAlign: "center",
                      }}/>
                    <Btn onClick={() => approve(p, editAmount[p.id] || p.proposed)}
                      color={T.green} small>✅</Btn>
                    <Btn onClick={() => decline(p)} color={T.red} small outline>✕</Btn>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Jars */}
          {(!kid.jars || kid.jars.length === 0) ? (
            <div style={{ textAlign: "center", color: T.sub, padding: "40px 0", fontSize: 14 }}>
              {kid.name} hasn't added anything to their wishlist yet.
            </div>
          ) : (
            kid.jars.map(jar => {
              const confirmed = jar.orangeConfirmed || 0;
              const pending   = jar.orangePending   || 0;
              const required  = jar.item?.orangeRequired || 1;
              const total     = confirmed + pending;
              const pct       = Math.min(100, Math.round((total / required) * 100));
              const confPct   = Math.min(100, Math.round((confirmed / required) * 100));
              const isFull    = confPct >= 100;

              return (
                <Card key={jar.id} style={{ border: `3px solid ${isFull ? T.green : T.borderBold}`,
                  boxShadow: isFull ? `0 0 16px ${T.green}44, 4px 4px 0 #000000` : "4px 4px 0 #000000" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 40 }}>{jar.item?.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>{jar.item?.name}</div>
                      <div style={{ fontSize: 12, color: T.sub }}>{jar.item?.desc}</div>
                      <div style={{ fontSize: 12, color: T.orangeL, marginTop: 2 }}>
                        {jar.item?.priceDisplay} · needs {required} 🟠
                      </div>
                    </div>
                    {isFull && !jar.unlockedAt && (
                      <div style={{
                        background: `${T.green}22`, border: `2px solid ${T.green}`,
                        borderRadius: 10, padding: "4px 10px",
                        fontSize: 11, color: T.greenL, fontWeight: 800,
                      }}>🔓 READY!</div>
                    )}
                  </div>

                  {/* Progress */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between",
                      fontSize: 11, color: T.sub, marginBottom: 4 }}>
                      <span>{pct}% total</span>
                      <span>{total} / {required}</span>
                    </div>
                    <div style={{
                      background: T.panel, borderRadius: 20, height: 14,
                      overflow: "hidden", position: "relative",
                      border: `2px solid ${T.border}`,
                    }}>
                      <div style={{
                        position: "absolute", left: 0, top: 0, height: "100%",
                        width: `${confPct}%`, borderRadius: 20,
                        background: isFull
                          ? "linear-gradient(90deg,#FFD700,#10B981)"
                          : "linear-gradient(90deg,#F97316,#FDBA74)",
                        transition: "width 0.5s ease",
                      }}/>
                      {pending > 0 && (
                        <div style={{
                          position: "absolute", left: `${confPct}%`, top: 0,
                          height: "100%",
                          width: `${Math.min(pct - confPct, 100 - confPct)}%`,
                          background: "rgba(249,115,22,0.35)",
                          borderLeft: "2px dashed rgba(249,115,22,0.6)",
                        }}/>
                      )}
                    </div>
                  </div>

                  {jar.unlockedAt ? (
                    <div style={{
                      background: `${T.green}12`, border: `2px solid ${T.green}44`,
                      borderRadius: 10, padding: "10px 14px",
                      fontSize: 13, color: T.greenL,
                    }}>
                      ✅ Unlocked! Amazon link ready.
                      {jar.item?.amazonUrl && (
                        <a href={jar.item.amazonUrl} target="_blank" rel="noopener noreferrer"
                          style={{ color: T.greenL, marginLeft: 8, fontWeight: 800 }}>
                          Buy on Amazon →
                        </a>
                      )}
                    </div>
                  ) : isFull ? (
                    <a href={jar.item?.amazonUrl} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: "block", textAlign: "center",
                        background: T.green,
                        color: "white", borderRadius: 14, padding: "11px 0",
                        fontSize: 15, fontWeight: 800, textDecoration: "none",
                        border: "3px solid #000000", boxShadow: "4px 4px 0 #000000",
                      }}>
                      🛒 Buy on Amazon →
                    </a>
                  ) : null}
                </Card>
              );
            })
          )}
        </>
      )}
    </div>
  );
}

// ── Award tab ─────────────────────────────────────────────────────────────────
function AwardTab({ kids, showToast, onAwardOrange }) {
  const [selectedKid,  setSelectedKid]  = useState(null);
  const [amount,       setAmount]       = useState(25);
  const [reason,       setReason]       = useState("");
  const [justAwarded,  setJustAwarded]  = useState(null);

  const QUICK = [
    { label: "Did all chores",           emoji: "🧹", amt: 20 },
    { label: "Great attitude",           emoji: "😊", amt: 25 },
    { label: "Helped a sibling",         emoji: "🤝", amt: 30 },
    { label: "Read without being asked", emoji: "📚", amt: 35 },
    { label: "Perfect week",            emoji: "🌟", amt: 75 },
    { label: "Being extra kind",         emoji: "💛", amt: 20 },
  ];

  const award = async () => {
    if (!selectedKid) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    const kid = kids.find(k => k.id === selectedKid);
    try {
      await onAwardOrange(selectedKid, amt, reason);
      setJustAwarded({ name: kid.name, animal_id: kid.animal_id || "fox", amount: amt, reason });
      showToast(`🟠 +${amt} orange → ${kid.name}!`);
      setReason("");
      setTimeout(() => setJustAwarded(null), 3000);
    } catch { showToast("❌ Failed to award"); }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 13, color: T.sub, marginBottom: 20 }}>
        Award 🟠 orange for effort, kindness, or anything worth celebrating.
      </div>

      {justAwarded && (
        <div style={{
          background: `${T.orange}22`, border: `3px solid ${T.orange}`,
          borderRadius: 18, padding: "18px 24px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 16,
          animation: "pop 0.5s ease", boxShadow: "4px 4px 0 #000000",
        }}>
          <div>{(() => { const a = getAnimal(justAwarded.animal_id || "fox"); return <a.Component size={44}/>; })()}</div>
          <div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: T.orangeL }}>
              +{justAwarded.amount} orange to {justAwarded.name}!
            </div>
            {justAwarded.reason && (
              <div style={{ fontSize: 13, color: T.orangeL, opacity: 0.8, fontStyle: "italic" }}>
                "{justAwarded.reason}"
              </div>
            )}
          </div>
        </div>
      )}

      <Card>
        <div style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 16 }}>
          🟠 Award Orange Bucks
        </div>
        <Lbl>Who</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {kids.map(k => (
            <button type="button" key={k.id} onClick={() => setSelectedKid(k.id)} style={{
              background: selectedKid === k.id ? T.orange : "transparent",
              border: `3px solid ${selectedKid === k.id ? T.orange : T.border}`,
              color: selectedKid === k.id ? "white" : T.sub,
              borderRadius: 30, padding: "8px 16px", fontSize: 14,
              fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif",
              display: "flex", alignItems: "center", gap: 6,
            }}>{(() => { const a = getAnimal(k.animal_id || "fox"); return <a.Component size={18}/>; })()} {k.name}</button>
          ))}
        </div>
        <Lbl>Amount</Lbl>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {[10, 25, 50, 100].map(n => (
            <button type="button" key={n} onClick={() => setAmount(n)} style={{
              background: amount === n ? T.orange : "transparent",
              border: `3px solid ${amount === n ? T.orange : T.border}`,
              color: amount === n ? "white" : T.sub,
              borderRadius: 30, padding: "8px 20px", fontSize: 18,
              fontWeight: 800, cursor: "pointer",
              fontFamily: "'Fredoka One', cursive",
              boxShadow: amount === n ? "3px 3px 0 #000000" : "none",
            }}>+{n}</button>
          ))}
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            style={{
              width: 80, background: T.sky,
              border: `3px solid ${T.border}`, borderRadius: 10,
              padding: "8px 12px", fontSize: 14, color: T.text,
              fontFamily: "'Nunito', sans-serif", outline: "none", textAlign: "center",
            }}/>
        </div>
        <Lbl>Reason (optional)</Lbl>
        <div style={{ marginBottom: 20 }}>
          <Field value={reason} onChange={setReason}
            placeholder="e.g. Amazing effort on the science project!"/>
        </div>
        <Btn onClick={award} color={T.orange} disabled={!selectedKid} full>
          🟠 Award Orange Bucks
        </Btn>
      </Card>

      <Card>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 12 }}>
          ⚡ Quick Awards
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
          gap: 10,
        }}>
          {QUICK.map(q => (
            <button type="button" key={q.label}
              onClick={() => { setAmount(q.amt); setReason(q.label); }}
              style={{
                background: T.panel, border: `2px solid ${T.border}`,
                borderRadius: 14, padding: "12px", cursor: "pointer",
                fontFamily: "'Nunito', sans-serif", textAlign: "left",
                boxShadow: "3px 3px 0 #000000",
              }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>{q.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>
                {q.label}
              </div>
              <div style={{ fontSize: 12, color: T.orangeL }}>+{q.amt} orange</div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Rewards tab ───────────────────────────────────────────────────────────────
function RewardsTab({ rewards, showToast, onAddReward, onDeleteReward }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newR,    setNewR]    = useState({ emoji: "🎁", label: "", orange: 50 });

  const add = async () => {
    if (!newR.label.trim()) return;
    try {
      await onAddReward({ emoji: newR.emoji, label: newR.label, orange: Number(newR.orange) });
      setNewR({ emoji: "🎁", label: "", orange: 50 });
      setShowAdd(false);
      showToast("✅ Reward added!");
    } catch { showToast("❌ Failed"); }
  };

  const del = async (id) => {
    try { await onDeleteReward(id); showToast("🗑️ Removed"); }
    catch { showToast("❌ Failed to remove"); }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 13, color: T.sub, marginBottom: 16 }}>
        Kids spend 🟠 orange on these — no jar needed. You approve the redemption.
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <Btn onClick={() => setShowAdd(v => !v)} small>
          {showAdd ? "✕ Cancel" : "➕ Add Reward"}
        </Btn>
      </div>

      {showAdd && (
        <Card>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 12 }}>
            ➕ New Reward
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 110px", gap: 10, marginBottom: 12 }}>
            <Field value={newR.emoji} onChange={v => setNewR(p => ({ ...p, emoji: v }))}
              placeholder="🎁" style={{ fontSize: 20, textAlign: "center", padding: "8px 4px" }}/>
            <Field value={newR.label} onChange={v => setNewR(p => ({ ...p, label: v }))}
              placeholder="e.g. Stay up an hour late"/>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 14, color: T.orange }}>🟠</span>
              <Field value={newR.orange} onChange={v => setNewR(p => ({ ...p, orange: v }))} type="number"/>
            </div>
          </div>
          <Btn onClick={add} color={T.orange}>✅ Add Reward</Btn>
        </Card>
      )}

      {rewards.length === 0 ? (
        <div style={{ textAlign: "center", color: T.sub, padding: "40px 0" }}>
          No rewards yet — add some above!
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
          gap: 14,
        }}>
          {rewards.map(r => (
            <div key={r.id} style={{
              background: T.panel2, border: `3px solid ${T.borderBold}`,
              borderRadius: 18, padding: "18px 16px", textAlign: "center",
              animation: "pop 0.3s ease", boxShadow: "4px 4px 0 #000000",
            }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>{r.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: T.text,
                marginBottom: 10, lineHeight: 1.3 }}>{r.label}</div>
              <Pill color={T.orange}>🟠 {r.orange}</Pill>
              <div style={{ marginTop: 14 }}>
                <Btn onClick={() => del(r.id)} color={T.red} small outline>🗑️ Remove</Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Green tab ─────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)        return "just now";
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function GreenTab({ kids, deposits = [], showToast }) {
  const QUICK_AMOUNTS = [5, 10, 25, 50];
  const [selectedKid, setSelectedKid] = useState(kids[0]?.id || null);
  const [amount,      setAmount]      = useState(10);
  const [submitting,  setSubmitting]  = useState(false);

  const kid = kids.find(k => k.id === selectedKid) || kids[0];

  const startCheckout = async () => {
    if (!kid)                    return showToast("Add a kid first.");
    if (!amount || amount < 1)   return showToast("Pick at least $1.");
    if (amount > 500)            return showToast("Max load is $500 per checkout.");

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        showToast("Please sign in again.");
        setSubmitting(false);
        return;
      }

      const r = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          kidId:       kid.id,
          kidName:     kid.name,
          amountCents: Math.round(amount * 100),
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.url) {
        showToast(data.error || "Could not start checkout.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      showToast("Something went wrong starting checkout.");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 13, color: T.sub, marginBottom: 20, lineHeight: 1.7 }}>
        🟢 Green is real money. Kids spend it on instant digital codes — Robux, iTunes, V-Bucks.
        $1 = 100 green.
      </div>

      {/* Kid balances */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
        gap: 14, marginBottom: 20,
      }}>
        {kids.map(k => (
          <Card key={k.id} style={{ marginBottom: 0, textAlign: "center" }}>
            <div style={{ marginBottom: 8 }}>{(() => { const a = getAnimal(k.animal_id || "fox"); return <a.Component size={48}/>; })()}</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: T.text, marginBottom: 4 }}>{k.name}</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28, color: T.greenL }}>
              ${((k.greenBalance || 0) / 100).toFixed(2)}
            </div>
            <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>current balance</div>
          </Card>
        ))}
      </div>

      {kids.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>👶</div>
          <div style={{ fontWeight: 800, color: T.text }}>Add a kid first</div>
          <div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>
            Head to the Chores tab to add your first kid.
          </div>
        </Card>
      ) : (
        <Card style={{ border: `3px solid ${T.green}` }}>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: T.greenL, marginBottom: 14 }}>
            💳 Load Green Dollars
          </div>

          {kids.length > 1 && (
            <>
              <Lbl>Whose Account?</Lbl>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {kids.map(k => (
                  <button type="button" key={k.id} onClick={() => setSelectedKid(k.id)} style={{
                    background: selectedKid === k.id ? T.green : "transparent",
                    border: `3px solid ${selectedKid === k.id ? T.green : T.border}`,
                    color: selectedKid === k.id ? "white" : T.sub,
                    borderRadius: 14, padding: "8px 16px", fontSize: 13,
                    fontWeight: 700, cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                    boxShadow: selectedKid === k.id ? "3px 3px 0 #000000" : "none",
                  }}>
                    {k.name}
                  </button>
                ))}
              </div>
            </>
          )}

          <Lbl>Amount</Lbl>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {QUICK_AMOUNTS.map(n => (
              <button type="button" key={n} onClick={() => setAmount(n)} style={{
                background: amount === n ? T.green : "transparent",
                border: `3px solid ${amount === n ? T.green : T.border}`,
                color: amount === n ? "white" : T.sub,
                borderRadius: 50, padding: "8px 18px", fontSize: 13,
                fontWeight: 800, cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
                boxShadow: amount === n ? "3px 3px 0 #000000" : "none",
              }}>
                ${n}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontWeight: 800, color: T.sub }}>$</span>
            <Field
              type="number"
              value={amount}
              onChange={v => setAmount(Number(v) || 0)}
              placeholder="10"
              style={{ maxWidth: 140 }}
            />
            <span style={{ fontSize: 12, color: T.sub }}>USD · max $500</span>
          </div>

          <Btn onClick={startCheckout} color={T.green}
            disabled={submitting || !kid || !amount || amount < 1} full>
            {submitting
              ? "Starting checkout…"
              : `Load $${amount} to ${kid?.name || "kid"}`}
          </Btn>

          <div style={{ fontSize: 11, color: T.sub, marginTop: 12, textAlign: "center", lineHeight: 1.5 }}>
            🔒 Payment processed by Stripe. Balance appears here after payment confirms.
          </div>
        </Card>
      )}

      {/* Recent deposits */}
      {deposits.length > 0 && (
        <Card style={{ marginTop: 20 }}>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: T.text, marginBottom: 4 }}>
            📜 Recent Deposits
          </div>
          <div style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>
            Last {deposits.length} green-dollar load{deposits.length === 1 ? "" : "s"} across your kids.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {deposits.map(d => {
              const animal = getAnimal(d.kidAnimalId);
              return (
                <div key={d.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px",
                  background: T.panel,
                  border: `2px solid ${T.border}`,
                  borderRadius: 12,
                }}>
                  <animal.Component size={32}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: T.text }}>
                      <span style={{ color: T.greenL }}>+${(d.amountCents / 100).toFixed(2)}</span>
                      {" → "}
                      {d.kidName}
                    </div>
                    <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>
                      from {d.loaderName} · {timeAgo(d.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Family circle tab ─────────────────────────────────────────────────────────
function FamilyTab({ kids, familyMembers, showToast, onInviteFamilyMember }) {
  const [selectedKid, setSelectedKid] = useState(kids[0]?.id || null);
  const [showForm,    setShowForm]    = useState(false);
  const [form,        setForm]        = useState({ memberName: "", relationship: "Grandparent", email: "" });

  const RELATIONSHIPS = ["Grandparent","Aunt","Uncle","Godparent","Family Friend","Other"];

  const invite = async () => {
    if (!form.memberName.trim() || !selectedKid) return;
    try {
      await onInviteFamilyMember({ kidId: selectedKid, ...form });
      setForm({ memberName: "", relationship: "Grandparent", email: "" });
      setShowForm(false);
      showToast("✉️ Invite sent!");
    } catch { showToast("❌ Failed to invite"); }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 13, color: T.sub, marginBottom: 20, lineHeight: 1.7 }}>
        Invite grandparents, aunts, uncles — anyone you trust — to see your kid's progress
        and send birthday orange gifts. They get a simplified view with no controls.
      </div>

      {/* Kid selector */}
      {kids.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {kids.map(k => (
            <button type="button" key={k.id} onClick={() => setSelectedKid(k.id)} style={{
              background: selectedKid === k.id ? T.purple : "transparent",
              border: `3px solid ${selectedKid === k.id ? T.purple : T.border}`,
              color: selectedKid === k.id ? "white" : T.sub,
              borderRadius: 30, padding: "8px 18px", fontSize: 13,
              fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif",
              display: "flex", alignItems: "center", gap: 6,
            }}>{(() => { const a = getAnimal(k.animal_id || "fox"); return <a.Component size={18}/>; })()} {k.name}</button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <Btn onClick={() => setShowForm(v => !v)} small color={T.pink}>
          {showForm ? "✕ Cancel" : "💌 Invite Family Member"}
        </Btn>
      </div>

      {showForm && (
        <Card style={{ border: `3px solid ${T.pink}` }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 14 }}>
            💌 Send a Family Invite
          </div>
          <div style={{ marginBottom: 12 }}>
            <Lbl>Their Name</Lbl>
            <Field value={form.memberName}
              onChange={v => setForm(p => ({ ...p, memberName: v }))}
              placeholder="e.g. Grandma Rose"/>
          </div>
          <div style={{ marginBottom: 12 }}>
            <Lbl>Relationship</Lbl>
            <select value={form.relationship}
              onChange={e => setForm(p => ({ ...p, relationship: e.target.value }))}
              style={{
                width: "100%", background: T.sky,
                border: `3px solid ${T.borderBold}`, borderRadius: 12,
                padding: "9px 12px", fontSize: 14, color: T.text,
                fontFamily: "'Nunito', sans-serif", outline: "none",
              }}>
              {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Lbl>Email (optional — for invite link)</Lbl>
            <Field value={form.email} type="email"
              onChange={v => setForm(p => ({ ...p, email: v }))}
              placeholder="grandma@email.com"/>
          </div>
          <Btn onClick={invite} color={T.pink} disabled={!form.memberName.trim()}>
            💌 Send Invite
          </Btn>
        </Card>
      )}

      {familyMembers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>👨‍👩‍👧‍👦</div>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20,
            color: T.text, marginBottom: 8 }}>
            No family members yet
          </div>
          <div style={{ fontSize: 13, color: T.sub }}>
            Invite grandparents or family friends to celebrate your kid's wins!
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
          gap: 14,
        }}>
          {familyMembers.map(m => (
            <Card key={m.id} style={{ marginBottom: 0, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>👤</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>{m.member_name}</div>
              <div style={{ fontSize: 12, color: T.sub, marginBottom: 8 }}>{m.relationship}</div>
              <div style={{
                display: "inline-block",
                background: m.invite_status === "accepted"
                  ? `${T.green}22` : `${T.gold}22`,
                border: `2px solid ${m.invite_status === "accepted" ? T.green : T.gold}`,
                borderRadius: 20, padding: "3px 12px",
                fontSize: 11, fontWeight: 700,
                color: m.invite_status === "accepted" ? T.greenL : T.goldL,
              }}>
                {m.invite_status === "accepted" ? "✅ Joined" : "⏳ Invite sent"}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function ParentDashboard({
  profile, onSignOut,
  kids, chores, proposals, rewards, familyMembers, greenDeposits = [],
  error,
  addKid, addChore, approveChore, rejectChore,
  awardOrange, approveProposal, declineProposal,
  addHomeReward, deleteHomeReward,
  inviteFamilyMember,
}) {
  const [tab,     setTab]     = useState("overview");
  const [toast,   setToast]   = useState(null);
  const [confetti,setConfetti]= useState(false);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  // Handle return from Stripe Checkout for green-dollar loads
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("load");
    if (!status) return;

    if (status === "success") {
      setTab("green");
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1800);
      setToast("Deposit successful! Balance updates in a moment.");
      setTimeout(() => setToast(null), 4000);
    } else if (status === "cancelled") {
      setTab("green");
      setToast("Deposit cancelled — no charge made.");
      setTimeout(() => setToast(null), 3000);
    }

    // Strip the query params so a refresh doesn't re-trigger
    const url = new URL(window.location.href);
    url.searchParams.delete("load");
    url.searchParams.delete("session_id");
    window.history.replaceState({}, "", url.toString());
  }, []);

  const pendingChores    = chores.filter(c => c.status === "done").length;
  const pendingProposals = proposals.filter(p => p.status === "pending").length;
  const totalPending     = pendingChores + pendingProposals;
  const totalGreen       = kids.reduce((a, k) => a + (k.greenBalance || 0), 0);

  const TABS = [
    { id: "overview", label: "Overview",      emoji: "🏠" },
    { id: "jars",     label: "Wishlist Jars", emoji: "⭐", badge: pendingProposals || null },
    { id: "chores",   label: "Chores",        emoji: "✅", badge: pendingChores    || null },
    { id: "rewards",  label: "Home Rewards",  emoji: "🎉" },
    { id: "award",    label: "Award Orange",  emoji: "🟠" },
    { id: "green",    label: "Fund Green",    emoji: "🟢" },
    { id: "family",   label: "Family Circle", emoji: "👨‍👩‍👧" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: T.sky,
      color: T.text, fontFamily: "'Nunito', sans-serif",
      paddingBottom: 60,
      ...benday("#00000008", 10, 1.2),
    }}>
      <style>{fontCSS}</style>
      <Confetti active={confetti}/>
      <Toast msg={toast}/>
      <StarField count={15}/>

      {/* Header */}
      <div style={{
        background: T.panel,
        borderBottom: `3px solid ${T.borderBold}`,
        padding: "14px 24px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        position: "relative", zIndex: 10,
        boxShadow: "0 4px 0 #000000",
      }}>
        <div>
          <div style={{
            fontFamily: "'Fredoka One', cursive", fontSize: 26,
            color: T.purple,
          }}>
            🏠 Parent Console
          </div>
          <div style={{ fontSize: 12, color: T.sub }}>
            {profile?.display_name || "Parent"} · Digital Prize Box
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            background: T.panel2, border: `2px solid ${T.green}44`,
            borderRadius: 12, padding: "8px 14px", textAlign: "center",
            boxShadow: "3px 3px 0 #000000",
          }}>
            <div style={{ fontSize: 10, color: T.sub }}>🟢 Total</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: T.greenL }}>
              ${(totalGreen / 100).toFixed(2)}
            </div>
          </div>
          {totalPending > 0 && (
            <div style={{
              background: T.panel2, border: `2px solid ${T.gold}66`,
              borderRadius: 12, padding: "8px 14px", textAlign: "center",
              boxShadow: "3px 3px 0 #000000",
            }}>
              <div style={{ fontSize: 10, color: T.sub }}>⏳ Waiting</div>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: T.goldL }}>
                {totalPending}
              </div>
            </div>
          )}
          <button type="button" onClick={onSignOut} style={{
            background: "transparent", border: `2px solid ${T.border}`,
            color: T.sub, borderRadius: 10, padding: "7px 14px",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
          }}>Sign Out</button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: `${T.red}22`, border: `2px solid ${T.red}`,
          padding: "10px 24px", fontSize: 13, color: "#FCA5A5",
          fontWeight: 700, position: "relative", zIndex: 10,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        padding: "12px 24px",
        display: "flex", gap: 8, flexWrap: "wrap",
        borderBottom: `2px solid ${T.borderBold}`,
        position: "relative", zIndex: 10,
      }}>
        {TABS.map(t => (
          <button type="button" key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? T.purple : "transparent",
            border: `3px solid ${tab === t.id ? T.purple : T.border}`,
            color: tab === t.id ? "white" : T.sub,
            borderRadius: 14, padding: "8px 16px", fontSize: 13,
            fontWeight: 700, cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
            boxShadow: tab === t.id ? "3px 3px 0 #000000" : "none",
            transition: "all 0.2s", position: "relative",
          }}>
            {t.emoji} {t.label}
            {t.badge && (
              <span style={{
                position: "absolute", top: -8, right: -8,
                background: T.gold, color: "white",
                borderRadius: "50%", width: 18, height: 18,
                fontSize: 10, fontWeight: 900, border: "2px solid #000000",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        maxWidth: 900, margin: "0 auto",
        padding: "24px 20px",
        position: "relative", zIndex: 5,
      }}>
        {tab === "overview" && <OverviewTab kids={kids} profile={profile}/>}
        {tab === "jars"     && <JarsTab kids={kids} proposals={proposals}
          showToast={showToast} onApproveProposal={approveProposal}
          onDeclineProposal={declineProposal}/>}
        {tab === "chores"   && <ChoresTab kids={kids} chores={chores}
          showToast={showToast} onAddKid={addKid} onAddChore={addChore}
          onApproveChore={approveChore} onRejectChore={rejectChore}/>}
        {tab === "rewards"  && <RewardsTab rewards={rewards}
          showToast={showToast} onAddReward={addHomeReward}
          onDeleteReward={deleteHomeReward}/>}
        {tab === "award"    && <AwardTab kids={kids}
          showToast={showToast} onAwardOrange={awardOrange}/>}
        {tab === "green"    && <GreenTab kids={kids} deposits={greenDeposits} showToast={showToast}/>}
        {tab === "family"   && <FamilyTab kids={kids} familyMembers={familyMembers}
          showToast={showToast} onInviteFamilyMember={inviteFamilyMember}/>}
      </div>
    </div>
  );
}

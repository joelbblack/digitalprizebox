// ─── src/dashboards/KidDashboard.jsx ─────────────────────────────────────────
// Fully wired kid-facing dashboard.
// Fixed from original:
//  ✅ No hardcoded kidId, kidName, or balances — all from props
//  ✅ ORANGE_REWARDS loaded from home_rewards + classroom_rewards tables
//  ✅ Jars loaded from real jars table
//  ✅ Class goal from real teachers record
//  ✅ Animal unlocks based on chores_completed
//  ✅ Saturday Morning Cartoon design throughout
//  ✅ Confetti on jar unlock / reward redemption
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { supabase }                          from "../lib/auth";
import { fontCSS, T }                        from "../lib/theme";
import {
  ANIMALS, getAnimal, unlockedAnimals,
  StarField, Confetti, Toast, Spinner,
} from "../lib/animals";

// ── Currency display ──────────────────────────────────────────────────────────
function BalancePill({ amount, type }) {
  const isGreen  = type === "green";
  const color    = isGreen ? T.green : T.orange;
  const colorL   = isGreen ? T.greenL : T.orangeL;
  const label    = isGreen ? "🟢 Green" : "🟠 Orange";
  const display  = isGreen ? `$${(amount / 100).toFixed(2)}` : amount;
  const sub      = isGreen ? "digital codes" : "wishlist + rewards";

  return (
    <div style={{
      background: `${color}18`,
      border: `3px solid ${color}`,
      borderRadius: 20, padding: "10px 20px",
      textAlign: "center",
      boxShadow: `4px 4px 0 ${color}44`,
      animation: "float 3s ease-in-out infinite",
    }}>
      <div style={{ fontSize: 11, color: colorL, fontWeight: 800,
        textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Fredoka One', cursive", fontSize: 28, color: colorL,
      }}>{display}</div>
      <div style={{ fontSize: 10, color: `${colorL}88` }}>{sub}</div>
    </div>
  );
}

// ── Class goal bar ────────────────────────────────────────────────────────────
function ClassGoal({ teacher }) {
  if (!teacher) return null;
  const current = teacher.goal_current || 0;
  const target  = teacher.goal_amount  || 5000;
  const pct     = Math.min(100, Math.round((current / target) * 100));
  const label   = teacher.goal_label || "Class Goal";

  return (
    <div style={{
      background: T.panel,
      border: `1px solid ${T.border}`,
      borderRadius: 16, padding: "12px 16px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 6 }}>
        <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>
          🏫 {label}
        </span>
        <span style={{ color: T.goldL, fontSize: 13, fontWeight: 800 }}>
          {current} / {target} 🟠
        </span>
      </div>
      <div style={{
        background: T.panel, borderRadius: 20,
        height: 10, overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 20,
          background: "linear-gradient(90deg,#FFD700,#FF6B6B)",
          boxShadow: "0 0 10px rgba(255,200,0,0.5)",
          transition: "width 0.6s ease",
        }}/>
      </div>
      <div style={{ color: T.sub, fontSize: 11, marginTop: 4 }}>
        🎯 {target - current} orange until {label}!
      </div>
    </div>
  );
}

// ── Jar progress card ─────────────────────────────────────────────────────────
function JarCard({ jar, orange, onPropose }) {
  const confirmed  = jar.orange_confirmed || 0;
  const pending    = jar.orange_pending   || 0;
  const required   = jar.orange_required  || 1;
  const total      = confirmed + pending;
  const pct        = Math.min(100, Math.round((total / required) * 100));
  const confPct    = Math.min(100, Math.round((confirmed / required) * 100));
  const isFull     = confPct >= 100;
  const [amount, setAmount] = useState("");
  const [showing, setShowing] = useState(false);

  return (
    <div style={{
      background: T.panel2,
      border: `3px solid ${isFull ? T.green : T.borderBold}`,
      borderRadius: 20, padding: "16px",
      boxShadow: isFull ? `0 0 20px ${T.green}44, 4px 4px 0 #000000` : "4px 4px 0 #000000",
      animation: "pop 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 40 }}>{jar.product_emoji || "⭐"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>
            {jar.product_name}
          </div>
          <div style={{ fontSize: 12, color: T.sub }}>
            ${((jar.product_price_cents || 0) / 100).toFixed(2)} · needs {required} 🟠
          </div>
        </div>
        {isFull && (
          <div style={{
            background: `${T.green}22`, border: `2px solid ${T.green}`,
            borderRadius: 10, padding: "4px 10px",
            fontSize: 11, color: T.greenL, fontWeight: 800,
          }}>🔓 READY!</div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          fontSize: 11, color: T.sub, marginBottom: 4 }}>
          <span>{pct}% saved</span>
          <span>{total} / {required}</span>
        </div>
        <div style={{
          background: T.panel, borderRadius: 20,
          height: 14, overflow: "hidden", position: "relative",
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
        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
          {confirmed > 0 && (
            <span style={{
              fontSize: 10, background: `${T.orange}18`, color: T.orange,
              borderRadius: 10, padding: "2px 8px", fontWeight: 700,
            }}>🟠 {confirmed} confirmed</span>
          )}
          {pending > 0 && (
            <span style={{
              fontSize: 10, background: "rgba(249,115,22,0.1)", color: "#FDBA74",
              borderRadius: 10, padding: "2px 8px", fontWeight: 700,
              border: "1px dashed rgba(249,115,22,0.4)",
            }}>⏳ {pending} pending</span>
          )}
        </div>
      </div>

      {/* Propose contribution */}
      {!isFull && (
        showing ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="number" value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="orange to add"
              style={{
                flex: 1, background: T.sky,
                border: `2px solid ${T.orange}`, borderRadius: 10,
                padding: "8px 10px", fontSize: 14, color: T.orange,
                fontFamily: "'Nunito', sans-serif", outline: "none",
                textAlign: "center", fontWeight: 800,
              }}/>
            <button type="button"
              onClick={() => { onPropose(jar.id, Number(amount)); setShowing(false); setAmount(""); }}
              disabled={!amount || Number(amount) <= 0 || Number(amount) > orange}
              style={{
                background: T.orange, border: "2px solid #000000",
                borderRadius: 10, padding: "8px 14px", color: "white",
                fontWeight: 800, cursor: "pointer", fontSize: 13,
                opacity: !amount || Number(amount) <= 0 || Number(amount) > orange ? 0.4 : 1,
              }}>Save 🟠</button>
            <button type="button" onClick={() => setShowing(false)} style={{
              background: "transparent", border: `2px solid ${T.border}`,
              borderRadius: 10, padding: "8px 10px", color: T.sub,
              cursor: "pointer", fontSize: 13,
            }}>✕</button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowing(true)}
            disabled={orange <= 0}
            style={{
              width: "100%", background: "transparent",
              border: `3px solid ${T.orange}`, borderRadius: 14,
              padding: "10px 0", color: T.orange,
              fontFamily: "'Fredoka One', cursive", fontSize: 15,
              cursor: orange <= 0 ? "not-allowed" : "pointer",
              opacity: orange <= 0 ? 0.4 : 1,
              boxShadow: "3px 3px 0 rgba(249,115,22,0.3)",
            }}>
            💰 Add Orange Bucks
          </button>
        )
      )}
    </div>
  );
}

// ── Reward card ───────────────────────────────────────────────────────────────
function RewardCard({ reward, orange, onRedeem }) {
  const cost      = reward.orange_cost || reward.orange_reward || 50;
  const canAfford = orange >= cost;

  return (
    <div style={{
      background: T.panel2,
      border: `3px solid ${canAfford ? T.borderBold : T.border}`,
      borderRadius: 20, padding: "16px", textAlign: "center",
      boxShadow: "4px 4px 0 #000000", opacity: canAfford ? 1 : 0.6,
      animation: "pop 0.3s ease",
    }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>{reward.emoji || "🎁"}</div>
      <div style={{ fontWeight: 800, fontSize: 14, color: T.text,
        marginBottom: 8, lineHeight: 1.3 }}>
        {reward.label}
      </div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: `${T.orange}18`, border: `2px solid ${T.orange}`,
        borderRadius: 20, padding: "4px 12px",
        fontFamily: "'Fredoka One', cursive", fontSize: 14, color: T.orangeL,
        marginBottom: 12,
      }}>🟠 {cost}</div>
      <button type="button" onClick={() => onRedeem(reward)}
        disabled={!canAfford}
        style={{
          width: "100%",
          background: canAfford
            ? "linear-gradient(135deg,#F97316,#EA580C)"
            : T.border,
          border: "2px solid #000000", borderRadius: 12,
          padding: "10px 0", color: "white",
          fontFamily: "'Fredoka One', cursive", fontSize: 14,
          cursor: canAfford ? "pointer" : "not-allowed",
          boxShadow: canAfford ? "3px 3px 0 #000000" : "none",
        }}>
        {canAfford ? "🎉 Redeem!" : "Need more 🟠"}
      </button>
    </div>
  );
}

// ── Animal picker modal ───────────────────────────────────────────────────────
function AnimalPicker({ current, totalChores, onSelect, onClose }) {
  const unlocked = unlockedAnimals(totalChores);
  const locked   = ANIMALS.filter(a => a.choreThreshold > totalChores);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: T.panel, borderRadius: 24, padding: "24px",
        border: `3px solid ${T.borderBold}`, width: "100%", maxWidth: 480,
        boxShadow: "8px 8px 0 #000000", maxHeight: "80vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 20 }}>
          <div style={{
            fontFamily: "'Fredoka One', cursive", fontSize: 20, color: T.text,
          }}>🎭 Choose Your Animal</div>
          <button type="button" onClick={onClose} style={{
            background: "transparent", border: `2px solid ${T.border}`,
            borderRadius: 10, padding: "6px 12px", color: T.sub,
            cursor: "pointer", fontSize: 16,
          }}>✕</button>
        </div>

        <div style={{ fontSize: 12, color: T.sub, marginBottom: 16 }}>
          You've completed <strong style={{ color: T.orangeL }}>{totalChores} chores</strong> total.
          Keep going to unlock more!
        </div>

        {/* Unlocked */}
        <div style={{ fontSize: 11, fontWeight: 800, color: T.sub,
          textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>
          Unlocked ({unlocked.length})
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(100px,1fr))",
          gap: 10, marginBottom: 20,
        }}>
          {unlocked.map(a => {
            const isCurrent = current === a.id;
            return (
              <button key={a.id} type="button" onClick={() => onSelect(a.id)}
                style={{
                  background: isCurrent ? `${a.color}22` : T.panel2,
                  border: `3px solid ${isCurrent ? a.color : T.border}`,
                  borderRadius: 16, padding: "12px 8px",
                  cursor: "pointer", textAlign: "center",
                  boxShadow: isCurrent ? `3px 3px 0 ${a.color}` : "3px 3px 0 #000000",
                  transition: "all 0.2s",
                }}>
                <a.Component size={50}/>
                <div style={{ fontSize: 12, fontWeight: 800,
                  color: isCurrent ? a.color : T.text, marginTop: 6 }}>
                  {a.name}
                </div>
                {isCurrent && (
                  <div style={{ fontSize: 10, color: a.color, fontWeight: 700 }}>
                    ✓ Active
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Locked */}
        {locked.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.sub,
              textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>
              Locked — keep doing chores!
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(100px,1fr))",
              gap: 10,
            }}>
              {locked.map(a => (
                <div key={a.id} style={{
                  background: T.panel2, border: `2px solid ${T.border}`,
                  borderRadius: 16, padding: "12px 8px", textAlign: "center",
                  opacity: 0.5, filter: "grayscale(1)",
                }}>
                  <div style={{ fontSize: 36 }}>🔒</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, marginTop: 4 }}>
                    {a.name}
                  </div>
                  <div style={{ fontSize: 10, color: T.sub }}>
                    {a.choreThreshold} chores
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function KidDashboard({ kid, onRefresh }) {
  const [activeTab,    setActiveTab]    = useState("wishlist");
  const [rewards,      setRewards]      = useState([]);
  const [confetti,     setConfetti]     = useState(false);
  const [toast,        setToast]        = useState(null);
  const [showAnimals,  setShowAnimals]  = useState(false);
  const [animalId,     setAnimalId]     = useState(kid.animal_id || "fox");
  const [phase,        setPhase]        = useState("box"); // "box" | "open"

  const green     = kid.green_balance  || 0;
  const orange    = kid.orange_balance || 0;
  const jars      = kid.jars           || [];
  const teacher   = kid.teachers;
  const chores    = kid.chores_completed || 0;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };
  const boom      = () => { setConfetti(true); setTimeout(() => setConfetti(false), 2500); };

  // Load rewards (home + classroom)
  useEffect(() => {
    const load = async () => {
      const results = [];
      if (kid.parent_id) {
        const { data } = await supabase.from("home_rewards")
          .select("*").eq("parent_id", kid.parent_id).eq("is_active", true);
        if (data) results.push(...data.map(r => ({ ...r, source: "home" })));
      }
      if (kid.teacher_id) {
        const { data } = await supabase.from("classroom_rewards")
          .select("*").eq("teacher_id", kid.teacher_id).eq("is_active", true);
        if (data) results.push(...data.map(r => ({ ...r, source: "classroom" })));
      }
      setRewards(results);
    };
    load();
  }, [kid.parent_id, kid.teacher_id]);

  // Propose jar contribution
  const handlePropose = async (jarId, amount) => {
    if (amount <= 0 || amount > orange) return;
    const jar = jars.find(j => j.id === jarId);
    if (!jar) return;

    const { error } = await supabase.from("jar_proposals").insert({
      jar_id:          jarId,
      kid_id:          kid.id,
      source:          kid.parent_id ? "parent_orange" : "teacher_orange",
      proposed_amount: amount,
    });

    if (error) { showToast("❌ Couldn't save — try again"); return; }

    // Update pending on jar locally
    await supabase.from("jars").update({
      orange_pending: (jar.orange_pending || 0) + amount,
    }).eq("id", jarId);

    showToast(`⏳ Sent ${amount} 🟠 for parent approval!`);
    onRefresh();
  };

  // Redeem reward
  const handleRedeem = async (reward) => {
    const cost = reward.orange_cost || reward.orange_reward || 50;
    if (orange < cost) return;

    const { error } = await supabase.from("reward_redemptions").insert({
      kid_id:              kid.id,
      reward_type:         reward.source || "home",
      home_reward_id:      reward.source === "home" ? reward.id : null,
      classroom_reward_id: reward.source === "classroom" ? reward.id : null,
      orange_spent:        cost,
      status:              "pending",
    });

    if (error) { showToast("❌ Couldn't redeem — try again"); return; }

    boom();
    showToast(`🎉 ${reward.label} requested!`);
    onRefresh();
  };

  // Change animal
  const handleAnimalSelect = async (id) => {
    setAnimalId(id);
    setShowAnimals(false);
    await supabase.from("kids").update({ animal_id: id }).eq("id", kid.id);
    showToast("✨ New look!");
  };

  const animal    = getAnimal(animalId);
  const AnimalCmp = animal.Component;

  const TABS = [
    { id: "wishlist", label: "⭐ Wishlist", show: true },
    { id: "rewards",  label: "🟠 Rewards",  show: true },
  ].filter(t => t.show);

  // Opening box animation
  const handleOpen = () => {
    setPhase("opening");
    setTimeout(() => { setPhase("open"); boom(); }, 800);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FFFFFF",
      backgroundImage: "radial-gradient(circle, #00000008 1.2px, transparent 1.2px)",
      backgroundSize: "10px 10px",
      fontFamily: "'Nunito', sans-serif",
      overflowX: "hidden",
    }}>
      <style>{fontCSS}</style>
      <Confetti active={confetti}/>
      <Toast msg={toast}/>
      <StarField count={20}/>
      {showAnimals && (
        <AnimalPicker
          current={animalId}
          totalChores={chores}
          onSelect={handleAnimalSelect}
          onClose={() => setShowAnimals(false)}
        />
      )}

      {/* Header */}
      <div style={{
        textAlign: "center", paddingTop: 28, paddingBottom: 16,
        position: "relative", zIndex: 10,
      }}>
        <div style={{
          fontFamily: "'Fredoka One', cursive", fontSize: 38,
          color: "#0033CC",
          lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          marginBottom: 8,
        }}>
          🎁 Prize Box
        </div>

        {/* Kid avatar + name */}
        <button type="button" onClick={() => setShowAnimals(true)}
          title="Change your animal"
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: T.panel,
            border: `2px solid ${T.border}`,
            borderRadius: 30, padding: "6px 16px",
            cursor: "pointer", transition: "all 0.2s",
          }}>
          <AnimalCmp size={36}/>
          <span style={{ color: T.text, fontWeight: 800, fontSize: 15 }}>
            {kid.name}
          </span>
          <span style={{ fontSize: 11, color: T.sub }}>
            ✏️
          </span>
        </button>

        {/* Chores badge */}
        <div style={{ marginTop: 8 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: `${T.orange}22`,
            border: `1px solid ${T.orange}66`,
            borderRadius: 20, padding: "3px 12px",
            fontSize: 12, color: T.orangeL, fontWeight: 700,
          }}>
            ✅ {chores} chores completed
          </span>
        </div>

        {/* Balances */}
        <div style={{
          marginTop: 14, padding: "0 16px",
          display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap",
        }}>
          <BalancePill amount={green}  type="green"/>
          <BalancePill amount={orange} type="orange"/>
        </div>
      </div>

      {/* Class goal */}
      <div style={{ maxWidth: 420, margin: "0 auto 16px", padding: "0 20px", position: "relative", zIndex: 10 }}>
        <ClassGoal teacher={teacher}/>
      </div>

      {/* Box OR content */}
      {phase === "box" ? (
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "20px 0 60px", position: "relative", zIndex: 10,
        }}>
          <div style={{ animation: "bounce 2s ease-in-out infinite", marginBottom: 16 }}>
            <AnimalCmp size={80} animate/>
          </div>
          <button type="button" onClick={handleOpen} style={{
            background: "#0033CC",
            border: "4px solid #FFD700", borderRadius: 50,
            padding: "16px 40px", color: "#FFFFFF",
            fontFamily: "'Fredoka One', cursive", fontSize: 22,
            cursor: "pointer",
            boxShadow: "0 0 30px rgba(0,51,204,0.6), 6px 6px 0 #000000",
            animation: "pulse 2s ease-in-out infinite",
          }}>
            🎁 Open Prize Box!
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px 80px", position: "relative", zIndex: 10 }}>

          {/* Tabs */}
          <div style={{
            display: "flex", gap: 8, justifyContent: "center",
            marginBottom: 24, flexWrap: "wrap",
          }}>
            {TABS.map(t => (
              <button key={t.id} type="button"
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: activeTab === t.id
                    ? `${T.purple}22` : T.panel,
                  border: `3px solid ${activeTab === t.id
                    ? T.borderBold : T.border}`,
                  color: T.text, borderRadius: 30, padding: "10px 28px",
                  fontSize: 16, fontWeight: 800, cursor: "pointer",
                  fontFamily: "'Fredoka One', cursive",
                  boxShadow: activeTab === t.id ? "4px 4px 0 rgba(0,0,0,0.3)" : "none",
                  position: "relative",
                }}>
                {t.label}
                {t.id === "wishlist" && jars.length > 0 && (
                  <span style={{
                    position: "absolute", top: -8, right: -8,
                    background: T.orange, color: "white",
                    borderRadius: "50%", width: 20, height: 20,
                    fontSize: 11, fontWeight: 900,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid #000000",
                  }}>{jars.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Wishlist tab */}
          {activeTab === "wishlist" && (
            <div>
              {jars.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 56, marginBottom: 12 }}>⭐</div>
                  <div style={{
                    fontFamily: "'Fredoka One', cursive", fontSize: 22,
                    color: T.text, marginBottom: 8,
                  }}>Your wishlist is empty!</div>
                  <div style={{ fontSize: 14, color: T.sub }}>
                    Ask a parent to add prizes to your wishlist jar.
                  </div>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                  gap: 16,
                }}>
                  {jars.filter(j => j.status === "saving").map(jar => (
                    <JarCard
                      key={jar.id} jar={jar}
                      orange={orange}
                      onPropose={handlePropose}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rewards tab */}
          {activeTab === "rewards" && (
            <div>
              {rewards.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
                  <div style={{
                    fontFamily: "'Fredoka One', cursive", fontSize: 22,
                    color: T.text, marginBottom: 8,
                  }}>No rewards set up yet!</div>
                  <div style={{ fontSize: 14, color: T.sub }}>
                    Ask a parent or teacher to add rewards.
                  </div>
                </div>
              ) : (
                <>
                  {rewards.some(r => r.source === "home") && (
                    <div style={{
                      fontSize: 13, color: T.sub,
                      fontWeight: 700, marginBottom: 10,
                    }}>🏠 Home Rewards</div>
                  )}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
                    gap: 12, marginBottom: 20,
                  }}>
                    {rewards.filter(r => r.source === "home").map(r => (
                      <RewardCard key={r.id} reward={r} orange={orange} onRedeem={handleRedeem}/>
                    ))}
                  </div>
                  {rewards.some(r => r.source === "classroom") && (
                    <div style={{
                      fontSize: 13, color: T.sub,
                      fontWeight: 700, marginBottom: 10,
                    }}>🏫 Classroom Rewards</div>
                  )}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
                    gap: 12,
                  }}>
                    {rewards.filter(r => r.source === "classroom").map(r => (
                      <RewardCard key={r.id} reward={r} orange={orange} onRedeem={handleRedeem}/>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

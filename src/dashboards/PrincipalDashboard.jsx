// ─── src/dashboards/PrincipalDashboard.jsx ───────────────────────────────────
// Complete rewrite of prizebox_principal.jsx
// Fixed:
//  ✅ All seed data gone — real school/teacher data from Supabase
//  ✅ Distribute action writes to school_distributions table
//  ✅ Settings saves to schools table
//  ✅ No money flows to teachers — PBIS green only
//  ✅ School creation flow for new principals
//  ✅ Saturday Morning Cartoon design
// ─────────────────────────────────────────────────────────────────────────────

import { useState }         from "react";
import { fontCSS, T, PBIS_CATEGORIES } from "../lib/theme";
import { Bear, StarField, Toast, Owl } from "../lib/animals";

const PBIS_CATS = [
  "Tier 1 — Universal", "Tier 2 — Targeted", "Tier 3 — Intensive",
  "Attendance", "Behavior", "Academic Achievement", "Social-Emotional",
];

// ── Shared UI ─────────────────────────────────────────────────────────────────
const Lbl = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 800, color: T.sub,
    textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>{children}</div>
);

const Field = ({ value, onChange, placeholder, type = "text", style = {} }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: "100%", background: T.sky,
      border: `3px solid ${T.borderBold}`, borderRadius: 12,
      padding: "9px 12px", fontSize: 14, color: T.text,
      fontFamily: "'Nunito', sans-serif", outline: "none",
      boxSizing: "border-box", boxShadow: "3px 3px 0 #1A0A3C", ...style,
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
    boxShadow: disabled ? "none" : "3px 3px 0 #1A0A3C",
    opacity: disabled ? 0.5 : 1,
    width: full ? "100%" : undefined, whiteSpace: "nowrap",
  }}>{children}</button>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.panel2, borderRadius: 20, padding: "20px",
    border: `3px solid ${T.borderBold}`, boxShadow: "4px 4px 0 #1A0A3C",
    marginBottom: 16, animation: "fadeIn 0.3s ease", ...style,
  }}>{children}</div>
);

// ── School creation (new principals) ─────────────────────────────────────────
function CreateSchoolModal({ onCreate }) {
  const [form, setForm] = useState({ name: "", district: "", city: "", state: "CA" });
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try { await onCreate(form); }
    catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(10,5,30,0.95)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: T.panel, borderRadius: 28, padding: "36px 32px",
        border: `3px solid ${T.borderBold}`, width: "100%", maxWidth: 480,
        boxShadow: "8px 8px 0 #1A0A3C",
      }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Owl size={72} animate/>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 24,
            color: T.text, marginTop: 8 }}>Set up your school</div>
          <div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>
            Create your school profile to get started.
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <Lbl>School Name</Lbl>
          <Field value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))}
            placeholder="Lincoln Elementary"/>
        </div>
        <div style={{ marginBottom: 12 }}>
          <Lbl>District</Lbl>
          <Field value={form.district} onChange={v => setForm(p => ({ ...p, district: v }))}
            placeholder="Redlands Unified School District"/>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10, marginBottom: 20 }}>
          <div>
            <Lbl>City</Lbl>
            <Field value={form.city} onChange={v => setForm(p => ({ ...p, city: v }))}
              placeholder="Redlands"/>
          </div>
          <div>
            <Lbl>State</Lbl>
            <Field value={form.state} onChange={v => setForm(p => ({ ...p, state: v }))}
              placeholder="CA"/>
          </div>
        </div>
        <Btn onClick={create} disabled={saving || !form.name.trim()} full color={T.blue}>
          {saving ? "⏳ Creating..." : "🏫 Create School"}
        </Btn>
      </div>
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({ school, teachers }) {
  const totalKids    = teachers.reduce((a, t) => a + (t.kids?.[0]?.count || 0), 0);
  const totalGreen   = teachers.reduce((a, t) => a + (t.green_balance || 0), 0);
  const goalPct      = Math.min(100, Math.round(
    ((school.school_goal_current || 0) / (school.school_goal_amount || 50000)) * 100
  ));

  const metrics = [
    { label: "PBIS Pool Available", value: `$${((school.green_balance || 0) / 100).toFixed(2)}`,
      color: T.green, sub: "ready to distribute" },
    { label: "Distributed to Classes", value: `$${((school.green_distributed_total || 0) / 100).toFixed(2)}`,
      color: T.orange, sub: "this year" },
    { label: "Teachers", value: teachers.length, color: T.purple, sub: "in your school" },
    { label: "Classroom Balances", value: `$${(totalGreen / 100).toFixed(2)}`,
      color: T.blue, sub: "across all classes" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 20 }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            background: T.panel, borderRadius: 16, padding: "16px",
            border: `3px solid ${T.borderBold}`, boxShadow: "3px 3px 0 #1A0A3C",
          }}>
            <div style={{ fontSize: 10, color: T.sub, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 24, color: m.color }}>
              {m.value}
            </div>
            <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* School goal */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>
            🏫 School Goal — {school.school_goal_label || "Field Trip"}
          </div>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: T.goldL }}>
            {school.school_goal_current || 0} / {school.school_goal_amount || 50000} 🟠
          </div>
        </div>
        <div style={{ background: T.panel, borderRadius: 20, height: 16,
          overflow: "hidden", border: `2px solid ${T.border}`, marginBottom: 8 }}>
          <div style={{
            width: `${goalPct}%`, height: "100%", borderRadius: 20,
            background: "linear-gradient(90deg,#FFD700,#F97316)",
            transition: "width 0.5s",
          }}/>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.sub }}>
          <span>{goalPct}% complete</span>
          <span>{(school.school_goal_amount || 50000) - (school.school_goal_current || 0)} orange to go</span>
        </div>
      </Card>

      {/* How it flows */}
      <Card>
        <div style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 16 }}>
          💡 How PBIS Green Flows
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { step: "1", emoji: "💳", title: "You Load Budget",
              desc: "Load PBIS allocation via Stripe. Sits in school green pool." },
            { step: "2", emoji: "🏫", title: "Distribute to Classes",
              desc: "Split equally or send to specific classrooms by PBIS category." },
            { step: "3", emoji: "🎁", title: "Teachers Award Students",
              desc: "Teachers distribute green to kids. Kids spend on digital codes." },
          ].map(s => (
            <div key={s.step} style={{ textAlign: "center" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: T.purple, color: "white", fontWeight: 800, fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 8px", border: "3px solid #1A0A3C",
                boxShadow: "2px 2px 0 #1A0A3C",
              }}>{s.step}</div>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 13, color: T.text, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: T.sub, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Distribute tab ────────────────────────────────────────────────────────────
function DistributeTab({ school, teachers, distHistory, showToast, onDistribute }) {
  const [distType,  setDistType]  = useState("equal");
  const [amount,    setAmount]    = useState("");
  const [toTeacher, setToTeacher] = useState(null);
  const [note,      setNote]      = useState("");
  const [category,  setCategory]  = useState(PBIS_CATS[0]);
  const [distributing, setDistributing] = useState(false);

  const amtNum      = Number(amount);
  const enoughFunds = amtNum > 0 && Math.round(amtNum * 100) <= (school?.green_balance || 0);

  const distribute = async () => {
    if (!enoughFunds) return;
    setDistributing(true);
    try {
      await onDistribute({
        type: distType, amount: amtNum,
        teacherId: toTeacher, note, pbisCategory: category,
      });
      showToast(distType === "equal"
        ? `✅ $${amtNum.toFixed(2)} distributed across ${teachers.length} classrooms!`
        : `✅ $${amtNum.toFixed(2)} sent to classroom!`
      );
      setAmount(""); setNote("");
    } catch (e) { showToast(`❌ ${e.message}`); }
    setDistributing(false);
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Balance */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{
          background: `${T.green}18`, border: `3px solid ${T.green}`,
          borderRadius: 14, padding: "12px 18px", textAlign: "center",
          boxShadow: "3px 3px 0 #1A0A3C",
        }}>
          <div style={{ fontSize: 10, color: T.greenL, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            🟢 Available to Distribute
          </div>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28, color: T.greenL }}>
            ${((school?.green_balance || 0) / 100).toFixed(2)}
          </div>
        </div>
        <div style={{
          background: T.panel, border: `2px solid ${T.border}`,
          borderRadius: 14, padding: "12px 18px", textAlign: "center",
          boxShadow: "3px 3px 0 #1A0A3C",
        }}>
          <div style={{ fontSize: 10, color: T.sub, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Classrooms</div>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28, color: T.purpleL }}>
            {teachers.length}
          </div>
        </div>
      </div>

      <Card>
        <div style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 16 }}>
          💰 Distribute PBIS Budget
        </div>

        {/* Type selector */}
        <Lbl>How to distribute</Lbl>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { id: "equal",    emoji: "⚖️", label: "Split Equally", desc: "Divide evenly across all classrooms" },
            { id: "classroom",emoji: "🏫", label: "One Classroom",  desc: "Send a set amount to one classroom" },
          ].map(t => (
            <div key={t.id} onClick={() => setDistType(t.id)} style={{
              background: distType === t.id ? `${T.blue}22` : T.panel,
              border: `3px solid ${distType === t.id ? T.blue : T.border}`,
              borderRadius: 14, padding: "14px", cursor: "pointer",
              boxShadow: distType === t.id ? `3px 3px 0 ${T.blue}88` : "3px 3px 0 #1A0A3C",
              transition: "all 0.2s",
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{t.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 13,
                color: distType === t.id ? T.text : T.sub }}>{t.label}</div>
              <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{t.desc}</div>
            </div>
          ))}
        </div>

        {/* Classroom selector */}
        {distType === "classroom" && (
          <div style={{ marginBottom: 16 }}>
            <Lbl>Select Classroom</Lbl>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {teachers.map(t => (
                <button key={t.id} type="button" onClick={() => setToTeacher(t.id)} style={{
                  background: toTeacher === t.id ? T.blue : "transparent",
                  border: `3px solid ${toTeacher === t.id ? T.blue : T.border}`,
                  color: toTeacher === t.id ? "white" : T.sub,
                  borderRadius: 30, padding: "8px 16px", fontSize: 13,
                  fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif",
                  boxShadow: toTeacher === t.id ? "3px 3px 0 #1A0A3C" : "none",
                }}>
                  {t.teacher_name} — {t.class_name || "Class"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Amount + category */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <Lbl>Amount ($)</Lbl>
            <Field value={amount} onChange={setAmount} placeholder="e.g. 500" type="number"/>
            {amount && (
              <div style={{ fontSize: 11, color: T.sub, marginTop: 4 }}>
                {distType === "equal" && teachers.length > 0
                  ? `$${(amtNum / teachers.length).toFixed(2)} per classroom`
                  : "Full amount to selected classroom"}
              </div>
            )}
          </div>
          <div>
            <Lbl>PBIS Category</Lbl>
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{
                width: "100%", background: T.sky,
                border: `3px solid ${T.borderBold}`, borderRadius: 12,
                padding: "9px 12px", fontSize: 14, color: T.text,
                fontFamily: "'Nunito', sans-serif", outline: "none",
              }}>
              {PBIS_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Lbl>Note (optional)</Lbl>
          <Field value={note} onChange={setNote} placeholder="e.g. October PBIS allocation"/>
        </div>

        {/* Quick amounts */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {[100, 250, 500, 1000].map(n => (
            <button key={n} type="button" onClick={() => setAmount(String(n))} style={{
              background: amtNum === n ? T.green : "transparent",
              border: `3px solid ${amtNum === n ? T.green : T.border}`,
              color: amtNum === n ? "white" : T.sub,
              borderRadius: 30, padding: "7px 18px", fontSize: 15,
              fontWeight: 800, cursor: "pointer",
              fontFamily: "'Fredoka One', cursive",
              boxShadow: amtNum === n ? "3px 3px 0 #1A0A3C" : "none",
            }}>${n}</button>
          ))}
        </div>

        {!enoughFunds && amount && (
          <div style={{
            fontSize: 12, color: T.red, marginBottom: 12, fontWeight: 700,
          }}>
            ⚠️ Insufficient funds — you have ${((school?.green_balance || 0) / 100).toFixed(2)} available.
          </div>
        )}

        <Btn onClick={distribute}
          disabled={!enoughFunds || distributing || (distType === "classroom" && !toTeacher)}
          color={T.green} full>
          {distributing ? "⏳ Distributing..." : "💰 Distribute PBIS Budget"}
        </Btn>
      </Card>

      {/* History */}
      <Card>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 14 }}>
          📋 Distribution History
        </div>
        {distHistory.length === 0 ? (
          <div style={{ textAlign: "center", color: T.sub, padding: "20px 0", fontSize: 13 }}>
            No distributions yet.
          </div>
        ) : distHistory.map(d => (
          <div key={d.id} style={{
            background: T.panel, borderRadius: 12, padding: "14px 16px",
            marginBottom: 10, display: "flex", alignItems: "center",
            gap: 14, flexWrap: "wrap", border: `2px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 28 }}>
              {d.distribution_type === "equal" ? "⚖️" : "🏫"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: T.text }}>
                {d.note || d.pbis_category || "Distribution"}
              </div>
              <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>
                {new Date(d.created_at).toLocaleDateString()} · {d.pbis_category}
                {d.teachers && ` · ${d.teachers.teacher_name}`}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: T.greenL }}>
                ${((d.amount_total || 0) / 100).toFixed(2)}
              </div>
              <div style={{ fontSize: 11, color: T.sub }}>
                {d.distribution_type === "equal"
                  ? `$${((d.amount_per_unit || 0) / 100).toFixed(2)} × ${d.unit_count} classes`
                  : "single classroom"}
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── Load Budget tab ───────────────────────────────────────────────────────────
function LoadBudgetTab({ school }) {
  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 13, color: T.sub, marginBottom: 20, lineHeight: 1.7 }}>
        Load your school's PBIS budget here. Money goes into the school green pool.
        You then distribute it to classrooms. All transactions tracked for district reporting.
      </div>
      <Card style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏦</div>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 34, color: T.greenL, marginBottom: 4 }}>
          ${((school?.green_balance || 0) / 100).toFixed(2)}
        </div>
        <div style={{ fontSize: 13, color: T.sub, marginBottom: 16 }}>available in school PBIS pool</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 20,
          fontSize: 12, color: T.sub, flexWrap: "wrap" }}>
          <div>Loaded total: <strong style={{ color: T.text }}>
            ${((school?.green_loaded_total || 0) / 100).toFixed(2)}
          </strong></div>
          <div>Distributed: <strong style={{ color: T.text }}>
            ${((school?.green_distributed_total || 0) / 100).toFixed(2)}
          </strong></div>
        </div>
      </Card>
      <Card style={{ border: `3px dashed ${T.green}`, background: `${T.green}08` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
          <div style={{ fontSize: 48 }}>💳</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: T.greenL, marginBottom: 4 }}>
              Stripe — Coming Soon
            </div>
            <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.6 }}>
              Load PBIS budget directly from your school credit card or purchase order.
              School plan: $49/month, unlimited teachers.
            </div>
          </div>
        </div>
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10 }}>
          {[
            { label: "$500",   sub: "Small school"   },
            { label: "$1,000", sub: "Mid-size school" },
            { label: "$2,000", sub: "Large school"    },
            { label: "$5,000", sub: "District pilot"  },
          ].map(s => (
            <div key={s.label} style={{
              background: T.panel, borderRadius: 12, padding: "12px",
              textAlign: "center", border: `2px solid ${T.border}`, opacity: 0.6,
            }}>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: T.greenL }}>
                {s.label}
              </div>
              <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Classrooms tab ────────────────────────────────────────────────────────────
function ClassroomsTab({ school, teachers, showToast }) {
  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 13, color: T.sub, marginBottom: 16 }}>
        Teachers join using school code{" "}
        <strong style={{ color: T.purpleL, letterSpacing: 2 }}>{school?.join_code}</strong>.
      </div>
      {teachers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🏫</div>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: T.text, marginBottom: 8 }}>
            No teachers yet
          </div>
          <div style={{ fontSize: 13, color: T.sub, maxWidth: 360, margin: "0 auto" }}>
            Share your school join code{" "}
            <strong style={{ color: T.purpleL, letterSpacing: 2 }}>{school?.join_code}</strong>{" "}
            with teachers. They enter it during setup to link to your school.
          </div>
        </div>
      ) : teachers.map(t => (
        <div key={t.id} style={{
          background: T.panel2, border: `3px solid ${T.borderBold}`,
          borderRadius: 16, padding: "16px 18px", marginBottom: 10,
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
          boxShadow: "3px 3px 0 #1A0A3C",
        }}>
          <div style={{ fontSize: 32 }}>🍎</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{t.teacher_name}</div>
            <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>
              {t.class_name || "Class not set"} · {t.users?.email}
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: T.sub, marginBottom: 2 }}>🟢 Balance</div>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: T.greenL }}>
                ${((t.green_balance || 0) / 100).toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: T.sub, marginBottom: 2 }}>🟠 Goal</div>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: T.orangeL }}>
                {t.goal_current || 0}/{t.goal_amount || 5000}
              </div>
            </div>
          </div>
        </div>
      ))}

      <Card style={{ border: `3px dashed ${T.border}`, background: "transparent", textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>👩‍🏫</div>
        <div style={{ fontWeight: 800, fontSize: 14, color: T.text, marginBottom: 4 }}>Add a Teacher</div>
        <div style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>
          Share join code{" "}
          <strong style={{ color: T.purpleL, letterSpacing: 2 }}>{school?.join_code}</strong>{" "}
          — teachers enter it during account setup.
        </div>
        <Btn onClick={() => { navigator.clipboard?.writeText(school?.join_code || ""); }}
          color={T.purple} small>
          📋 Copy Join Code
        </Btn>
      </Card>
    </div>
  );
}

// ── Settings tab ──────────────────────────────────────────────────────────────
function SettingsTab({ school, showToast, onUpdateSchool }) {
  const [goalLabel,  setGoalLabel]  = useState(school?.school_goal_label  || "Field Trip");
  const [goalAmount, setGoalAmount] = useState((school?.school_goal_amount || 50000) / 100);
  const [saving,     setSaving]     = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onUpdateSchool({
        school_goal_label:  goalLabel,
        school_goal_amount: Math.round(Number(goalAmount) * 100),
      });
      showToast("✅ School goal updated!");
    } catch { showToast("❌ Failed to save"); }
    setSaving(false);
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <Card>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 16 }}>
          🏫 School Goal
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <Lbl>Goal Label</Lbl>
            <Field value={goalLabel} onChange={setGoalLabel} placeholder="e.g. Spring Field Trip"/>
          </div>
          <div>
            <Lbl>Target (orange bucks)</Lbl>
            <Field value={goalAmount} onChange={setGoalAmount} type="number" placeholder="50000"/>
          </div>
        </div>
        <div style={{ fontSize: 12, color: T.sub, marginBottom: 16, lineHeight: 1.6 }}>
          💡 The school goal is orange-denominated. When hit, you arrange the celebration
          through normal school channels. No money flows through the app.
        </div>
        <Btn onClick={save} disabled={saving} color={T.purple}>
          {saving ? "Saving..." : "Save Goal"}
        </Btn>
      </Card>

      <Card>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 8 }}>
          🔗 School Join Code
        </div>
        <div style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>
          Teachers enter this code during setup to link to your school.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            fontFamily: "'Fredoka One', cursive", fontSize: 28,
            color: T.purpleL, letterSpacing: 6, background: T.panel,
            borderRadius: 14, padding: "12px 20px",
            border: `3px solid ${T.borderBold}`, boxShadow: "3px 3px 0 #1A0A3C",
          }}>
            {school?.join_code}
          </div>
          <Btn onClick={() => { navigator.clipboard?.writeText(school?.join_code || "");
            showToast("📋 Copied!"); }} color={T.purple} small>
            📋 Copy
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function PrincipalDashboard({
  profile, onSignOut,
  school, teachers, distHistory,
  error, distributeGreen, updateSchool, createSchool,
}) {
  const [tab,   setTab]   = useState("overview");
  const [toast, setToast] = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const TABS = [
    { id: "overview",   label: "Overview",    emoji: "🏠" },
    { id: "distribute", label: "Distribute",  emoji: "💰" },
    { id: "load",       label: "Load Budget", emoji: "💳" },
    { id: "classrooms", label: "Classrooms",  emoji: "🏫" },
    { id: "settings",   label: "Settings",    emoji: "⚙️" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: T.sky,
      color: T.text, fontFamily: "'Nunito', sans-serif", paddingBottom: 60,
    }}>
      <style>{fontCSS}</style>
      <Toast msg={toast}/>
      <StarField count={15}/>

      {/* School creation modal for new principals */}
      {!school && <CreateSchoolModal onCreate={createSchool}/>}

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg,${T.panel},${T.sky})`,
        borderBottom: `3px solid ${T.borderBold}`,
        padding: "14px 24px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        position: "relative", zIndex: 10, boxShadow: "0 4px 0 #1A0A3C",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Bear size={44}/>
          <div>
            <div style={{
              fontFamily: "'Fredoka One', cursive", fontSize: 22,
              background: `linear-gradient(135deg,${T.blueL},${T.greenL})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              🏫 Principal Dashboard
            </div>
            <div style={{ fontSize: 12, color: T.sub }}>
              {school?.name || "Setting up school…"} · {school?.district || ""}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{
            background: T.panel2, border: `2px solid ${T.green}44`,
            borderRadius: 12, padding: "8px 14px", textAlign: "center",
            boxShadow: "3px 3px 0 #1A0A3C",
          }}>
            <div style={{ fontSize: 10, color: T.sub }}>🟢 PBIS Pool</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: T.greenL }}>
              ${((school?.green_balance || 0) / 100).toFixed(2)}
            </div>
          </div>
          <div style={{
            background: T.panel2, border: `2px solid ${T.border}`,
            borderRadius: 12, padding: "8px 14px", textAlign: "center",
            boxShadow: "3px 3px 0 #1A0A3C",
          }}>
            <div style={{ fontSize: 10, color: T.sub }}>Teachers</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: T.purpleL }}>
              {teachers.length}
            </div>
          </div>
          <button type="button" onClick={onSignOut} style={{
            background: "transparent", border: `2px solid ${T.border}`,
            color: T.sub, borderRadius: 10, padding: "7px 14px",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
          }}>Sign Out</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        padding: "12px 24px", display: "flex", gap: 8, flexWrap: "wrap",
        borderBottom: `2px solid ${T.borderBold}`, position: "relative", zIndex: 10,
      }}>
        {TABS.map(t => (
          <button type="button" key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? T.blue : "transparent",
            border: `3px solid ${tab === t.id ? T.blue : T.border}`,
            color: tab === t.id ? "white" : T.sub,
            borderRadius: 14, padding: "8px 16px", fontSize: 13,
            fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif",
            boxShadow: tab === t.id ? "3px 3px 0 #1A0A3C" : "none",
            transition: "all 0.2s",
          }}>{t.emoji} {t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px", position: "relative", zIndex: 5 }}>
        {error && (
          <div style={{
            background: `${T.red}22`, border: `2px solid ${T.red}`,
            borderRadius: 12, padding: "10px 14px",
            fontSize: 13, color: "#FCA5A5", marginBottom: 16, fontWeight: 700,
          }}>⚠️ {error}</div>
        )}
        {tab === "overview"   && school && <OverviewTab school={school} teachers={teachers}/>}
        {tab === "distribute" && school && <DistributeTab school={school} teachers={teachers}
          distHistory={distHistory} showToast={showToast} onDistribute={distributeGreen}/>}
        {tab === "load"       && school && <LoadBudgetTab school={school}/>}
        {tab === "classrooms" && school && <ClassroomsTab school={school} teachers={teachers}
          showToast={showToast}/>}
        {tab === "settings"   && school && <SettingsTab school={school}
          showToast={showToast} onUpdateSchool={updateSchool}/>}
      </div>
    </div>
  );
}

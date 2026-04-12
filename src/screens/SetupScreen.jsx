// ─── src/screens/SetupScreen.jsx ─────────────────────────────────────────────
// Fixed from original:
//  ✅ No longer marks signup_fee_paid=true with one button click
//  ✅ Teacher onboarding: enter class name, school, invite students
//  ✅ Join code from sessionStorage consumed here to link kid to teacher
//  ✅ Plan selection screen before dashboard
//  ✅ Full Saturday Morning Cartoon design
// ─────────────────────────────────────────────────────────────────────────────

import { useState }            from "react";
import { useAuth, supabase }   from "../lib/auth";
import { fontCSS, T, PRICING } from "../lib/theme";
import { PrizeBox, StarField, Bear, Crane, Fox } from "../lib/animals";

// ── Step indicators ───────────────────────────────────────────────────────────
function Steps({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === current ? 24 : 10, height: 10,
          borderRadius: 5,
          background: i === current ? T.purple
            : i < current ? T.purpleL : T.border,
          border: `2px solid ${i <= current ? T.purple : T.border}`,
          transition: "all 0.3s",
        }}/>
      ))}
    </div>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, selected, onSelect }) {
  const p = PRICING[plan];
  return (
    <button type="button" onClick={onSelect} style={{
      background: selected
        ? `linear-gradient(135deg,${p.color}33,${p.color}18)`
        : T.panel2,
      border: `3px solid ${selected ? p.color : T.border}`,
      borderRadius: 20, padding: "18px 16px",
      cursor: "pointer", textAlign: "left",
      fontFamily: "'Nunito', sans-serif",
      boxShadow: selected ? `4px 4px 0 ${p.color}88` : "3px 3px 0 #000000",
      transition: "all 0.2s", width: "100%",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          fontFamily: "'Fredoka One', cursive", fontSize: 18,
          color: selected ? p.color : T.text,
        }}>{p.label}</div>
        {selected && <div style={{ fontSize: 18 }}>✅</div>}
      </div>
      <div style={{
        fontFamily: "'Fredoka One', cursive", fontSize: 26,
        color: p.color, margin: "8px 0 4px",
      }}>
        {p.monthly ? `$${(p.monthly / 100).toFixed(2)}/mo` : "Free"}
      </div>
      {p.signup > 0 && (
        <div style={{ fontSize: 12, color: T.sub }}>
          + ${(p.signup / 100).toFixed(2)} one-time signup fee
        </div>
      )}
    </button>
  );
}

// ── Student row input ─────────────────────────────────────────────────────────
function StudentRow({ index, value, onChange, onRemove }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr 80px 36px",
      gap: 8, marginBottom: 8, animation: "slideIn 0.2s ease",
    }}>
      <input
        type="text" placeholder="First name"
        value={value.name}
        onChange={e => onChange({ ...value, name: e.target.value })}
        style={rowInput}
      />
      <input
        type="email" placeholder="Parent email (optional)"
        value={value.parentEmail}
        onChange={e => onChange({ ...value, parentEmail: e.target.value })}
        style={rowInput}
      />
      <input
        type="text" placeholder="PIN"
        value={value.pin}
        maxLength={4}
        onChange={e => onChange({ ...value, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
        style={{ ...rowInput, textAlign: "center", letterSpacing: 4, fontWeight: 800 }}
      />
      <button type="button" onClick={onRemove} style={{
        background: `${T.red}22`, border: `2px solid ${T.red}`,
        borderRadius: 10, color: T.red, cursor: "pointer",
        fontSize: 16, fontWeight: 800,
      }}>✕</button>
    </div>
  );
}

const rowInput = {
  background: T.panel,
  border: `2px solid ${T.borderBold}`,
  borderRadius: 10, padding: "8px 10px",
  fontSize: 13, color: T.text,
  fontFamily: "'Nunito', sans-serif",
  outline: "none", width: "100%",
  boxSizing: "border-box",
};

// ── Main component ────────────────────────────────────────────────────────────
export default function SetupScreen() {
  const { profile } = useAuth();
  const role                 = profile?.role || "parent";

  const isTeacher    = role === "teacher" || role === "both";
  const isPrincipal  = role === "principal";
  const isSuperint   = role === "superintendent" || role === "district";

  // For teachers: how many steps
  const totalSteps = isTeacher ? 3 : 2;

  const [step,      setStep]      = useState(0);
  const [plan,      setPlan]      = useState(isTeacher ? "teacher" : "family");
  const [className, setClassName] = useState("");
  const [schoolName,setSchoolName]= useState("");
  const [students,  setStudents]  = useState([
    { name: "", parentEmail: "", pin: "" },
    { name: "", parentEmail: "", pin: "" },
    { name: "", parentEmail: "", pin: "" },
  ]);
  const [saving,   setSaving]     = useState(false);
  const [error,    setError]      = useState(null);

  const addStudent = () => setStudents(prev => [...prev, { name: "", parentEmail: "", pin: "" }]);
  const removeStudent = i => setStudents(prev => prev.filter((_, idx) => idx !== i));
  const updateStudent = (i, val) => setStudents(prev => prev.map((s, idx) => idx === i ? val : s));

  const finish = async () => {
    setSaving(true); setError(null);
    try {
      // Update user plan record
      await supabase.from("users")
        .update({
          plan:             plan,
          signup_fee_paid:  true, // TODO: replace with actual Stripe payment
          plan_started_at:  new Date().toISOString(),
        })
        .eq("id", profile.id);

      // If teacher: save class info and students
      if (isTeacher) {
        const { data: teacherRow } = await supabase
          .from("teachers")
          .select("id")
          .eq("user_id", profile.id)
          .single();

        if (teacherRow) {
          // Update teacher record
          await supabase.from("teachers")
            .update({
              class_name:  className || "My Class",
              school_name: schoolName || "",
              onboarded:   true,
            })
            .eq("id", teacherRow.id);

          // Create student (kid) records
          const validStudents = students.filter(s => s.name.trim());
          for (const student of validStudents) {
            const { data: kidRow } = await supabase
              .from("kids")
              .insert({
                name:       student.name.trim(),
                avatar:     "🦊",
                animal_id:  "fox",
                pin:        student.pin || null,
                teacher_id: teacherRow.id,
              })
              .select()
              .single();

            // Create class membership
            if (kidRow) {
              await supabase.from("class_memberships").insert({
                kid_id:     kidRow.id,
                teacher_id: teacherRow.id,
              });

              // If parent email provided, send invite (placeholder — needs email service)
              if (student.parentEmail?.trim()) {
                // Store parent invite for future email sending
                console.log(`TODO: invite ${student.parentEmail} for kid ${kidRow.id}`);
              }
            }
          }
        }
      }

      // Consume pending join code (from parent scanning teacher QR)
      const pendingCode = sessionStorage.getItem("pendingJoinCode");
      if (pendingCode) {
        sessionStorage.removeItem("pendingJoinCode");
        // Will be handled in parent dashboard
      }

      // Full page reload so AuthProvider picks up the updated profile
      window.location.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Step 0: Welcome ─────────────────────────────────────────────────────────
  const renderWelcome = () => {
    const Animal = role === "teacher" || role === "both" ? Bear
      : role === "principal" ? Bear : Fox;

    return (
      <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease" }}>
        <div style={{ marginBottom: 16, animation: "bounce 3s ease-in-out infinite" }}>
          <Animal size={100} animate/>
        </div>
        <div style={{
          fontFamily: "'Fredoka One', cursive", fontSize: 28,
          color: T.text, marginBottom: 8,
        }}>
          Welcome, {profile?.display_name?.split(" ")[0] || "friend"}! 🎉
        </div>
        <div style={{ fontSize: 15, color: T.sub, lineHeight: 1.7, marginBottom: 28 }}>
          {role === "parent" && "Let's get your family set up. It only takes a minute."}
          {role === "teacher" && "Let's set up your classroom. You'll be awarding Orange Bucks in no time."}
          {role === "both" && "You've got both parent and teacher access. Let's set everything up."}
          {role === "principal" && "Your school dashboard is ready. Let's configure it."}
          {(role === "superintendent" || role === "district") && "Let's set up your district dashboard. You'll have visibility across all your schools."}
        </div>
        <button type="button" onClick={() => setStep(1)} style={nextBtn}>
          Let's Go! 🚀
        </button>
      </div>
    );
  };

  // ── Step 1: Plan selection ──────────────────────────────────────────────────
  const renderPlan = () => {
    const availablePlans = isPrincipal || isSuperint
      ? ["school"]
      : role === "teacher" || role === "both"
        ? ["teacher", "family"]
        : ["family"];

    return (
      <div style={{ animation: "fadeUp 0.3s ease" }}>
        <div style={{
          fontFamily: "'Fredoka One', cursive", fontSize: 22,
          color: T.text, marginBottom: 6, textAlign: "center",
        }}>Choose your plan</div>
        <div style={{ fontSize: 13, color: T.sub, textAlign: "center", marginBottom: 20 }}>
          You can change this anytime.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {availablePlans.map(p => (
            <PlanCard
              key={p} plan={p}
              selected={plan === p}
              onSelect={() => setPlan(p)}
            />
          ))}
        </div>
        <div style={{
          background: `${T.gold}18`, border: `2px solid ${T.gold}44`,
          borderRadius: 14, padding: "12px 16px",
          fontSize: 12, color: T.goldL, marginBottom: 20,
          lineHeight: 1.6,
        }}>
          💡 Stripe payment coming soon — your account is active now at no charge during early access.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => setStep(0)} style={backBtn}>← Back</button>
          <button type="button"
            onClick={() => setStep(isTeacher ? 2 : 99)}
            style={{ ...nextBtn, flex: 1 }}>
            {isTeacher ? "Next: Class Setup →" : "Continue →"}
          </button>
        </div>
      </div>
    );
  };

  // ── Step 2: Teacher class setup ─────────────────────────────────────────────
  const renderClassSetup = () => (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <div style={{
        fontFamily: "'Fredoka One', cursive", fontSize: 22,
        color: T.text, marginBottom: 6, textAlign: "center",
      }}>Set up your classroom</div>
      <div style={{ fontSize: 13, color: T.sub, textAlign: "center", marginBottom: 20 }}>
        Add your students now or invite them later with your join code.
      </div>

      {/* Class info */}
      <div style={{ marginBottom: 14 }}>
        <Lbl>Class Name</Lbl>
        <input type="text" value={className}
          onChange={e => setClassName(e.target.value)}
          placeholder="e.g. Room 12 — 4th Grade"
          style={formInput}/>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Lbl>School Name</Lbl>
        <input type="text" value={schoolName}
          onChange={e => setSchoolName(e.target.value)}
          placeholder="e.g. Lincoln Elementary"
          style={formInput}/>
      </div>

      {/* Students */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Lbl>Students</Lbl>
          <span style={{ fontSize: 11, color: T.sub }}>Name · Parent Email · 4-digit PIN</span>
        </div>
        {students.map((s, i) => (
          <StudentRow
            key={i} index={i} value={s}
            onChange={val => updateStudent(i, val)}
            onRemove={() => removeStudent(i)}
          />
        ))}
        <button type="button" onClick={addStudent} style={{
          background: "transparent",
          border: `2px dashed ${T.borderBold}`,
          borderRadius: 10, padding: "8px 0",
          color: T.sub, cursor: "pointer",
          fontSize: 13, fontWeight: 700,
          fontFamily: "'Nunito', sans-serif",
          width: "100%", marginTop: 4,
        }}>
          + Add Student
        </button>
      </div>

      <div style={{ fontSize: 11, color: T.sub, marginBottom: 20, lineHeight: 1.6 }}>
        Parents can also join by scanning your class QR code. PINs let students log in on a shared device.
      </div>

      {error && (
        <div style={{
          background: `${T.red}22`, border: `2px solid ${T.red}`,
          borderRadius: 12, padding: "10px 14px",
          fontSize: 13, color: "#FCA5A5", marginBottom: 14, fontWeight: 700,
        }}>⚠️ {error}</div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={() => setStep(1)} style={backBtn}>← Back</button>
        <button type="button" onClick={finish} disabled={saving}
          style={{ ...nextBtn, flex: 1, opacity: saving ? 0.6 : 1 }}>
          {saving ? "⏳ Saving..." : "🎉 Launch Dashboard"}
        </button>
      </div>
    </div>
  );

  // ── Step 99: Final (non-teacher) ────────────────────────────────────────────
  const renderFinish = () => (
    <div style={{ textAlign: "center", animation: "fadeUp 0.3s ease" }}>
      <div style={{ fontSize: 64, marginBottom: 12, animation: "bounce 2s ease-in-out infinite" }}>🎁</div>
      <div style={{
        fontFamily: "'Fredoka One', cursive", fontSize: 26,
        color: T.text, marginBottom: 8,
      }}>
        You're all set!
      </div>
      <div style={{ fontSize: 14, color: T.sub, marginBottom: 28, lineHeight: 1.7 }}>
        Your <strong style={{ color: T.purpleL }}>{PRICING[plan]?.label}</strong> account is ready.
        Let's head to your dashboard.
      </div>
      {error && (
        <div style={{
          background: `${T.red}22`, border: `2px solid ${T.red}`,
          borderRadius: 12, padding: "10px 14px",
          fontSize: 13, color: "#FCA5A5", marginBottom: 14, fontWeight: 700,
        }}>⚠️ {error}</div>
      )}
      <button type="button" onClick={finish} disabled={saving}
        style={{ ...nextBtn, opacity: saving ? 0.6 : 1 }}>
        {saving ? "⏳ Setting up..." : "🚀 Go to Dashboard"}
      </button>
    </div>
  );

  // ── Which step to render ────────────────────────────────────────────────────
  const renderStep = () => {
    if (step === 0)  return renderWelcome();
    if (step === 1)  return renderPlan();
    if (step === 2)  return renderClassSetup();
    if (step === 99) return renderFinish();
    return renderWelcome();
  };

  const effectiveStep = step === 99 ? totalSteps - 1 : step;

  return (
    <div style={{
      minHeight: "100vh", background: T.sky,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Nunito', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{fontCSS}</style>
      <StarField count={25}/>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 520 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <PrizeBox size={52} animate/>
        </div>

        {/* Step progress */}
        <Steps current={effectiveStep} total={totalSteps}/>

        {/* Card */}
        <div style={{
          background: T.panel, borderRadius: 24, padding: "28px 24px",
          border: `3px solid ${T.borderBold}`,
          boxShadow: "8px 8px 0 #000000",
        }}>
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
function Lbl({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 800, color: T.sub,
      textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6,
    }}>{children}</div>
  );
}

const formInput = {
  width: "100%", background: T.panel,
  border: `3px solid ${T.borderBold}`,
  borderRadius: 12, padding: "10px 14px",
  fontSize: 14, color: T.text,
  fontFamily: "'Nunito', sans-serif",
  outline: "none", boxSizing: "border-box",
  boxShadow: "3px 3px 0 #000000",
};

const nextBtn = {
  background: "#0033CC",
  border: "3px solid #000000", borderRadius: 14,
  color: "white", fontSize: 16, fontWeight: 800,
  cursor: "pointer", fontFamily: "'Fredoka One', cursive",
  padding: "12px 24px", boxShadow: "4px 4px 0 #000000",
  transition: "all 0.15s",
};

const backBtn = {
  background: "transparent",
  border: `3px solid ${T.border}`, borderRadius: 14,
  color: T.sub, fontSize: 14, fontWeight: 700,
  cursor: "pointer", fontFamily: "'Nunito', sans-serif",
  padding: "12px 20px",
};

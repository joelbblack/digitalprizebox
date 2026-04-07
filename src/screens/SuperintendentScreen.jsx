// ─── src/screens/SuperintendentScreen.jsx ────────────────────────────────────
// + SuperintendentDashboard inline (small enough to keep together)
// Read-only view across all schools in district.
// District size survey → auto-quote on first login.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useAuth, supabase }   from "../lib/auth";
import { LoadingScreen, Owl, StarField, Toast } from "../lib/animals";
import { fontCSS, T, DISTRICT_TIERS, benday } from "../lib/theme";

// ── useDistrictData hook ──────────────────────────────────────────────────────
function useDistrictData(userId) {
  const [district,  setDistrict]  = useState(null);
  const [schools,   setSchools]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Get district for this superintendent
      const { data: distData } = await supabase
        .from("districts")
        .select("*")
        .eq("superintendent_id", userId)
        .single();

      setDistrict(distData || null);

      if (distData) {
        const { data: schoolsData } = await supabase
          .from("schools")
          .select(`
            *,
            teachers ( id, teacher_name, class_name, green_balance, goal_current, goal_amount,
              kids ( count )
            )
          `)
          .eq("district_id", distData.id)
          .order("name");
        setSchools(schoolsData || []);
      }
      setError(null);
    } catch (err) {
      console.error("District data error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createDistrict = async (surveyData) => {
    const tier = getTierFromStudents(surveyData.studentCount);
    const { data, error } = await supabase.from("districts").insert({
      name:              surveyData.districtName,
      state:             surveyData.state,
      student_count:     surveyData.studentCount,
      school_count:      surveyData.schoolCount,
      tier,
      superintendent_id: userId,
      survey_data:       surveyData,
    }).select().single();
    if (error) throw error;

    // Link user to district
    await supabase.from("users").update({ district_id: data.id }).eq("id", userId);
    await fetchAll();
    return data;
  };

  return { district, schools, loading, error, createDistrict, refresh: fetchAll };
}

function getTierFromStudents(count) {
  if (count < 2500)  return "micro";
  if (count < 10000) return "small";
  if (count < 50000) return "medium";
  if (count < 150000)return "large";
  return "enterprise";
}

// ── District survey modal (new superintendents) ───────────────────────────────
function DistrictSurveyModal({ onComplete }) {
  const [step,   setStep]   = useState(0);
  const [form,   setForm]   = useState({
    districtName: "", state: "CA",
    studentCount: "", schoolCount: "",
    currentPbis: "", role: "Superintendent",
  });
  const [saving, setSaving] = useState(false);
  const [quote,  setQuote]  = useState(null);

  const count  = Number(form.studentCount);
  const tier   = getTierFromStudents(count);
  const tierInfo = DISTRICT_TIERS.find(t => t.id === tier);

  const calcQuote = () => {
    setQuote(tierInfo);
    setStep(2);
  };

  const finish = async () => {
    setSaving(true);
    try { await onComplete({ ...form, studentCount: count, schoolCount: Number(form.schoolCount) }); }
    catch (e) { console.error(e); }
    setSaving(false);
  };

  const inp = {
    width: "100%", background: T.sky,
    border: `3px solid ${T.borderBold}`, borderRadius: 12,
    padding: "10px 14px", fontSize: 15, color: T.text,
    fontFamily: "'Nunito', sans-serif", outline: "none",
    boxSizing: "border-box", boxShadow: "3px 3px 0 #000000",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: T.panel, borderRadius: 28, padding: "36px 32px",
        border: `3px solid ${T.borderBold}`, width: "100%", maxWidth: 520,
        boxShadow: "8px 8px 0 #000000",
      }}>

        {/* Step 0: District info */}
        {step === 0 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Owl size={72} animate/>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 24,
                color: T.text, marginTop: 8 }}>Tell us about your district</div>
              <div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>
                We'll find the right plan for your district's size.
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.sub,
                textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>District Name</div>
              <input value={form.districtName}
                onChange={e => setForm(p => ({ ...p, districtName: e.target.value }))}
                placeholder="e.g. Redlands Unified School District"
                style={inp}/>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.sub,
                  textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>City / Region</div>
                <input value={form.city || ""}
                  onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                  placeholder="Redlands" style={inp}/>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.sub,
                  textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>State</div>
                <input value={form.state}
                  onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                  placeholder="CA" style={inp}/>
              </div>
            </div>
            <button type="button" onClick={() => setStep(1)}
              disabled={!form.districtName.trim()}
              style={{
                width: "100%", padding: "13px 0",
                background: !form.districtName.trim() ? T.border
                  : "#3B82F6",
                border: "3px solid #000000", borderRadius: 14,
                color: "white", fontSize: 17, fontWeight: 800,
                cursor: !form.districtName.trim() ? "not-allowed" : "pointer",
                fontFamily: "'Fredoka One', cursive",
                boxShadow: !form.districtName.trim() ? "none" : "4px 4px 0 #000000",
                opacity: !form.districtName.trim() ? 0.5 : 1,
              }}>Next →</button>
          </>
        )}

        {/* Step 1: Size */}
        {step === 1 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22,
                color: T.text }}>How big is your district?</div>
              <div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>
                This helps us calculate your plan.
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.sub,
                  textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
                  Approximate Students
                </div>
                <input type="number" value={form.studentCount}
                  onChange={e => setForm(p => ({ ...p, studentCount: e.target.value }))}
                  placeholder="e.g. 8500" style={inp}/>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.sub,
                  textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
                  Number of Schools
                </div>
                <input type="number" value={form.schoolCount}
                  onChange={e => setForm(p => ({ ...p, schoolCount: e.target.value }))}
                  placeholder="e.g. 12" style={inp}/>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.sub,
                textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
                Current PBIS System (optional)
              </div>
              <input value={form.currentPbis}
                onChange={e => setForm(p => ({ ...p, currentPbis: e.target.value }))}
                placeholder="e.g. Positive Behavior Interventions, ClassDojo…" style={inp}/>
            </div>

            {/* Tier preview */}
            {form.studentCount && (
              <div style={{
                background: "#FFFFFF", border: `2px solid ${T.blue}`,
                borderRadius: 14, padding: "12px 16px", marginBottom: 16,
              }}>
                <div style={{ fontSize: 12, color: T.blueL, fontWeight: 700, marginBottom: 4 }}>
                  Estimated tier: <strong>{tierInfo?.label}</strong>
                </div>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: T.blueL }}>
                  {tierInfo?.price}
                </div>
                <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>
                  {tierInfo?.students} students · {tierInfo?.example}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => setStep(0)} style={{
                background: "transparent", border: `3px solid ${T.border}`,
                borderRadius: 14, color: T.sub, fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Nunito', sans-serif", padding: "12px 20px",
              }}>← Back</button>
              <button type="button" onClick={calcQuote}
                disabled={!form.studentCount}
                style={{
                  flex: 1, padding: "13px 0",
                  background: !form.studentCount ? T.border
                    : "#3B82F6",
                  border: "3px solid #000000", borderRadius: 14,
                  color: "white", fontSize: 17, fontWeight: 800,
                  cursor: !form.studentCount ? "not-allowed" : "pointer",
                  fontFamily: "'Fredoka One', cursive",
                  boxShadow: !form.studentCount ? "none" : "4px 4px 0 #000000",
                  opacity: !form.studentCount ? 0.5 : 1,
                }}>See My Quote →</button>
            </div>
          </>
        )}

        {/* Step 2: Quote */}
        {step === 2 && quote && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22,
                color: T.text }}>Your District Plan</div>
            </div>
            <div style={{
              background: "#FFFFFF", border: `3px solid ${T.blue}`,
              borderRadius: 20, padding: "24px", textAlign: "center",
              marginBottom: 20, boxShadow: "4px 4px 0 #000000",
            }}>
              <div style={{ fontSize: 13, color: T.blueL, fontWeight: 700, marginBottom: 4 }}>
                {quote.label} District
              </div>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 36, color: T.blueL }}>
                {quote.price}
              </div>
              <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>
                {quote.students} students · {form.schoolCount} schools
              </div>
              {quote.id === "enterprise" && (
                <div style={{
                  background: "#FFFFFF", border: `2px solid ${T.pink}`,
                  borderRadius: 12, padding: "10px 14px", marginTop: 16,
                  fontSize: 13, color: T.pink, fontWeight: 700,
                }}>
                  Enterprise districts get custom pricing and dedicated support.
                  We'll be in touch within 1 business day.
                </div>
              )}
            </div>
            <div style={{
              background: "#FFFFFF", border: `2px solid ${T.gold}`,
              borderRadius: 14, padding: "12px 16px", marginBottom: 20,
              fontSize: 12, color: T.goldL, lineHeight: 1.6,
            }}>
              💡 Stripe billing coming soon. Your dashboard is active now during early access.
            </div>
            <button type="button" onClick={finish} disabled={saving} style={{
              width: "100%", padding: "13px 0",
              background: saving ? T.border : "#0033CC",
              border: "3px solid #000000", borderRadius: 14,
              color: "white", fontSize: 17, fontWeight: 800,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "'Fredoka One', cursive",
              boxShadow: saving ? "none" : "4px 4px 0 #000000",
            }}>
              {saving ? "⏳ Setting up..." : "🚀 Open District Dashboard"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
function SuperintendentDashboard({ profile, onSignOut, district, schools, error, createDistrict }) {
  const [tab,   setTab]   = useState("overview");
  const [toast, setToast] = useState(null);
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const totalTeachers = schools.reduce((a, s) => a + (s.teachers?.length || 0), 0);
  const totalKids     = schools.reduce((a, s) =>
    a + (s.teachers || []).reduce((b, t) => b + (t.kids?.[0]?.count || 0), 0), 0);
  const totalGreenPool = schools.reduce((a, s) => a + (s.green_balance || 0), 0);

  const tierInfo = district ? DISTRICT_TIERS.find(t => t.id === district.tier) : null;

  const TABS = [
    { id: "overview", label: "Overview",  emoji: "🏠" },
    { id: "schools",  label: "Schools",   emoji: "🏫" },
    { id: "reports",  label: "Reports",   emoji: "📊" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: T.sky,
      color: T.text, fontFamily: "'Nunito', sans-serif", paddingBottom: 60,
    }}>
      <style>{fontCSS}</style>
      <Toast msg={toast}/>
      <StarField count={15}/>

      {/* Survey modal for new superintendents */}
      {!district && <DistrictSurveyModal onComplete={createDistrict}/>}

      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.95)",
        borderBottom: `3px solid ${T.borderBold}`,
        padding: "14px 24px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        position: "relative", zIndex: 10, boxShadow: "0 3px 0 #000000",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Owl size={44}/>
          <div>
            <div style={{
              fontFamily: "'Fredoka One', cursive", fontSize: 22,
              color: T.purple,
            }}>
              🎓 Superintendent Dashboard
            </div>
            <div style={{ fontSize: 12, color: T.sub }}>
              {district?.name || "Setting up district…"}
              {tierInfo && ` · ${tierInfo.label} · ${tierInfo.price}`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{
            background: T.panel2, border: `2px solid ${T.border}`,
            borderRadius: 12, padding: "8px 14px", textAlign: "center",
            boxShadow: "3px 3px 0 #000000",
          }}>
            <div style={{ fontSize: 10, color: T.sub }}>Schools</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: T.blueL }}>
              {schools.length}
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

      {/* Read-only banner */}
      <div style={{
        background: "#FFFFFF", borderBottom: `2px solid ${T.blue}`,
        padding: "8px 24px", fontSize: 12, color: T.blueL, fontWeight: 700,
        position: "relative", zIndex: 10, textAlign: "center",
      }}>
        👁️ Read-only view — contact individual principals to make changes
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
            boxShadow: tab === t.id ? "3px 3px 0 #000000" : "none",
            transition: "all 0.2s",
          }}>{t.emoji} {t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px", position: "relative", zIndex: 5 }}>
        {error && (
          <div style={{
            background: "#FFFFFF", border: `2px solid ${T.red}`,
            borderRadius: 12, padding: "10px 14px",
            fontSize: 13, color: "#FCA5A5", marginBottom: 16, fontWeight: 700,
          }}>⚠️ {error}</div>
        )}

        {/* Overview */}
        {tab === "overview" && district && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
              gap: 12, marginBottom: 20,
            }}>
              {[
                { label: "Schools",      value: schools.length,  color: T.blue,   sub: "in your district" },
                { label: "Teachers",     value: totalTeachers,   color: T.purple, sub: "across all schools" },
                { label: "Students",     value: totalKids,       color: T.orange, sub: "enrolled" },
                { label: "PBIS Pools",   value: `$${(totalGreenPool / 100).toFixed(0)}`,
                  color: T.green, sub: "loaded across schools" },
              ].map(m => (
                <div key={m.label} style={{
                  background: T.panel2, borderRadius: 16, padding: "16px",
                  border: `3px solid ${T.borderBold}`, boxShadow: "3px 3px 0 #000000",
                }}>
                  <div style={{ fontSize: 10, color: T.sub, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 26, color: m.color }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* District info card */}
            <div style={{
              background: T.panel2, borderRadius: 20, padding: "20px",
              border: `3px solid ${T.borderBold}`, boxShadow: "4px 4px 0 #000000",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>{district.name}</div>
                  <div style={{ fontSize: 12, color: T.sub }}>{district.state}</div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{
                    background: T.panel, borderRadius: 12, padding: "8px 16px",
                    textAlign: "center", border: `2px solid ${T.border}`,
                  }}>
                    <div style={{ fontSize: 10, color: T.sub }}>Plan</div>
                    <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: T.blueL }}>
                      {tierInfo?.label}
                    </div>
                  </div>
                  <div style={{
                    background: T.panel, borderRadius: 12, padding: "8px 16px",
                    textAlign: "center", border: `2px solid ${T.border}`,
                  }}>
                    <div style={{ fontSize: 10, color: T.sub }}>Price</div>
                    <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: T.greenL }}>
                      {tierInfo?.price}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schools */}
        {tab === "schools" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {schools.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🏫</div>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22,
                  color: T.text, marginBottom: 8 }}>No schools linked yet</div>
                <div style={{ fontSize: 13, color: T.sub, marginBottom: 16 }}>
                  Share your district join code with principals during their school setup.
                </div>
                <div style={{
                  display: "inline-block", background: "#FFFFFF",
                  border: `3px solid ${T.borderBold}`, borderRadius: 14,
                  padding: "14px 28px", boxShadow: "4px 4px 0 #000000",
                }}>
                  <div style={{ fontSize: 11, color: T.sub, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Join Code</div>
                  <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28,
                    color: T.purple, letterSpacing: 2 }}>{district?.join_code}</div>
                </div>
              </div>
            ) : schools.map(school => {
              const teachers = school.teachers || [];
              const greenPool = school.green_balance || 0;
              const goalPct = Math.min(100, Math.round(
                ((school.school_goal_current || 0) / (school.school_goal_amount || 50000)) * 100
              ));
              return (
                <div key={school.id} style={{
                  background: T.panel2, border: `3px solid ${T.borderBold}`,
                  borderLeft: `8px solid ${T.blue}`,
                  borderRadius: 20, padding: "18px", marginBottom: 14,
                  boxShadow: "4px 4px 0 #000000",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>{school.name}</div>
                      <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>
                        {school.city} · {teachers.length} teachers
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: T.sub }}>🟢 PBIS Pool</div>
                        <div style={{ fontFamily: "'Fredoka One', cursive",
                          fontSize: 16, color: T.greenL }}>
                          ${(greenPool / 100).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: T.sub }}>Plan</div>
                        <div style={{ fontFamily: "'Fredoka One', cursive",
                          fontSize: 16, color: T.blueL }}>
                          {school.plan === "district" ? "District" : "School"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* School goal bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between",
                      fontSize: 11, color: T.sub, marginBottom: 4 }}>
                      <span>🎯 {school.school_goal_label || "School Goal"}</span>
                      <span style={{ color: T.goldL }}>{goalPct}%</span>
                    </div>
                    <div style={{ background: T.panel, borderRadius: 20,
                      height: 8, overflow: "hidden", border: `2px solid ${T.border}` }}>
                      <div style={{
                        width: `${goalPct}%`, height: "100%", borderRadius: 20,
                        background: "linear-gradient(90deg,#FFD700,#F97316)",
                        transition: "width 0.5s",
                      }}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reports */}
        {tab === "reports" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: 13, color: T.sub, marginBottom: 20 }}>
              District-wide engagement data. Export coming soon.
            </div>
            {schools.length === 0 ? (
              <div style={{ textAlign: "center", color: T.sub, padding: "40px 0" }}>
                No data yet — link schools to your district first.
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                gap: 14,
              }}>
                {[
                  { label: "Total Schools",   value: schools.length,  color: T.blue,   emoji: "🏫" },
                  { label: "Total Teachers",  value: totalTeachers,   color: T.purple, emoji: "👩‍🏫" },
                  { label: "Total Students",  value: totalKids,       color: T.orange, emoji: "👦" },
                  { label: "PBIS Loaded",     value: `$${(totalGreenPool / 100).toFixed(0)}`,
                    color: T.green, emoji: "💳" },
                ].map(s => (
                  <div key={s.label} style={{
                    background: T.panel2, border: `3px solid ${T.borderBold}`,
                    borderRadius: 18, padding: "18px 16px", textAlign: "center",
                    boxShadow: "4px 4px 0 #000000",
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{s.emoji}</div>
                    <div style={{ fontFamily: "'Fredoka One', cursive",
                      fontSize: 28, color: s.color, marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: T.text }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{
              background: T.panel2, border: `3px dashed #000000`,
              borderRadius: 18, padding: "24px", marginTop: 20, textAlign: "center",
              boxShadow: "4px 4px 0 #000000",
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📤</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: T.text, marginBottom: 4 }}>
                Export Reports
              </div>
              <div style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>
                CSV export for district reporting — coming soon.
              </div>
              <button type="button" disabled style={{
                background: "transparent", border: `2px solid ${T.border}`,
                borderRadius: 30, padding: "8px 20px", color: T.sub,
                fontSize: 13, fontWeight: 700, cursor: "not-allowed",
                fontFamily: "'Nunito', sans-serif",
              }}>📤 Export CSV (Coming Soon)</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Screen wrapper ────────────────────────────────────────────────────────────
export default function SuperintendentScreen() {
  const { profile, signOut } = useAuth();
  const data = useDistrictData(profile?.id);
  const handleSignOut = async () => { await signOut(); window.location.href = "/"; };

  if (data.loading) return (
    <><style>{fontCSS}</style><LoadingScreen message="Loading your district dashboard…"/></>
  );

  return <SuperintendentDashboard profile={profile} onSignOut={handleSignOut} {...data}/>;
}

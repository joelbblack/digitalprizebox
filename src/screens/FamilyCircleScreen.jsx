// ─── src/screens/FamilyCircleScreen.jsx ──────────────────────────────────────
// Simplified read-only view for family circle members (grandparents, aunts, etc.)
// They see kid progress, can send birthday orange gifts, get notifications.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect }   from "react";
import { useAuth, supabase }     from "../lib/auth";
import { fontCSS, T }            from "../lib/theme";
import { Fox, StarField, Toast, LoadingScreen, getAnimal } from "../lib/animals";

export default function FamilyCircleScreen() {
  const { profile, signOut }    = useAuth();
  const [kids,    setKids]      = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast,   setToast]     = useState(null);
  const [gifting, setGifting]   = useState(null);
  const [giftAmt, setGiftAmt]   = useState(25);
  const [loadingKid, setLoadingKid] = useState(null);
  const [loadAmt,    setLoadAmt]    = useState(10);
  const [submitting, setSubmitting] = useState(false);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  // Handle Stripe Checkout return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("load");
    if (!status) return;

    if (status === "success") {
      showToast("🎉 Green dollars loaded! Balance updates in a moment.");
    } else if (status === "cancelled") {
      showToast("Deposit cancelled — no charge made.");
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("load");
    url.searchParams.delete("session_id");
    window.history.replaceState({}, "", url.toString());
  }, []);

  const startGreenLoad = async (kidId, kidName, amount) => {
    if (!amount || amount < 1) return showToast("Pick at least $1.");
    if (amount > 500)          return showToast("Max load is $500.");
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
          kidId,
          kidName,
          amountCents: Math.round(amount * 100),
          returnPath:  "/family",
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
      console.error("Family green load error:", err);
      showToast("Something went wrong starting checkout.");
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!profile) return;
    // Load kids this family member has access to
    supabase
      .from("kid_family_members")
      .select("*, kids(*, jars(*), teachers(goal_label, goal_amount, goal_current))")
      .eq("auth_id", profile.auth_id)
      .eq("invite_status", "accepted")
      .then(({ data }) => {
        setKids((data || []).map(m => m.kids).filter(Boolean));
        setLoading(false);
      });
  }, [profile]);

  const sendGift = async (kidId, amount) => {
    const kid = kids.find(k => k.id === kidId);
    if (!kid) return;
    try {
      const { data: kidData } = await supabase
        .from("kids").select("orange_balance").eq("id", kidId).single();
      await supabase.from("kids").update({
        orange_balance: (kidData.orange_balance || 0) + amount,
      }).eq("id", kidId);
      await supabase.from("orange_awards").insert({
        kid_id: kidId, awarded_by: profile.id,
        source: "parent", amount,
        reason: `🎁 Birthday gift from ${profile.display_name}!`,
      });
      showToast(`🎁 ${amount} 🟠 sent to ${kid.name}!`);
      setGifting(null);
    } catch { showToast("❌ Gift failed — try again"); }
  };

  if (loading) return <LoadingScreen message="Loading family view…"/>;

  return (
    <div style={{ minHeight: "100vh", background: T.sky,
      fontFamily: "'Nunito', sans-serif", paddingBottom: 60 }}>
      <style>{fontCSS}</style>
      <Toast msg={toast}/>
      <StarField count={20}/>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg,${T.panel},${T.sky})`,
        borderBottom: `3px solid ${T.borderBold}`,
        padding: "16px 24px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 0 #000000", position: "relative", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Fox size={40}/>
          <div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20,
              color: T.purple }}>
              Family View
            </div>
            <div style={{ fontSize: 12, color: T.sub }}>
              {profile?.display_name} · Digital Prize Box
            </div>
          </div>
        </div>
        <button type="button" onClick={async () => { await signOut(); window.location.href = "/"; }}
          style={{ background: "transparent", border: `2px solid ${T.border}`,
            color: T.sub, borderRadius: 10, padding: "7px 14px",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Nunito', sans-serif" }}>Sign Out</button>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px",
        position: "relative", zIndex: 5 }}>

        {kids.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ marginBottom: 16 }}><Fox size={80} animate/></div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 24,
              color: T.text, marginBottom: 8 }}>No kids linked yet</div>
            <div style={{ fontSize: 14, color: T.sub, lineHeight: 1.7 }}>
              Ask the parent to invite you through their Family Circle tab.
              You'll get a link to accept the invite.
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22,
              color: T.text, marginBottom: 20 }}>
              👨‍👩‍👧 Your Family
            </div>
            {kids.map(kid => {
              const animal = getAnimal(kid.animal_id || "fox");
              const teacher = kid.teachers;
              const jars = kid.jars || [];
              const goalPct = teacher
                ? Math.min(100, Math.round(((teacher.goal_current || 0) / (teacher.goal_amount || 5000)) * 100))
                : 0;

              return (
                <div key={kid.id} style={{
                  background: T.panel2, border: `3px solid ${T.borderBold}`,
                  borderRadius: 24, padding: "20px", marginBottom: 20,
                  boxShadow: "6px 6px 0 #000000",
                }}>
                  {/* Kid header */}
                  <div style={{ display: "flex", alignItems: "center",
                    gap: 14, marginBottom: 16 }}>
                    <animal.Component size={64}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Fredoka One', cursive",
                        fontSize: 22, color: T.text }}>{kid.name}</div>
                      <div style={{ fontSize: 12, color: T.sub }}>
                        ✅ {kid.chores_completed || 0} chores completed
                      </div>
                    </div>
                  </div>

                  {/* Balances */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
                    gap: 10, marginBottom: 16 }}>
                    <div style={{ background: `${T.green}18`, border: `2px solid ${T.green}`,
                      borderRadius: 14, padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: T.greenL, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>🟢 Green</div>
                      <div style={{ fontFamily: "'Fredoka One', cursive",
                        fontSize: 22, color: T.greenL }}>
                        ${((kid.green_balance || 0) / 100).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ background: `${T.orange}18`, border: `2px solid ${T.orange}`,
                      borderRadius: 14, padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: T.orangeL, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>🟠 Orange</div>
                      <div style={{ fontFamily: "'Fredoka One', cursive",
                        fontSize: 22, color: T.orangeL }}>
                        {kid.orange_balance || 0}
                      </div>
                    </div>
                  </div>

                  {/* Class goal */}
                  {teacher && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between",
                        fontSize: 12, color: T.sub, marginBottom: 4 }}>
                        <span>🎯 {teacher.goal_label || "Class Goal"}</span>
                        <span style={{ color: T.goldL }}>{goalPct}%</span>
                      </div>
                      <div style={{ background: T.panel, borderRadius: 20,
                        height: 8, overflow: "hidden", border: `2px solid ${T.border}` }}>
                        <div style={{ width: `${goalPct}%`, height: "100%", borderRadius: 20,
                          background: "linear-gradient(90deg,#FFD700,#F97316)",
                          transition: "width 0.5s" }}/>
                      </div>
                    </div>
                  )}

                  {/* Active jars */}
                  {jars.filter(j => j.status === "saving").length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.sub,
                        marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                        ⭐ Saving toward
                      </div>
                      {jars.filter(j => j.status === "saving").map(jar => {
                        const pct = Math.min(100, Math.round(
                          ((jar.orange_confirmed || 0) / (jar.orange_required || 1)) * 100
                        ));
                        return (
                          <div key={jar.id} style={{
                            background: T.panel, borderRadius: 12,
                            padding: "10px 14px", marginBottom: 8,
                            border: `2px solid ${T.border}`,
                            display: "flex", alignItems: "center", gap: 10,
                          }}>
                            <div style={{ fontSize: 28 }}>{jar.product_emoji || "⭐"}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>
                                {jar.product_name}
                              </div>
                              <div style={{ background: T.sky, borderRadius: 10,
                                height: 6, marginTop: 4, overflow: "hidden" }}>
                                <div style={{ width: `${pct}%`, height: "100%",
                                  background: T.orange, borderRadius: 10 }}/>
                              </div>
                              <div style={{ fontSize: 10, color: T.sub, marginTop: 2 }}>
                                {pct}% saved
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Load green dollars panel */}
                  {loadingKid === kid.id ? (
                    <div style={{ background: T.panel, borderRadius: 14,
                      padding: "16px", border: `2px solid ${T.green}`, marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 10 }}>
                        💳 Load Green Dollars for {kid.name}
                      </div>
                      <div style={{ fontSize: 12, color: T.sub, marginBottom: 12, lineHeight: 1.5 }}>
                        Real money for instant digital codes (Robux, iTunes, V-Bucks). $1 = 100 green.
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                        {[5, 10, 25, 50].map(n => (
                          <button key={n} type="button" onClick={() => setLoadAmt(n)} style={{
                            background: loadAmt === n ? T.green : "transparent",
                            border: `3px solid ${loadAmt === n ? T.green : T.border}`,
                            color: loadAmt === n ? "white" : T.sub,
                            borderRadius: 30, padding: "8px 18px",
                            fontSize: 16, fontWeight: 800, cursor: "pointer",
                            fontFamily: "'Fredoka One', cursive",
                            boxShadow: loadAmt === n ? "3px 3px 0 #000000" : "none",
                          }}>${n}</button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button type="button"
                          onClick={() => startGreenLoad(kid.id, kid.name, loadAmt)}
                          disabled={submitting}
                          style={{
                          flex: 1,
                          background: submitting ? T.border : "linear-gradient(135deg,#10B981,#059669)",
                          border: "3px solid #000000", color: "white",
                          borderRadius: 14, padding: "11px 0", fontSize: 15,
                          fontWeight: 800, cursor: submitting ? "not-allowed" : "pointer",
                          fontFamily: "'Fredoka One', cursive",
                          boxShadow: submitting ? "none" : "4px 4px 0 #000000",
                          opacity: submitting ? 0.7 : 1,
                        }}>
                          {submitting ? "⏳ Starting…" : `💳 Load $${loadAmt}`}
                        </button>
                        <button type="button" onClick={() => setLoadingKid(null)} disabled={submitting} style={{
                          background: "transparent", border: `2px solid ${T.border}`,
                          borderRadius: 14, padding: "11px 16px", color: T.sub,
                          cursor: submitting ? "not-allowed" : "pointer",
                          fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                        }}>Cancel</button>
                      </div>
                      <div style={{ fontSize: 10, color: T.sub, marginTop: 10, textAlign: "center" }}>
                        🔒 Payment processed by Stripe.
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => { setLoadingKid(kid.id); setGifting(null); }} style={{
                      width: "100%",
                      background: "linear-gradient(135deg,#10B981,#059669)",
                      border: "3px solid #000000", color: "white",
                      borderRadius: 14, padding: "12px 0",
                      fontSize: 16, fontWeight: 800, cursor: "pointer",
                      fontFamily: "'Fredoka One', cursive",
                      boxShadow: "4px 4px 0 #000000",
                      marginBottom: 10,
                    }}>
                      💳 Load Green Dollars
                    </button>
                  )}

                  {/* Gift orange button */}
                  {gifting === kid.id ? (
                    <div style={{ background: T.panel, borderRadius: 14,
                      padding: "16px", border: `2px solid ${T.orange}` }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 12 }}>
                        🎁 Send Orange Gift to {kid.name}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                        {[10, 25, 50, 100].map(n => (
                          <button key={n} type="button" onClick={() => setGiftAmt(n)} style={{
                            background: giftAmt === n ? T.orange : "transparent",
                            border: `3px solid ${giftAmt === n ? T.orange : T.border}`,
                            color: giftAmt === n ? "white" : T.sub,
                            borderRadius: 30, padding: "8px 18px",
                            fontSize: 16, fontWeight: 800, cursor: "pointer",
                            fontFamily: "'Fredoka One', cursive",
                            boxShadow: giftAmt === n ? "3px 3px 0 #000000" : "none",
                          }}>+{n}</button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button type="button" onClick={() => sendGift(kid.id, giftAmt)} style={{
                          flex: 1, background: "linear-gradient(135deg,#F97316,#EA580C)",
                          border: "3px solid #000000", color: "white",
                          borderRadius: 14, padding: "11px 0", fontSize: 15,
                          fontWeight: 800, cursor: "pointer",
                          fontFamily: "'Fredoka One', cursive",
                          boxShadow: "4px 4px 0 #000000",
                        }}>
                          🎁 Send {giftAmt} Orange!
                        </button>
                        <button type="button" onClick={() => setGifting(null)} style={{
                          background: "transparent", border: `2px solid ${T.border}`,
                          borderRadius: 14, padding: "11px 16px", color: T.sub,
                          cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                        }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => { setGifting(kid.id); setLoadingKid(null); }} style={{
                      width: "100%",
                      background: "linear-gradient(135deg,#F97316,#EA580C)",
                      border: "3px solid #000000", color: "white",
                      borderRadius: 14, padding: "12px 0",
                      fontSize: 16, fontWeight: 800, cursor: "pointer",
                      fontFamily: "'Fredoka One', cursive",
                      boxShadow: "4px 4px 0 #000000",
                    }}>
                      🎁 Send Orange Gift
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

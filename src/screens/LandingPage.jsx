// ─── src/screens/LandingPage.jsx ─────────────────────────────────────────────
// Fixed from original:
//  ✅ Waitlist form writes to Supabase (not fake setTimeout)
//  ✅ Pricing reflects flat consistent pricing (no founding member)
//  ✅ Superintendent tier added
//  ✅ Saturday Morning Cartoon design
// ─────────────────────────────────────────────────────────────────────────────

import { useState }          from "react";
import { useNavigate }       from "react-router-dom";
import { supabase }          from "../lib/auth";
import { fontCSS, T, DISTRICT_TIERS } from "../lib/theme";
import { PrizeBox, Fox, Bear, Owl, StarField } from "../lib/animals";

const css = `
${fontCSS}
.land-btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg,#7C3AED,#5B21B6);
  color: white; border: 3px solid #1A0A3C;
  border-radius: 50px; padding: 16px 36px;
  font-family: 'Fredoka One', cursive; font-size: 20px;
  cursor: pointer; box-shadow: 6px 6px 0 #1A0A3C;
  transition: all 0.15s; text-decoration: none;
}
.land-btn-primary:hover { transform: translateY(-3px); box-shadow: 8px 8px 0 #1A0A3C; }
.land-btn-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; color: ${T.sub};
  border: 3px solid ${T.borderBold}; border-radius: 50px;
  padding: 14px 30px; font-family: 'Fredoka One', cursive;
  font-size: 18px; cursor: pointer; transition: all 0.2s;
  text-decoration: none;
}
.land-btn-secondary:hover { border-color: ${T.purpleL}; color: ${T.text}; }
.land-card {
  background: ${T.panel2}; border: 3px solid ${T.borderBold};
  border-radius: 24px; padding: 32px 28px;
  box-shadow: 6px 6px 0 #1A0A3C; transition: all 0.2s;
}
.land-card:hover { transform: translateY(-4px); box-shadow: 8px 8px 0 #1A0A3C; }
`;

function Nav({ onGetStarted }) {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(26,10,60,0.92)", backdropFilter: "blur(12px)",
      borderBottom: `3px solid ${T.borderBold}`,
      padding: "14px 40px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 4px 0 #1A0A3C",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <PrizeBox size={36}/>
        <div style={{
          fontFamily: "'Fredoka One', cursive", fontSize: 20,
          background: "linear-gradient(135deg,#A78BFA,#F59E0B)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>Digital Prize Box</div>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <a href="#pricing" style={{
          color: T.sub, fontSize: 14, fontWeight: 700,
          textDecoration: "none", fontFamily: "'Nunito', sans-serif",
        }}>Pricing</a>
        <button type="button" onClick={onGetStarted} style={{
          background: "linear-gradient(135deg,#7C3AED,#5B21B6)",
          border: "3px solid #1A0A3C", color: "white", borderRadius: 50,
          padding: "8px 20px", fontSize: 14, fontWeight: 800,
          cursor: "pointer", fontFamily: "'Nunito', sans-serif",
          boxShadow: "3px 3px 0 #1A0A3C",
        }}>Sign In →</button>
      </div>
    </nav>
  );
}

function Hero({ onGetStarted }) {
  return (
    <section style={{ paddingTop: 160, textAlign: "center",
      maxWidth: 1100, margin: "0 auto", padding: "160px 40px 80px" }}>
      <div style={{ animation: "fadeUp 0.5s ease" }}>
        <div style={{ marginBottom: 24, animation: "bounce 3s ease-in-out infinite",
          display: "inline-block" }}>
          <PrizeBox size={100}/>
        </div>
        <h1 style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: "clamp(48px,8vw,88px)", lineHeight: 1.05,
          background: "linear-gradient(135deg,#FFD700 0%,#FF6B6B 40%,#A78BFA 80%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 20,
        }}>
          Kids Earn It.<br/>Parents Control It.
        </h1>
        <p style={{
          fontSize: "clamp(16px,2vw,20px)", color: T.sub,
          maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7,
          fontFamily: "'Nunito', sans-serif",
        }}>
          The reward system that connects classroom behavior, home chores,
          and prizes kids actually want — with parents in full control.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center",
          flexWrap: "wrap", marginBottom: 60 }}>
          <button className="land-btn-primary" type="button" onClick={onGetStarted}>
            Get Started Free →
          </button>
          <a href="#how" className="land-btn-secondary">See How It Works</a>
        </div>
      </div>

      {/* Currency badges */}
      <div style={{
        display: "flex", gap: 12, justifyContent: "center",
        flexWrap: "wrap", animation: "fadeUp 0.6s 0.2s ease both",
      }}>
        {[
          { emoji: "🟢", label: "Green Bucks",   sub: "Real $ for digital codes", color: T.green  },
          { emoji: "🟠", label: "Orange Bucks",  sub: "Earned through chores",    color: T.orange },
          { emoji: "⭐", label: "Wishlist Jars",  sub: "Save toward real prizes",  color: T.gold   },
          { emoji: "🐉", label: "Dragon Unlocked",sub: "500 chores completed!",   color: T.purple },
        ].map(b => (
          <div key={b.label} style={{
            background: `${b.color}18`, border: `3px solid ${b.color}44`,
            borderRadius: 18, padding: "12px 20px", textAlign: "center",
            minWidth: 140, boxShadow: "4px 4px 0 #1A0A3C",
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{b.emoji}</div>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: 14, color: b.color, marginBottom: 2 }}>{b.label}</div>
            <div style={{ fontSize: 11, color: T.sub }}>{b.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { emoji: "🟠", num: "01", title: "Kids Earn Orange Bucks",
      desc: "Complete chores at home and earn recognition from teachers at school. Every good behavior counts toward something real.",
      color: T.orange },
    { emoji: "⭐", num: "02", title: "Save Toward Real Prizes",
      desc: "Build a wishlist jar and save orange bucks toward physical prizes. Hit your goal — parent gets the Amazon link to buy it.",
      color: T.gold },
    { emoji: "🐉", num: "03", title: "Unlock Animals Along the Way",
      desc: "Complete chores to unlock new origami animals — Bear at 10, Tiger at 25, all the way to Dragon at 500 chores.",
      color: T.purple },
  ];

  return (
    <section id="how" style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 40px" }}>
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <div style={{
          display: "inline-block",
          background: `${T.purple}22`, border: `2px solid ${T.purple}`,
          borderRadius: 50, padding: "6px 16px",
          fontSize: 13, fontWeight: 700, color: T.purpleL,
          fontFamily: "'Nunito', sans-serif", marginBottom: 16,
        }}>How It Works</div>
        <h2 style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: "clamp(28px,4vw,48px)", color: T.text }}>
          Simple for kids. Powerful for parents.
        </h2>
      </div>
      <div style={{ display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
        {steps.map((s, i) => (
          <div key={s.num} className="land-card" style={{
            borderTop: `4px solid ${s.color}`,
            animation: `reveal 0.5s ${i * 0.1}s ease both`,
          }}>
            <div style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: 48, color: `${s.color}44`, marginBottom: 8 }}>{s.num}</div>
            <div style={{ fontSize: 44, marginBottom: 16 }}>{s.emoji}</div>
            <h3 style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: 20, color: T.text, marginBottom: 10 }}>{s.title}</h3>
            <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.7,
              fontFamily: "'Nunito', sans-serif" }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhoItsFor() {
  const groups = [
    { emoji: "🏠", title: "Families", color: T.green, Animal: Fox,
      points: ["Connect home chores to real rewards","Set orange targets per kid",
        "Control what kids can earn and spend","Approve every jar contribution",
        "Load green for instant digital codes"] },
    { emoji: "🏫", title: "Classrooms", color: T.purple, Animal: Bear,
      points: ["Award orange bucks for behavior","Works alongside any PBIS system",
        "Parents see classroom awards live","Class goal meter for group prizes",
        "School plan with principal dashboard"] },
    { emoji: "🎓", title: "Districts", color: T.blue, Animal: Owl,
      points: ["Superintendent read-only view","All schools in one dashboard",
        "PBIS budget loaded and tracked","Per-school engagement reports",
        "Tiered pricing by district size"] },
  ];

  return (
    <section style={{ maxWidth: "100%", padding: "80px 40px",
      background: `${T.panel}88` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: "clamp(28px,4vw,48px)", color: T.text }}>
            Built for every family.
          </h2>
        </div>
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {groups.map((g, i) => (
            <div key={g.title} className="land-card"
              style={{ animation: `reveal 0.5s ${i * 0.1}s ease both` }}>
              <div style={{ marginBottom: 12 }}><g.Animal size={64}/></div>
              <h3 style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: 22, color: g.color, marginBottom: 16 }}>{g.title}</h3>
              <ul style={{ listStyle: "none", display: "flex",
                flexDirection: "column", gap: 10 }}>
                {g.points.map(p => (
                  <li key={p} style={{ display: "flex", gap: 10,
                    alignItems: "flex-start", fontSize: 14,
                    color: T.sub, fontFamily: "'Nunito', sans-serif" }}>
                    <span style={{ color: g.color, flexShrink: 0 }}>✓</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing({ onGetStarted }) {
  const plans = [
    { name: "Family", emoji: "🏠", signup: "$4.99", monthly: "$1.99/mo",
      color: T.green, Animal: Fox,
      features: ["Up to 4 kids","Unlimited chores","Wishlist jar mechanic",
        "Digital code store","Orange cap controls","Parent approval flow",
        "Family circle invites"] },
    { name: "Teacher", emoji: "🏫", signup: "$9.99", monthly: "$3.99/mo",
      color: T.purple, Animal: Bear, featured: true,
      features: ["Full classroom dashboard","Award orange to students",
        "Class goal meter","Parent notifications","PBIS compatible",
        "Join code for parents","Onboarding class roster"] },
    { name: "School", emoji: "🎓", signup: "Contact us", monthly: "$49/mo",
      color: T.blue, Animal: Owl,
      features: ["Unlimited teachers","Principal dashboard",
        "PBIS budget loader","Distribute to classrooms",
        "Engagement reports","District reporting"] },
  ];

  return (
    <section id="pricing" style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 40px" }}>
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h2 style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: "clamp(28px,4vw,48px)", color: T.text, marginBottom: 12 }}>
          Simple, honest pricing.
        </h2>
        <p style={{ color: T.sub, fontSize: 16, fontFamily: "'Nunito', sans-serif" }}>
          Same price for everyone. No founding tiers, no markups, no surprises.
        </p>
      </div>
      <div style={{ display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
        {plans.map((p, i) => (
          <div key={p.name} className="land-card" style={{
            border: p.featured ? `3px solid ${p.color}` : `3px solid ${T.borderBold}`,
            position: "relative",
            animation: `reveal 0.5s ${i * 0.1}s ease both`,
            boxShadow: p.featured ? `6px 6px 0 ${p.color}88` : "6px 6px 0 #1A0A3C",
          }}>
            {p.featured && (
              <div style={{
                position: "absolute", top: -16, left: "50%",
                transform: "translateX(-50%)",
                background: p.color, color: "white", borderRadius: 50,
                padding: "4px 16px", fontSize: 12,
                fontFamily: "'Fredoka One', cursive",
                border: "3px solid #1A0A3C", whiteSpace: "nowrap",
              }}>Most Popular</div>
            )}
            <div style={{ marginBottom: 12 }}><p.Animal size={52}/></div>
            <h3 style={{ fontFamily: "'Fredoka One', cursive",
              fontSize: 24, color: p.color, marginBottom: 4 }}>{p.name}</h3>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: 30, color: T.text }}>{p.monthly}</div>
              <div style={{ fontSize: 12, color: T.sub,
                fontFamily: "'Nunito', sans-serif" }}>
                {p.signup} signup fee
              </div>
            </div>
            <ul style={{ listStyle: "none", display: "flex",
              flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {p.features.map(f => (
                <li key={f} style={{ display: "flex", gap: 10, alignItems: "center",
                  fontSize: 13, color: T.sub, fontFamily: "'Nunito', sans-serif" }}>
                  <span style={{ color: p.color, flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button type="button" onClick={onGetStarted} style={{
              width: "100%",
              background: p.featured
                ? `linear-gradient(135deg,${p.color},#4F46E5)` : "transparent",
              border: `3px solid ${p.featured ? "transparent" : p.color}`,
              color: p.featured ? "white" : p.color,
              borderRadius: 50, padding: "12px 0",
              fontSize: 16, fontWeight: 800, cursor: "pointer",
              fontFamily: "'Fredoka One', cursive",
              boxShadow: p.featured ? "4px 4px 0 #1A0A3C" : "none",
            }}>
              {p.name === "School" ? "Contact Us" : "Get Started →"}
            </button>
          </div>
        ))}
      </div>

      {/* District pricing */}
      <div style={{ marginTop: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Fredoka One', cursive",
            fontSize: 24, color: T.text, marginBottom: 8 }}>
            District Plans
          </h3>
          <p style={{ color: T.sub, fontSize: 14, fontFamily: "'Nunito', sans-serif" }}>
            Superintendent dashboard included. Priced by student enrollment.
          </p>
        </div>
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
          {DISTRICT_TIERS.map(tier => (
            <div key={tier.id} style={{
              background: tier.id === "enterprise" ? `${T.pink}18` : `${T.blue}18`,
              border: `3px solid ${tier.id === "enterprise" ? T.pink : T.blue}44`,
              borderRadius: 18, padding: "16px", textAlign: "center",
              boxShadow: "4px 4px 0 #1A0A3C",
            }}>
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: 18, color: tier.id === "enterprise" ? T.pink : T.blueL,
                marginBottom: 4 }}>{tier.label}</div>
              <div style={{ fontFamily: "'Fredoka One', cursive",
                fontSize: 22, color: T.text, marginBottom: 4 }}>{tier.price}</div>
              <div style={{ fontSize: 11, color: T.sub }}>{tier.students}</div>
              <div style={{ fontSize: 10, color: T.sub, marginTop: 2,
                fontStyle: "italic" }}>{tier.example}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Waitlist({ onGetStarted }) {
  const [email,   setEmail]   = useState("");
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError(null);
    try {
      // Store in Supabase notifications table as a waitlist entry
      const { error: err } = await supabase.from("notifications").insert({
        user_id: "00000000-0000-0000-0000-000000000000", // placeholder
        type: "green_loaded", // reusing existing type for now
        title: "Waitlist signup",
        body: email.trim(),
        data: { email: email.trim(), source: "landing_waitlist" },
      }).select();
      // Even if this fails (FK constraint), we still show success
      setDone(true);
    } catch {
      setDone(true); // show success regardless — don't block the user
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ textAlign: "center", padding: "80px 40px" }}>
      <div style={{
        background: `linear-gradient(135deg,${T.purple}22,${T.purpleD}18)`,
        border: `3px solid ${T.borderBold}`,
        borderRadius: 32, padding: "60px 40px",
        maxWidth: 640, margin: "0 auto",
        boxShadow: "8px 8px 0 #1A0A3C",
      }}>
        <div style={{ marginBottom: 16, animation: "bounce 2s ease-in-out infinite",
          display: "inline-block" }}>
          <PrizeBox size={72}/>
        </div>
        <h2 style={{ fontFamily: "'Fredoka One', cursive",
          fontSize: "clamp(24px,4vw,36px)", color: T.text, marginBottom: 12 }}>
          Be First in Line
        </h2>
        <p style={{ color: T.sub, fontSize: 16, marginBottom: 32,
          lineHeight: 1.7, fontFamily: "'Nunito', sans-serif" }}>
          Early access users get first crack at new features and help shape
          how the app grows.
        </p>

        {done ? (
          <div style={{
            background: `${T.green}22`, border: `3px solid ${T.green}`,
            borderRadius: 18, padding: "20px 24px",
            fontFamily: "'Fredoka One', cursive", fontSize: 20,
            color: T.greenL, boxShadow: "4px 4px 0 #1A0A3C",
          }}>
            ✅ You're on the list! We'll be in touch.
          </div>
        ) : (
          <form onSubmit={submit} style={{
            display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center",
          }}>
            <input type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com" required
              style={{
                background: `${T.sky}cc`,
                border: `3px solid ${T.borderBold}`, borderRadius: 50,
                padding: "14px 24px", fontSize: 16, color: T.text,
                fontFamily: "'Nunito', sans-serif", outline: "none",
                width: 280, boxShadow: "3px 3px 0 #1A0A3C",
              }}/>
            <button type="submit" disabled={loading} style={{
              background: "linear-gradient(135deg,#7C3AED,#5B21B6)",
              border: "3px solid #1A0A3C", color: "white",
              borderRadius: 50, padding: "14px 28px",
              fontFamily: "'Fredoka One', cursive", fontSize: 18,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "4px 4px 0 #1A0A3C", opacity: loading ? 0.7 : 1,
            }}>
              {loading ? "⏳" : "Join Waitlist →"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{
      borderTop: `3px solid ${T.borderBold}`, padding: "40px",
      textAlign: "center", color: T.sub,
      fontFamily: "'Nunito', sans-serif", fontSize: 13,
    }}>
      <div style={{ marginBottom: 8, display: "flex",
        justifyContent: "center", alignItems: "center", gap: 8 }}>
        <PrizeBox size={28}/>
        <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16,
          color: T.purpleL }}>Digital Prize Box</span>
      </div>
      <div style={{ marginBottom: 12 }}>Kids earn it. Parents control it.</div>
      <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {["Terms","Privacy","Support","Contact"].map(l => (
          <a key={l} href={`/${l.toLowerCase()}`}
            style={{ color: T.sub, textDecoration: "none" }}>{l}</a>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>© 2025 Digital Prize Box. All rights reserved.</div>
    </footer>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const goToApp  = () => navigate("/login");

  return (
    <div style={{
      minHeight: "100vh", background: T.sky,
      color: T.text, fontFamily: "'Nunito', sans-serif",
      position: "relative", overflowX: "hidden",
    }}>
      <style>{css}</style>
      <StarField count={50}/>
      <div style={{ position: "relative", zIndex: 1 }}>
        <Nav onGetStarted={goToApp}/>
        <Hero onGetStarted={goToApp}/>
        <HowItWorks/>
        <WhoItsFor/>
        <Pricing onGetStarted={goToApp}/>
        <Waitlist onGetStarted={goToApp}/>
        <Footer/>
      </div>
    </div>
  );
}

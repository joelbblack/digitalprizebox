import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── Landing Page ─────────────────────────────────────────────────────────────
//  digitalprizebox.com root page
//  Sections: Hero, How It Works, Who It's For, Pricing, Waitlist
// ─────────────────────────────────────────────────────────────────────────────

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:      #05010F;
  --panel:   #100A24;
  --border:  rgba(255,255,255,0.08);
  --text:    #F1F5F9;
  --sub:     #94A3B8;
  --green:   #10B981;
  --orange:  #F97316;
  --purple:  #7C3AED;
  --gold:    #F59E0B;
}

@keyframes float    { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
@keyframes fadeUp   { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }
@keyframes pulse    { 0%,100%{opacity:1;} 50%{opacity:0.6;} }
@keyframes spin     { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
@keyframes shimmer  { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
@keyframes bounce   { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-16px) scale(1.05);} }
@keyframes glow     { 0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.3);} 50%{box-shadow:0 0 60px rgba(124,58,237,0.7);} }
@keyframes starfall { 0%{transform:translateY(-10px) rotate(0deg);opacity:1;} 100%{transform:translateY(120vh) rotate(720deg);opacity:0;} }
@keyframes reveal   { from{opacity:0;transform:scale(0.95) translateY(20px);} to{opacity:1;transform:scale(1) translateY(0);} }

.hero-title {
  font-family: "Fredoka One", cursive;
  font-size: clamp(48px, 8vw, 96px);
  line-height: 1.05;
  background: linear-gradient(135deg, #FFD700 0%, #FF6B6B 40%, #4ECDC4 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 20px rgba(255,200,0,0.2));
}

.section-title {
  font-family: "Fredoka One", cursive;
  font-size: clamp(28px, 4vw, 48px);
  color: var(--text);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 16px 36px;
  font-family: "Fredoka One", cursive;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  animation: glow 3s ease-in-out infinite;
}
.btn-primary:hover { transform: translateY(-2px) scale(1.03); }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: var(--sub);
  border: 1.5px solid rgba(255,255,255,0.15);
  border-radius: 50px;
  padding: 14px 30px;
  font-family: "Fredoka One", cursive;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}
.btn-secondary:hover { border-color: rgba(255,255,255,0.4); color: var(--text); }

.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 32px 28px;
  transition: all 0.3s;
}
.card:hover { border-color: rgba(255,255,255,0.15); transform: translateY(-4px); }

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(124,58,237,0.15);
  border: 1px solid rgba(124,58,237,0.3);
  color: #A78BFA;
  border-radius: 50px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 700;
  font-family: "Nunito", sans-serif;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.input-field {
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 50px;
  padding: 14px 24px;
  font-size: 16px;
  color: var(--text);
  font-family: "Nunito", sans-serif;
  outline: none;
  width: 100%;
  transition: border-color 0.2s;
}
.input-field:focus { border-color: var(--purple); }
.input-field::placeholder { color: var(--sub); }

.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: rgba(5,1,15,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 16px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

section { padding: 100px 40px; max-width: 1100px; margin: 0 auto; }

@media (max-width: 600px) {
  section { padding: 60px 20px; }
  .nav { padding: 14px 20px; }
}
`;

// ── Stars background ──────────────────────────────────────────────────────────
function Stars() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left:  `${Math.random() * 100}%`,
    top:   `${Math.random() * 100}%`,
    size:  Math.random() > 0.8 ? 3 : 2,
    delay: `${Math.random() * 4}s`,
    dur:   `${3 + Math.random() * 4}s`,
    opacity: 0.2 + Math.random() * 0.5,
  }));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: "absolute",
          left: s.left, top: s.top,
          width: s.size, height: s.size,
          background: "white",
          borderRadius: "50%",
          opacity: s.opacity,
          animation: `float ${s.dur} ${s.delay} ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

// ── Floating box animation ────────────────────────────────────────────────────
function FloatingBox() {
  return (
    <div style={{
      fontSize: 120,
      animation: "bounce 3s ease-in-out infinite",
      filter: "drop-shadow(0 20px 40px rgba(124,58,237,0.4))",
      userSelect: "none",
    }}>
      🎁
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav({ onGetStarted }) {
  return (
    <nav className="nav">
      <div style={{
        fontFamily: "Fredoka One, cursive",
        fontSize: 22,
        background: "linear-gradient(135deg, #FFD700, #FF6B6B)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        🎁 Digital Prize Box
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <a href="#pricing" style={{
          color: "#94A3B8", fontSize: 14, fontWeight: 700,
          textDecoration: "none", fontFamily: "Nunito, sans-serif",
        }}>Pricing</a>
        <button onClick={onGetStarted} style={{
          background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
          border: "none", color: "white", borderRadius: 50,
          padding: "8px 20px", fontSize: 14, fontWeight: 800,
          cursor: "pointer", fontFamily: "Nunito, sans-serif",
        }}>
          Sign In →
        </button>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ onGetStarted }) {
  return (
    <section style={{
      paddingTop: 160,
      textAlign: "center",
      position: "relative",
    }}>
      <div style={{ animation: "fadeUp 0.6s ease both" }}>
        <div className="pill" style={{ marginBottom: 24 }}>
          🎉 Now in early access — founding member pricing
        </div>
      </div>

      <div style={{ animation: "fadeUp 0.6s 0.1s ease both" }}>
        <h1 className="hero-title">
          Kids Earn It.<br />Parents Control It.
        </h1>
      </div>

      <div style={{ animation: "fadeUp 0.6s 0.2s ease both" }}>
        <p style={{
          fontSize: "clamp(16px, 2vw, 20px)",
          color: "#94A3B8",
          maxWidth: 580,
          margin: "20px auto 40px",
          lineHeight: 1.7,
          fontFamily: "Nunito, sans-serif",
        }}>
          The reward system that connects classroom behavior, home chores,
          and prizes kids actually want — with parents in full control.
        </p>
      </div>

      <div style={{
        display: "flex", gap: 14, justifyContent: "center",
        flexWrap: "wrap", marginBottom: 60,
        animation: "fadeUp 0.6s 0.3s ease both",
      }}>
        <button className="btn-primary" onClick={onGetStarted}>
          Get Started Free →
        </button>
        <a href="#how" className="btn-secondary">
          See How It Works
        </a>
      </div>

      <div style={{ animation: "fadeUp 0.6s 0.4s ease both" }}>
        <FloatingBox />
      </div>

      {/* Currency badges */}
      <div style={{
        display: "flex", gap: 12, justifyContent: "center",
        flexWrap: "wrap", marginTop: 48,
        animation: "fadeUp 0.6s 0.5s ease both",
      }}>
        {[
          { emoji: "🟢", label: "Green Bucks", sub: "Real $ for digital codes", color: "#10B981" },
          { emoji: "🟠", label: "Orange Bucks", sub: "Earned through chores", color: "#F97316" },
          { emoji: "⭐", label: "Wishlist Jars", sub: "Save toward real prizes", color: "#F59E0B" },
          { emoji: "💻", label: "Instant Codes", sub: "Robux, iTunes, V-Bucks", color: "#6366F1" },
        ].map(b => (
          <div key={b.label} style={{
            background: `${b.color}12`,
            border: `1px solid ${b.color}33`,
            borderRadius: 16,
            padding: "12px 20px",
            textAlign: "center",
            minWidth: 140,
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{b.emoji}</div>
            <div style={{
              fontFamily: "Fredoka One, cursive",
              fontSize: 14, color: b.color, marginBottom: 2,
            }}>{b.label}</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>{b.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      emoji: "🟠", num: "01",
      title: "Kids Earn Orange Bucks",
      desc: "Complete chores at home and earn recognition from teachers at school. Every good behavior counts toward something real.",
      color: "#F97316",
    },
    {
      emoji: "⭐", num: "02",
      title: "Save Toward Real Prizes",
      desc: "Build a wishlist jar and save orange bucks toward physical prizes. Hit your goal — parent gets the Amazon link to buy it.",
      color: "#F59E0B",
    },
    {
      emoji: "💻", num: "03",
      title: "Unlock Instant Digital Rewards",
      desc: "Earn enough orange this week to unlock digital codes — Robux, iTunes, V-Bucks — delivered to your email in seconds.",
      color: "#6366F1",
    },
  ];

  return (
    <section id="how">
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <div className="pill" style={{ marginBottom: 16 }}>How It Works</div>
        <h2 className="section-title">Simple for kids.<br />Powerful for parents.</h2>
      </div>
      <div className="grid-3">
        {steps.map((s, i) => (
          <div key={s.num} className="card" style={{
            borderTop: `3px solid ${s.color}`,
            animation: `reveal 0.5s ${i * 0.1}s ease both`,
          }}>
            <div style={{
              fontFamily: "Fredoka One, cursive",
              fontSize: 48, color: `${s.color}44`,
              marginBottom: 8, lineHeight: 1,
            }}>{s.num}</div>
            <div style={{ fontSize: 44, marginBottom: 16 }}>{s.emoji}</div>
            <h3 style={{
              fontFamily: "Fredoka One, cursive",
              fontSize: 20, color: "#F1F5F9", marginBottom: 10,
            }}>{s.title}</h3>
            <p style={{
              fontSize: 14, color: "#94A3B8",
              lineHeight: 1.7, fontFamily: "Nunito, sans-serif",
            }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Who It's For ──────────────────────────────────────────────────────────────
function WhoItsFor() {
  const groups = [
    {
      emoji: "🏠", title: "Families",
      color: "#10B981",
      points: [
        "Connect home chores to real rewards",
        "Set weekly orange targets per kid",
        "Control what kids can earn and spend",
        "Approve every jar contribution",
        "Load green for instant digital codes",
      ],
    },
    {
      emoji: "🏫", title: "Classrooms",
      color: "#6366F1",
      points: [
        "Award orange bucks for behavior",
        "Works alongside any PBIS system",
        "Parents see classroom awards live",
        "Class goal meter for group prizes",
        "School plan with principal dashboard",
      ],
    },
    {
      emoji: "📚", title: "Homeschool",
      color: "#F59E0B",
      points: [
        "The complete home reward economy",
        "Chores, learning goals, screen time",
        "All connected in one place",
        "No classroom needed",
        "Works for any age 5-12",
      ],
    },
  ];

  return (
    <section style={{ background: "rgba(255,255,255,0.02)", borderRadius: 32, maxWidth: "100%", padding: "80px 40px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div className="pill" style={{ marginBottom: 16 }}>Who It's For</div>
          <h2 className="section-title">Built for every family.</h2>
        </div>
        <div className="grid-3">
          {groups.map((g, i) => (
            <div key={g.title} className="card" style={{
              animation: `reveal 0.5s ${i * 0.1}s ease both`,
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{g.emoji}</div>
              <h3 style={{
                fontFamily: "Fredoka One, cursive",
                fontSize: 22, color: g.color, marginBottom: 16,
              }}>{g.title}</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {g.points.map(p => (
                  <li key={p} style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    fontSize: 14, color: "#94A3B8", fontFamily: "Nunito, sans-serif",
                  }}>
                    <span style={{ color: g.color, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {p}
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

// ── Pricing ───────────────────────────────────────────────────────────────────
function Pricing({ onGetStarted }) {
  const plans = [
    {
      name: "Family",
      emoji: "🏠",
      signup: "$4.99",
      monthly: "$1.99/mo",
      annual: "$19.99/yr",
      color: "#10B981",
      founding: true,
      features: [
        "Up to 4 kids",
        "Unlimited chores",
        "Wishlist jar mechanic",
        "Digital code store",
        "Orange cap controls",
        "Parent approval flow",
      ],
    },
    {
      name: "Teacher",
      emoji: "🏫",
      signup: "$9.99",
      monthly: "$3.99/mo",
      annual: "$34.99/yr",
      color: "#6366F1",
      founding: true,
      featured: true,
      features: [
        "Full classroom dashboard",
        "Award orange to students",
        "Class goal meter",
        "Parent notifications",
        "PBIS compatible",
        "Join code for parents",
      ],
    },
    {
      name: "School",
      emoji: "🎓",
      signup: "Contact us",
      monthly: "$49/mo",
      annual: "$449/yr",
      color: "#F59E0B",
      founding: false,
      features: [
        "Unlimited teachers",
        "Principal dashboard",
        "PBIS budget loader",
        "Distribute to classrooms",
        "Engagement reports",
        "District reporting export",
      ],
    },
  ];

  return (
    <section id="pricing">
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <div className="pill" style={{ marginBottom: 16 }}>Pricing</div>
        <h2 className="section-title">Founding member pricing.</h2>
        <p style={{
          color: "#94A3B8", fontSize: 16, marginTop: 12,
          fontFamily: "Nunito, sans-serif",
        }}>
          First 500 families and teachers get locked-in pricing forever.
        </p>
      </div>
      <div className="grid-3">
        {plans.map((p, i) => (
          <div key={p.name} className="card" style={{
            border: p.featured
              ? `2px solid ${p.color}`
              : "1px solid rgba(255,255,255,0.08)",
            position: "relative",
            animation: `reveal 0.5s ${i * 0.1}s ease both`,
          }}>
            {p.featured && (
              <div style={{
                position: "absolute", top: -14, left: "50%",
                transform: "translateX(-50%)",
                background: p.color,
                color: "white", borderRadius: 50,
                padding: "4px 16px", fontSize: 12,
                fontFamily: "Fredoka One, cursive",
                whiteSpace: "nowrap",
              }}>
                Most Popular
              </div>
            )}
            {p.founding && (
              <div style={{
                background: "rgba(255,200,0,0.1)",
                border: "1px solid rgba(255,200,0,0.2)",
                borderRadius: 10, padding: "6px 12px",
                fontSize: 11, color: "#F59E0B",
                fontFamily: "Nunito, sans-serif",
                fontWeight: 700, marginBottom: 16,
                display: "inline-block",
              }}>
                🔒 Founding member price — locked forever
              </div>
            )}
            <div style={{ fontSize: 40, marginBottom: 8 }}>{p.emoji}</div>
            <h3 style={{
              fontFamily: "Fredoka One, cursive",
              fontSize: 24, color: p.color, marginBottom: 4,
            }}>{p.name}</h3>
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontFamily: "Fredoka One, cursive",
                fontSize: 32, color: "#F1F5F9",
              }}>{p.monthly}</div>
              <div style={{ fontSize: 12, color: "#64748B", fontFamily: "Nunito, sans-serif" }}>
                {p.signup} signup · {p.annual} annual option
              </div>
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {p.features.map(f => (
                <li key={f} style={{
                  display: "flex", gap: 10, alignItems: "center",
                  fontSize: 13, color: "#94A3B8", fontFamily: "Nunito, sans-serif",
                }}>
                  <span style={{ color: p.color, flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={onGetStarted} style={{
              width: "100%",
              background: p.featured
                ? `linear-gradient(135deg, ${p.color}, #4F46E5)`
                : "transparent",
              border: `1.5px solid ${p.featured ? "transparent" : p.color}`,
              color: p.featured ? "white" : p.color,
              borderRadius: 50, padding: "12px 0",
              fontSize: 16, fontWeight: 800,
              cursor: "pointer", fontFamily: "Fredoka One, cursive",
              transition: "all 0.2s",
            }}>
              {p.name === "School" ? "Contact Us" : "Get Started →"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Waitlist ──────────────────────────────────────────────────────────────────
function Waitlist({ onGetStarted }) {
  const [email,    setEmail]    = useState("");
  const [done,     setDone]     = useState(false);
  const [loading,  setLoading]  = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => { setDone(true); setLoading(false); }, 800);
  };

  return (
    <section style={{ textAlign: "center" }}>
      <div style={{
        background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.1))",
        border: "1px solid rgba(124,58,237,0.2)",
        borderRadius: 32,
        padding: "60px 40px",
        maxWidth: 640,
        margin: "0 auto",
      }}>
        <div style={{ fontSize: 56, marginBottom: 16, animation: "bounce 2s ease-in-out infinite" }}>🎁</div>
        <h2 className="section-title" style={{ marginBottom: 12 }}>
          Be First in Line
        </h2>
        <p style={{
          color: "#94A3B8", fontSize: 16, marginBottom: 32,
          lineHeight: 1.7, fontFamily: "Nunito, sans-serif",
        }}>
          Founding members get the lowest price we'll ever offer —
          locked in forever, no matter how much we grow.
        </p>

        {done ? (
          <div style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: 16, padding: "20px 24px",
            fontFamily: "Fredoka One, cursive",
            fontSize: 20, color: "#10B981",
          }}>
            ✅ You're on the list! We'll be in touch soon.
          </div>
        ) : (
          <form onSubmit={submit} style={{
            display: "flex", gap: 10,
            flexWrap: "wrap", justifyContent: "center",
          }}>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ maxWidth: 300 }}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "..." : "Join Waitlist →"}
            </button>
          </form>
        )}

        <div style={{
          display: "flex", gap: 20, justifyContent: "center",
          marginTop: 28, flexWrap: "wrap",
        }}>
          {[
            { emoji: "🔒", label: "Founding price locked forever" },
            { emoji: "✉️", label: "No spam, ever" },
            { emoji: "🎉", label: "First 500 only" },
          ].map(b => (
            <div key={b.label} style={{
              fontSize: 12, color: "#64748B",
              fontFamily: "Nunito, sans-serif",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 14 }}>{b.emoji}</span>
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "40px",
      textAlign: "center",
      color: "#475569",
      fontFamily: "Nunito, sans-serif",
      fontSize: 13,
    }}>
      <div style={{
        fontFamily: "Fredoka One, cursive",
        fontSize: 18,
        background: "linear-gradient(135deg, #FFD700, #FF6B6B)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: 8,
      }}>
        🎁 Digital Prize Box
      </div>
      <div style={{ marginBottom: 12 }}>
        Kids earn it. Parents control it.
      </div>
      <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {["Terms", "Privacy", "Support", "Contact"].map(l => (
          <a key={l} href={`/${l.toLowerCase()}`} style={{
            color: "#475569", textDecoration: "none",
          }}>{l}</a>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        © 2025 Digital Prize Box. All rights reserved.
      </div>
    </footer>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const goToApp  = () => navigate("/login");

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)",
      fontFamily: "Nunito, sans-serif",
      position: "relative",
      overflowX: "hidden",
    }}>
      <style>{css}</style>
      <Stars />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Nav onGetStarted={goToApp} />
        <Hero onGetStarted={goToApp} />
        <HowItWorks />
        <WhoItsFor />
        <Pricing onGetStarted={goToApp} />
        <Waitlist onGetStarted={goToApp} />
        <Footer />
      </div>
    </div>
  );
}

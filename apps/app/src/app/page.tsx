import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PricingSection from "@/components/landing/PricingSection";
import AnimationInit from "@/components/landing/AnimationInit";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div style={{ fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif", background: "#0a0a0f" }}>

      <AnimationInit />

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="header-animate" style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,15,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", height: 60, gap: "2rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, rgba(0,102,255,0.2), rgba(0,102,255,0.08))", border: "1px solid rgba(0,102,255,0.3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#0066ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 22V12h6v10" stroke="#0066ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>
              Prop<span style={{ color: "#4da6ff" }}>Gate</span>
            </span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: "0.125rem", flex: 1, justifyContent: "center" }}>
            {[["Features", "#features"], ["Preise", "#preise"], ["Sicherheit", "#sicherheit"]].map(([label, href]) => (
              <a key={label} href={href} className="nav-link" style={{ color: "#7a8394", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500, padding: "0.5rem 0.875rem", borderRadius: 6, transition: "color 0.2s ease" }}>
                {label}
              </a>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
            <Link href="/login" className="nav-link" style={{ color: "#7a8394", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500, padding: "0.4rem 0.75rem", borderRadius: 6 }}>
              Anmelden
            </Link>
            <Link href="/register" className="btn-primary magnetic" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#ffffff", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, padding: "0.5rem 1rem", borderRadius: 8, whiteSpace: "nowrap" }}>
              Kostenlos starten
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section data-dark style={{ background: "#0a0a0f", position: "relative", overflow: "hidden", padding: "7rem 1.5rem 5rem", minHeight: "100vh", display: "flex", alignItems: "center" }}>

        {/* Ambient orbs */}
        <div className="orb-1" style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,102,255,0.35) 0%, transparent 65%)", filter: "blur(70px)", top: -200, left: -150, pointerEvents: "none", zIndex: 0 }} />
        <div className="orb-2" style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,80,220,0.28) 0%, transparent 65%)", filter: "blur(70px)", top: "5%", right: -180, pointerEvents: "none", zIndex: 0 }} />
        <div className="orb-3" style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(77,166,255,0.22) 0%, transparent 65%)", filter: "blur(70px)", bottom: "8%", left: "25%", pointerEvents: "none", zIndex: 0 }} />

        {/* Dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "36px 36px", maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)", pointerEvents: "none", zIndex: 0 }} />

        {/* Floating particles */}
        {[
          { left: "12%", bottom: "22%", delay: "0s",   dur: "6s",  dx: "25px" },
          { left: "22%", bottom: "14%", delay: "1.8s", dur: "8s",  dx: "-30px" },
          { left: "42%", bottom: "9%",  delay: "0.6s", dur: "7s",  dx: "35px" },
          { left: "62%", bottom: "17%", delay: "2.5s", dur: "5.5s",dx: "-22px" },
          { left: "75%", bottom: "11%", delay: "0.3s", dur: "9s",  dx: "18px" },
          { left: "86%", bottom: "26%", delay: "2s",   dur: "6.5s",dx: "-28px" },
          { left: "33%", bottom: "32%", delay: "3.2s", dur: "7.5s",dx: "30px" },
          { left: "52%", bottom: "7%",  delay: "1.1s", dur: "8.5s",dx: "-16px" },
        ].map((p, i) => (
          <div key={i} className="particle" style={{ left: p.left, bottom: p.bottom, ["--delay" as string]: p.delay, ["--dur" as string]: p.dur, ["--dx" as string]: p.dx, zIndex: 0 }} />
        ))}

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", textAlign: "center", width: "100%" }}>

          {/* Badge */}
          <div className="hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(0,102,255,0.08)", border: "1px solid rgba(0,102,255,0.2)", color: "#7db8ff", fontSize: "0.8125rem", fontWeight: 500, padding: "0.375rem 0.875rem", borderRadius: 100, marginBottom: "2.25rem", letterSpacing: "0.01em" }}>
            <span className="badge-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#0066ff", boxShadow: "0 0 8px rgba(0,102,255,0.8)", display: "inline-block", flexShrink: 0 }} />
            30 Tage kostenlos — keine Kreditkarte
            <span style={{ background: "rgba(0,102,255,0.2)", color: "#4da6ff", fontSize: "0.7rem", fontWeight: 600, padding: "0.1rem 0.45rem", borderRadius: 100, letterSpacing: "0.04em", textTransform: "uppercase" }}>Neu</span>
          </div>

          {/* Headline — line by line reveal */}
          <h1 style={{ margin: "0 0 1.5rem", padding: 0, lineHeight: 1.08, letterSpacing: "-0.04em", fontWeight: 800 }}>
            {/* Line 1 */}
            <span className="line-wrap">
              <span className="line-1" style={{ fontSize: "clamp(2.8rem, 7vw, 5.25rem)", color: "#f0f4ff", display: "block" }}>
                Hausverwaltung,
              </span>
            </span>
            {/* Line 2 */}
            <span className="line-wrap">
              <span className="line-2" style={{ fontSize: "clamp(2.8rem, 7vw, 5.25rem)", color: "#f0f4ff", display: "block" }}>
                die wirklich
              </span>
            </span>
            {/* Line 3 — gradient shimmer */}
            <span className="line-wrap">
              <span className="line-3 gradient-text" style={{ fontSize: "clamp(2.8rem, 7vw, 5.25rem)", display: "block" }}>
                funktioniert.
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-sub" style={{ fontSize: "1.0625rem", lineHeight: 1.75, color: "#7a8394", maxWidth: 520, margin: "0 auto 2.5rem", fontWeight: 400 }}>
            Objekte, Mieter, Bankimport, Mahnwesen & Tickets —
            alles in einer modernen Plattform. DSGVO-konform, cloudbasiert.
          </p>

          {/* CTAs */}
          <div className="hero-ctas" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.875rem", flexWrap: "wrap", marginBottom: "3rem" }}>
            <Link
              href="/register"
              className="btn-primary magnetic"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#ffffff", textDecoration: "none", fontSize: "1rem", fontWeight: 600, padding: "0.875rem 1.75rem", borderRadius: 10 }}
            >
              Jetzt kostenlos starten
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link
              href="/login"
              className="btn-ghost magnetic"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#6b7585", textDecoration: "none", fontSize: "1rem", fontWeight: 500, padding: "0.875rem 1.5rem", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Demo ansehen
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            </Link>
          </div>

          {/* Social proof stats */}
          <div className="hero-stats" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0rem", marginBottom: "4rem" }}>
            {[
              { n: "2.500+", label: "Objekte verwaltet" },
              { n: "99.9%", label: "Uptime garantiert" },
              { n: "DSGVO", label: "EU-konform" },
            ].map((s, i) => (
              <div key={i} className="stat-item" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 2rem", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none", ["--delay" as string]: `${1.05 + i * 0.12}s` }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.n}</span>
                <span style={{ fontSize: "0.75rem", color: "#5a6478", marginTop: "0.25rem", fontWeight: 500, letterSpacing: "0.01em" }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Browser Mockup */}
          <div className="browser-mockup" style={{ background: "#11121a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 50px 100px rgba(0,0,0,0.6), 0 0 80px rgba(0,102,255,0.06)", maxWidth: 860, margin: "0 auto" }}>
            {/* Chrome bar */}
            <div style={{ background: "#16171f", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "0.3rem 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#5a6478", fontSize: "0.75rem", maxWidth: 320, margin: "0 auto" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3d7eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                app.propgate.de/dashboard
              </div>
            </div>
            {/* Dashboard preview */}
            <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", height: 310, position: "relative" }}>
              <div className="scan-line" />
              {/* Sidebar */}
              <div style={{ background: "#0d0e15", borderRight: "1px solid rgba(255,255,255,0.04)", padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {[true, false, false, false, false].map((active, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0.625rem", borderRadius: 6, background: active ? "rgba(0,102,255,0.15)" : "transparent" }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: active ? "#0066ff" : "rgba(255,255,255,0.1)", flexShrink: 0 }} />
                    <div style={{ flex: 1, height: 7, borderRadius: 4, background: active ? "rgba(0,102,255,0.45)" : "rgba(255,255,255,0.07)" }} />
                  </div>
                ))}
              </div>
              {/* Main */}
              <div style={{ padding: "1.25rem 1.375rem", display: "flex", flexDirection: "column", gap: "0.875rem", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ height: 16, width: 140, borderRadius: 5, background: "rgba(255,255,255,0.12)" }} />
                  <div style={{ height: 26, width: 90, borderRadius: 6, background: "linear-gradient(135deg, rgba(0,102,255,0.7), rgba(0,80,200,0.7))" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.625rem" }}>
                  {["rgba(0,102,255,0.55)", "rgba(34,197,94,0.55)", "rgba(249,115,22,0.55)", "rgba(139,92,246,0.55)"].map((c, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "0.7rem" }}>
                      <div style={{ height: 6, width: "55%", borderRadius: 3, background: "rgba(255,255,255,0.08)", marginBottom: "0.375rem" }} />
                      <div style={{ height: 20, width: "65%", borderRadius: 4, background: c, marginBottom: "0.3rem" }} />
                      <div style={{ height: 5, width: "35%", borderRadius: 3, background: "rgba(34,197,94,0.2)" }} />
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ padding: "0.45rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.02)" }}>
                    {["2fr","1fr","1fr","0.6fr"].map((w, i) => <div key={i} style={{ flex: w, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.07)" }} />)}
                  </div>
                  {[["#22c55e","rgba(34,197,94,0.18)"],["#3d7eff","rgba(0,102,255,0.18)"],["#f97316","rgba(249,115,22,0.18)"]].map(([dot, val], i) => (
                    <div key={i} style={{ display: "flex", gap: "0.5rem", padding: "0.55rem 0.75rem", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.03)" : "none", alignItems: "center" }}>
                      <div style={{ flex: 2, display: "flex", gap: "0.375rem", alignItems: "center" }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                        <div style={{ flex: 1, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.09)" }} />
                      </div>
                      <div style={{ flex: 1, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.09)" }} />
                      <div style={{ flex: 1, height: 7, borderRadius: 4, background: val }} />
                      <div style={{ flex: 0.6, height: 16, borderRadius: 100, background: "rgba(255,255,255,0.07)" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ──────────────────────────────────────────── */}
      <section style={{ background: "#ffffff", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "1.125rem 1.5rem" }}>
        <div data-stagger-parent style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "0.75rem 2.5rem" }}>
          {[
            { label: "DSGVO-konform", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
            { label: "EU-Hosting", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg> },
            { label: "2FA-Sicherheit", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg> },
            { label: "Tägliche Backups", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg> },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#4b5563", fontSize: "0.875rem", fontWeight: 500 }}>
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="features" style={{ background: "#ffffff", padding: "5.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div data-animate style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0066ff", marginBottom: "0.875rem" }}>Features</p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.035em", color: "#0f0f1a", marginBottom: "1rem", lineHeight: 1.12 }}>
              Alles für professionelle<br />Hausverwaltung
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "#5a6478", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
              Von der Objektverwaltung bis zum Bankimport — PropGate bietet alle Werkzeuge.
            </p>
          </div>

          <div data-stagger-parent style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.125rem" }}>
            {[
              { title: "Objektverwaltung", desc: "Objekte und Einheiten mit allen Details, Statushistorie und Portfolio-Übersicht.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
              { title: "Bankimport & Matching", desc: "CSV-Import mit intelligentem Auto-Matching — Zahlungen werden automatisch zugeordnet.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> },
              { title: "Mahnwesen", desc: "Automatische Mahnvorschläge mit Gebühren. Mahnschreiben als PDF generieren.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /></svg> },
              { title: "Ticketsystem", desc: "Schadensmeldungen strukturiert erfassen — mit Status-Workflow und Verantwortlichkeiten.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg> },
              { title: "Zählerverwaltung", desc: "Strom-, Gas- und Wasserzähler verwalten mit Foto-Upload bei Ein- und Auszug.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> },
              { title: "Audit-Logs & DSGVO", desc: "Strikte Mandantentrennung. Alle Operationen werden mit Zeitstempel protokolliert.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
            ].map((f) => (
              <div key={f.title} className="feature-card" style={{ background: "#fafafa", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 12, padding: "1.625rem" }}>
                <div className="feature-icon" style={{ width: 42, height: 42, background: "rgba(0,102,255,0.07)", border: "1px solid rgba(0,102,255,0.12)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f0f1a", marginBottom: "0.4rem", letterSpacing: "-0.01em" }}>{f.title}</h3>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.65, color: "#6b7280" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section style={{ background: "#f5f7fc", padding: "5.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div data-animate style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0066ff", marginBottom: "0.875rem" }}>So funktioniert&apos;s</p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.035em", color: "#0f0f1a", marginBottom: "1rem", lineHeight: 1.12 }}>
              In drei Schritten zur<br />digitalen Verwaltung
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "#5a6478", maxWidth: 440, margin: "0 auto" }}>Ohne lange Einarbeitung — sofort einsatzbereit.</p>
          </div>
          <div data-stagger-parent style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.125rem" }}>
            {[
              { n: "01", title: "Konto erstellen & Objekte anlegen", desc: "Kostenloses Konto in 2 Minuten — dann Immobilien mit Adressen, Einheiten und allen Details anlegen." },
              { n: "02", title: "Mieter & Verträge erfassen", desc: "Mieter, Mietverträge und Zahlungsmodalitäten hinterlegen. Sollstellungen werden automatisch erstellt." },
              { n: "03", title: "Automatisiert verwalten", desc: "Kontoauszüge per CSV importieren, Zahlungen automatisch matchen und Mahnvorschläge auf Knopfdruck." },
            ].map((s) => (
              <div key={s.n} style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 12, padding: "1.875rem 1.625rem" }}>
                <span className="step-number" style={{ fontSize: "3rem", fontWeight: 800, color: "rgba(0,102,255,0.12)", lineHeight: 1, marginBottom: "1.25rem", letterSpacing: "-0.05em", display: "block" }}>{s.n}</span>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f0f1a", marginBottom: "0.5rem", lineHeight: 1.4 }}>{s.title}</h3>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.65, color: "#6b7280" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────── */}
      <PricingSection />

      {/* ── SECURITY ───────────────────────────────────────────── */}
      <section id="sicherheit" style={{ background: "#f5f7fc", padding: "5.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div data-animate style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0066ff", marginBottom: "0.875rem" }}>Sicherheit</p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.035em", color: "#0f0f1a", marginBottom: "1rem", lineHeight: 1.12 }}>Ihre Daten in sicheren Händen</h2>
            <p style={{ fontSize: "1.0625rem", color: "#5a6478", maxWidth: 440, margin: "0 auto" }}>Entwickelt mit Datenschutz und Sicherheit als oberstem Gebot.</p>
          </div>
          <div data-stagger-parent style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.125rem" }}>
            {[
              { title: "DSGVO-konform", desc: "Mandantentrennung und Audit-Logs gemäß EU-DSGVO.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
              { title: "TLS-Verschlüsselung", desc: "Alle Übertragungen verschlüsselt. Passwörter sicher gehasht.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg> },
              { title: "Tägliche Backups", desc: "Point-in-Time-Recovery. Kein Datenverlust.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg> },
              { title: "EU-Hosting", desc: "Infrastruktur in europäischen Rechenzentren.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg> },
            ].map((item) => (
              <div key={item.title} className="feature-card" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 12, padding: "1.625rem" }}>
                <div className="feature-icon" style={{ width: 42, height: 42, background: "rgba(0,102,255,0.07)", border: "1px solid rgba(0,102,255,0.12)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f0f1a", marginBottom: "0.4rem" }}>{item.title}</h3>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.65, color: "#6b7280" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────── */}
      <section data-dark style={{ background: "#0a0a0f", padding: "7rem 1.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="orb-1" style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,102,255,0.25) 0%, transparent 70%)", filter: "blur(80px)", top: -150, left: -120, pointerEvents: "none" }} />
        <div className="orb-3" style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(77,166,255,0.18) 0%, transparent 70%)", filter: "blur(80px)", bottom: -120, right: -80, pointerEvents: "none" }} />
        <div data-animate style={{ position: "relative", zIndex: 1, maxWidth: 620, margin: "0 auto" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3d7eff", marginBottom: "1.25rem" }}>Jetzt loslegen</p>
          <h2 style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.04em", color: "#f0f4ff", marginBottom: "1.25rem" }}>
            Bereit für moderne<br />
            <span className="gradient-text">Hausverwaltung?</span>
          </h2>
          <p style={{ fontSize: "1.0625rem", lineHeight: 1.7, color: "#5a6478", marginBottom: "2.5rem" }}>
            Starten Sie kostenlos — keine Kreditkarte, kein Risiko.<br />In wenigen Minuten einsatzbereit.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.875rem", flexWrap: "wrap" }}>
            <Link href="/register" className="btn-primary magnetic" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#ffffff", textDecoration: "none", fontSize: "1rem", fontWeight: 600, padding: "0.875rem 1.75rem", borderRadius: 10 }}>
              Kostenlos starten
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link href="/login" className="btn-ghost magnetic" style={{ display: "inline-flex", alignItems: "center", color: "#5a6478", textDecoration: "none", fontSize: "1rem", fontWeight: 500, padding: "0.875rem 1.5rem", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
              Bereits angemeldet?
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer style={{ background: "#070710", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "4rem 1.5rem 2.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "3rem", paddingBottom: "3rem", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "2rem" }}>
            <div style={{ maxWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <div style={{ width: 30, height: 30, background: "rgba(0,102,255,0.1)", border: "1px solid rgba(0,102,255,0.2)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#0066ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 22V12h6v10" stroke="#0066ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#ffffff" }}>Prop<span style={{ color: "#4da6ff" }}>Gate</span></span>
              </div>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.65, color: "#4b5563" }}>Moderne Hausverwaltungssoftware für professionelle Immobilienverwalter. DSGVO-konform, cloudbasiert, effizient.</p>
            </div>
            <div>
              <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#9ca3af", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Produkt</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {[["Features", "#features"], ["Preise", "#preise"], ["Sicherheit", "#sicherheit"]].map(([l, h]) => (
                  <a key={l} href={h} style={{ color: "#4b5563", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.15s ease" }}>{l}</a>
                ))}
                <Link href="/register" style={{ color: "#4b5563", textDecoration: "none", fontSize: "0.9rem" }}>Kostenlos starten</Link>
              </div>
            </div>
            <div>
              <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#9ca3af", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Rechtliches</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <Link href="/impressum" style={{ color: "#4b5563", textDecoration: "none", fontSize: "0.9rem" }}>Impressum</Link>
                <Link href="/datenschutz" style={{ color: "#4b5563", textDecoration: "none", fontSize: "0.9rem" }}>Datenschutz</Link>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ fontSize: "0.8125rem", color: "#374151" }}>&copy; {new Date().getFullYear()} PropGate. Alle Rechte vorbehalten.</p>
            <p style={{ fontSize: "0.8125rem", color: "#374151" }}>Made in Germany 🇩🇪</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

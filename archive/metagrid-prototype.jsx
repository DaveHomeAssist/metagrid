import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0a0c10",
  surface: "#12151c",
  surfaceAlt: "#181c26",
  border: "#1f2533",
  borderLight: "#2a3040",
  accent: "#00d4aa",
  accentDim: "#00d4aa22",
  accentMid: "#00d4aa66",
  text: "#e8eaf0",
  textMuted: "#8892a4",
  textDim: "#5a6478",
  white: "#ffffff",
  warning: "#f59e0b",
  danger: "#ef4444",
};

const FONTS = {
  display: "'DM Sans', sans-serif",
  body: "'IBM Plex Sans', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

// --- Utility Components ---

function GridBackground() {
  return (
    <div aria-hidden="true" style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundImage: `
        linear-gradient(${COLORS.border}33 1px, transparent 1px),
        linear-gradient(90deg, ${COLORS.border}33 1px, transparent 1px)
      `,
      backgroundSize: "80px 80px",
      pointerEvents: "none",
      zIndex: 0,
    }} />
  );
}

function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Section({ id, children, style = {} }) {
  return (
    <section id={id} style={{
      position: "relative", zIndex: 1,
      padding: "100px 24px",
      maxWidth: 1100, margin: "0 auto",
      ...style,
    }}>
      {children}
    </section>
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{
      fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.18em",
      textTransform: "uppercase", color: COLORS.accent, marginBottom: 12,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{
        width: 20, height: 1, background: COLORS.accent, display: "inline-block"
      }} />
      {text}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: FONTS.display, fontSize: "clamp(28px, 4vw, 42px)",
      fontWeight: 700, color: COLORS.white, margin: "0 0 20px",
      lineHeight: 1.15, letterSpacing: "-0.02em",
    }}>
      {children}
    </h2>
  );
}

function Btn({ children, primary, onClick, href, disabled, style = {} }) {
  const base = {
    fontFamily: FONTS.body, fontSize: 14, fontWeight: 600,
    padding: "12px 28px", borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer",
    border: primary ? "none" : `1px solid ${COLORS.borderLight}`,
    background: primary ? COLORS.accent : "transparent",
    color: primary ? COLORS.bg : COLORS.text,
    transition: "all 0.25s ease",
    textDecoration: "none", display: "inline-block",
    opacity: disabled ? 0.45 : 1,
    pointerEvents: disabled ? "none" : "auto",
    ...style,
  };
  if (href) return <a href={href} onClick={onClick} style={base}>{children}</a>;
  return <button onClick={onClick} disabled={disabled} style={base}>{children}</button>;
}

// --- Nav ---

function Nav({ activeSection }) {
  const links = [
    { id: "whynow", label: "Why Now" },
    { id: "what", label: "What" },
    { id: "tech", label: "Technology" },
    { id: "roadmap", label: "Roadmap" },
    { id: "safety", label: "Safety" },
    { id: "team", label: "Team" },
    { id: "faq", label: "FAQ" },
  ];
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(max-width: 860px)");
    const sync = () => {
      setMobileNav(media.matches);
      if (!media.matches) setMenuOpen(false);
    };
    sync();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", sync);
      return () => media.removeEventListener("change", sync);
    }
    media.addListener(sync);
    return () => media.removeListener(sync);
  }, []);

  const navLinkStyle = (id, compact = false) => ({
    fontFamily: FONTS.mono,
    fontSize: compact ? 12 : 11,
    letterSpacing: compact ? "0.08em" : "0.06em",
    color: activeSection === id ? COLORS.accent : COLORS.textMuted,
    textDecoration: "none",
    padding: compact ? "10px 0" : "6px 10px",
    borderRadius: 4,
    transition: "color 0.2s",
    whiteSpace: "nowrap",
    flexShrink: 0,
    textTransform: "uppercase",
  });

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: `${COLORS.bg}dd`, backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${COLORS.border}`,
      padding: "0 24px",
    }} aria-label="Primary navigation">
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 60,
      }}>
        <a href="#hero" style={{
          fontFamily: FONTS.display, fontWeight: 800, fontSize: 18,
          color: COLORS.white, textDecoration: "none", letterSpacing: "-0.03em",
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: 2, background: COLORS.accent,
            display: "inline-block",
          }} />
          METAGRID
        </a>
        {mobileNav ? (
          <button
            type="button"
            onClick={() => setMenuOpen(open => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="metagrid-mobile-nav"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 40, height: 40, borderRadius: 6, border: `1px solid ${COLORS.borderLight}`,
              background: "transparent", color: COLORS.textMuted, cursor: "pointer",
              padding: 0, flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        ) : (
          <div style={{
            display: "flex", gap: 6, alignItems: "center",
            overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch", flexShrink: 1, minWidth: 0,
          }}>
            {links.map(l => (
              <a key={l.id} href={`#${l.id}`} aria-current={activeSection === l.id ? "location" : undefined} style={navLinkStyle(l.id)}>
                {l.label.toUpperCase()}
              </a>
            ))}
            <Btn primary href="#contact" style={{ marginLeft: 8, padding: "8px 18px", fontSize: 12, flexShrink: 0 }}>
              Get Involved
            </Btn>
          </div>
        )}
      </div>
      {mobileNav && menuOpen && (
        <div
          id="metagrid-mobile-nav"
          style={{
            maxWidth: 1100, margin: "0 auto", padding: "10px 0 16px",
            display: "flex", flexDirection: "column", gap: 4,
          }}
        >
          {links.map(l => (
            <a
              key={l.id}
              href={`#${l.id}`}
              aria-current={activeSection === l.id ? "location" : undefined}
              onClick={() => setMenuOpen(false)}
              style={navLinkStyle(l.id, true)}
            >
              {l.label}
            </a>
          ))}
          <Btn primary href="#contact" onClick={() => setMenuOpen(false)} style={{ marginTop: 8, textAlign: "center" }}>
            Get Involved
          </Btn>
        </div>
      )}
    </nav>
  );
}

// --- Hero ---

function Hero() {
  return (
    <Section id="hero" style={{ paddingTop: 160, paddingBottom: 80 }}>
      <FadeIn>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textDim,
          letterSpacing: "0.12em", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 16,
        }}>
          WIRELESS POWER INFRASTRUCTURE
          <span style={{
            fontFamily: FONTS.mono, fontSize: 10, letterSpacing: "0.08em",
            padding: "4px 10px", borderRadius: 4,
            border: `1px solid ${COLORS.accent}66`, color: COLORS.accent,
            background: COLORS.accentDim,
          }}>PATENT PENDING</span>
        </div>
      </FadeIn>
      <FadeIn delay={0.1}>
        <h1 style={{
          fontFamily: FONTS.display, fontWeight: 800,
          fontSize: "clamp(36px, 6vw, 68px)", lineHeight: 1.05,
          color: COLORS.white, margin: "0 0 28px", letterSpacing: "-0.03em",
          maxWidth: 800,
        }}>
          Power delivery,{" "}
          <span style={{ color: COLORS.accent }}>without the wire.</span>
        </h1>
      </FadeIn>
      <FadeIn delay={0.2}>
        <p style={{
          fontFamily: FONTS.body, fontSize: 18, lineHeight: 1.7,
          color: COLORS.textMuted, maxWidth: 560, margin: "0 0 40px",
        }}>
          Metagrid is engineering a hierarchical, safety-first wireless power network
          using metamaterials and adaptive control — delivering utility-scale energy
          to remote AI data centers and critical infrastructure without traditional
          last-mile wiring.
        </p>
      </FadeIn>
      <FadeIn delay={0.3}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Btn primary href="#contact">Request an Intro</Btn>
          <Btn href="#what">Learn More →</Btn>
        </div>
      </FadeIn>
      <FadeIn delay={0.45}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 1, marginTop: 80, background: COLORS.border, borderRadius: 8,
          overflow: "hidden",
        }}>
          {[
            { label: "Focus", value: "Metamaterial WPT" },
            { label: "Application", value: "Remote AI Infrastructure" },
            { label: "Stage", value: "Concept / Patent Pending" },
            { label: "Seeking", value: "Pre-Seed Investment" },
          ].map((s, i) => (
            <div key={i} style={{
              background: COLORS.surface, padding: "22px 24px",
            }}>
              <div style={{
                fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textDim,
                letterSpacing: "0.12em", marginBottom: 6,
              }}>{s.label.toUpperCase()}</div>
              <div style={{
                fontFamily: FONTS.body, fontSize: 14, color: COLORS.text,
                fontWeight: 600,
              }}>{s.value}</div>
            </div>
          ))}
        </div>
      </FadeIn>
    </Section>
  );
}

// --- Why Now ---

function WhyNowSection() {
  return (
    <Section id="whynow" style={{ paddingTop: 80, paddingBottom: 60 }}>
      <FadeIn>
        <SectionLabel text="Why Now" />
        <SectionTitle>The grid wasn't built for this</SectionTitle>
        <p style={{
          fontFamily: FONTS.body, fontSize: 16, color: COLORS.textMuted,
          lineHeight: 1.7, maxWidth: 600, marginBottom: 40,
        }}>
          AI is driving explosive demand for compute — and that compute needs power.
          Data centers are increasingly sited in remote locations to access cheap land
          and resources, but the grid can't follow fast enough.
        </p>
      </FadeIn>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 2, marginTop: 16,
      }}>
        {[
          {
            stat: "35%",
            label: "Annual growth in AI data center energy demand",
            source: "IEA, 2025",
          },
          {
            stat: "4–7 yrs",
            label: "Typical timeline to build new transmission infrastructure",
            source: "DOE estimates",
          },
          {
            stat: "$B+",
            label: "Capital stranded waiting for grid interconnection queues",
            source: "LBNL, 2024",
          },
        ].map((s, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div style={{
              background: COLORS.surface, borderRadius: 8,
              border: `1px solid ${COLORS.border}`, padding: "28px 24px",
            }}>
              <div style={{
                fontFamily: FONTS.display, fontSize: 32, fontWeight: 800,
                color: COLORS.accent, marginBottom: 8, letterSpacing: "-0.02em",
              }}>{s.stat}</div>
              <div style={{
                fontFamily: FONTS.body, fontSize: 14, color: COLORS.text,
                lineHeight: 1.6, marginBottom: 10,
              }}>{s.label}</div>
              <div style={{
                fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textDim,
              }}>{s.source}</div>
            </div>
          </FadeIn>
        ))}
      </div>
      <FadeIn delay={0.35}>
        <div style={{
          marginTop: 32, padding: "20px 28px", borderRadius: 8,
          border: `1px solid ${COLORS.border}`,
          background: COLORS.surfaceAlt,
          fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted,
          lineHeight: 1.7,
        }}>
          <strong style={{ color: COLORS.white }}>The opportunity:</strong>{" "}
          Remote AI facilities need power now, but traditional grid extension takes years
          and costs hundreds of millions per project. Wireless power transfer could bypass
          the last-mile bottleneck entirely — delivering energy where wires can't reach,
          on timelines the market demands.
        </div>
      </FadeIn>
    </Section>
  );
}

// --- What is Metagrid ---

function WhatSection() {
  return (
    <Section id="what">
      <FadeIn>
        <SectionLabel text="60-Second Explainer" />
        <SectionTitle>What is Metagrid?</SectionTitle>
      </FadeIn>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 40, marginTop: 40 }}>
        <FadeIn delay={0.1}>
          <p style={{
            fontFamily: FONTS.body, fontSize: 16, lineHeight: 1.8,
            color: COLORS.textMuted,
          }}>
            Metagrid is a next-generation energy distribution concept: a hierarchical
            wireless power network that uses engineered metamaterials and adaptive
            beamforming to deliver electricity without physical conductors in the
            last-mile. The core technology is patent pending.
          </p>
          <p style={{
            fontFamily: FONTS.body, fontSize: 16, lineHeight: 1.8,
            color: COLORS.textMuted, marginTop: 16,
          }}>
            The primary application: powering remote AI data centers that are
            increasingly sited far from existing grid infrastructure to access
            cheap land and resources. Think of it as a cellular network — but for
            energy, routing power through tiers of relay nodes with real-time
            safety management.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div style={{
            background: COLORS.surface, border: `1px solid ${COLORS.border}`,
            borderRadius: 8, padding: 32,
          }}>
            <div style={{
              fontFamily: FONTS.mono, fontSize: 11, color: COLORS.accent,
              letterSpacing: "0.1em", marginBottom: 20,
            }}>PROBLEMS SOLVED</div>
            {[
              "Remote AI data centers stranded by grid interconnection delays",
              "Explosive compute demand outpacing transmission buildout",
              "Last-mile deployment friction in dense or remote terrain",
              "Stranded renewable capacity with no viable transmission path",
            ].map((p, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                marginBottom: 14,
              }}>
                <span aria-hidden="true" style={{
                  width: 6, height: 6, borderRadius: 1, background: COLORS.accent,
                  marginTop: 7, flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: FONTS.body, fontSize: 14, color: COLORS.text,
                  lineHeight: 1.6,
                }}>{p}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

// --- Technology ---

function TechSection() {
  const pillars = [
    {
      title: "Metamaterials",
      desc: "Engineered surface structures that shape and confine electromagnetic fields with sub-wavelength precision.",
      building: [
        "Flat-lens antenna arrays for directed power transfer",
        "Frequency-selective surfaces for beam confinement",
        "Reconfigurable metamaterial elements for adaptive steering",
      ],
      proving: [
        "Efficiency at target distances and power levels",
        "Fabrication scalability and cost at volume",
        "Thermal management under continuous operation",
      ],
    },
    {
      title: "Adaptive Beamforming & Control",
      desc: "Real-time beam steering, load balancing, and safety interlock systems driven by sensor feedback.",
      building: [
        "Closed-loop beam tracking and power regulation",
        "Multi-receiver load management algorithms",
        "Fail-safe cutoff and exposure monitoring",
      ],
      proving: [
        "Latency and reliability of safety interlocks",
        "Scalability of control algorithms to many nodes",
        "Robustness in dynamic, obstructed environments",
      ],
    },
    {
      title: "Hierarchical Distribution",
      desc: "A tiered relay architecture that routes power through zones, balancing capacity, safety, and redundancy.",
      building: [
        "Tier-structured relay node network design",
        "Zone-based power routing and handoff protocols",
        "Redundancy and graceful degradation strategies",
      ],
      proving: [
        "End-to-end efficiency across relay tiers",
        "Scalability from room to building to campus",
        "Economic viability vs. wired alternatives",
      ],
    },
  ];
  return (
    <Section id="tech">
      <FadeIn>
        <SectionLabel text="Technology" />
        <SectionTitle>How it works</SectionTitle>
        <p style={{
          fontFamily: FONTS.body, fontSize: 16, color: COLORS.textMuted,
          lineHeight: 1.7, maxWidth: 600, marginBottom: 48,
        }}>
          Three interlocking technology pillars form the Metagrid architecture.
          Each has clear build targets and validation gates.
        </p>
      </FadeIn>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {pillars.map((p, i) => (
          <FadeIn key={i} delay={i * 0.12}>
            <div style={{
              background: COLORS.surface, borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              padding: "36px 36px 32px",
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <span style={{
                  fontFamily: FONTS.mono, fontSize: 11, color: COLORS.accent,
                  background: COLORS.accentDim, padding: "3px 8px", borderRadius: 4,
                }}>0{i + 1}</span>
                <h3 style={{
                  fontFamily: FONTS.display, fontSize: 20, fontWeight: 700,
                  color: COLORS.white, margin: 0,
                }}>{p.title}</h3>
              </div>
              <p style={{
                fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted,
                lineHeight: 1.7, marginBottom: 24, maxWidth: 600,
              }}>{p.desc}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
                <div>
                  <div style={{
                    fontFamily: FONTS.mono, fontSize: 10, color: COLORS.accent,
                    letterSpacing: "0.12em", marginBottom: 12,
                  }}>WHAT WE'RE BUILDING</div>
                  {p.building.map((b, j) => (
                    <div key={j} style={{
                      fontFamily: FONTS.body, fontSize: 13, color: COLORS.text,
                      lineHeight: 1.6, marginBottom: 8, paddingLeft: 14,
                      borderLeft: `2px solid ${COLORS.accent}44`,
                    }}>{b}</div>
                  ))}
                </div>
                <div>
                  <div style={{
                    fontFamily: FONTS.mono, fontSize: 10, color: COLORS.warning,
                    letterSpacing: "0.12em", marginBottom: 12,
                  }}>WHAT MUST BE PROVEN</div>
                  {p.proving.map((v, j) => (
                    <div key={j} style={{
                      fontFamily: FONTS.body, fontSize: 13, color: COLORS.text,
                      lineHeight: 1.6, marginBottom: 8, paddingLeft: 14,
                      borderLeft: `2px solid ${COLORS.warning}44`,
                    }}>{v}</div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

// --- Roadmap ---

function RoadmapSection() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Concept Validation & Feasibility",
      trl: "TRL 1–3",
      timeline: "Months 1–12",
      items: [
        "Patent application filed (pending)",
        "Metamaterial element design and simulation",
        "Bench-scale power transfer experiments",
        "Safety envelope modeling and sensor prototyping",
        "Control loop architecture definition",
      ],
      funding: "$250K–$500K",
    },
    {
      phase: "Phase 2",
      title: "Subsystem Validation",
      trl: "TRL 3–4",
      timeline: "Months 12–24",
      items: [
        "Multi-element array fabrication and testing",
        "Closed-loop beamforming demonstration",
        "Single-tier relay proof of concept",
        "Safety interlock validation under fault conditions",
      ],
      funding: "$1M–$2M",
    },
    {
      phase: "Phase 3",
      title: "Integrated Prototype",
      trl: "TRL 4–5",
      timeline: "Months 24–36",
      items: [
        "Multi-tier relay network demonstration",
        "Real-world pilot environment deployment",
        "Compliance and certification pathway initiation",
        "Partner integration and commercial pilot design",
      ],
      funding: "$3M–$5M",
    },
  ];
  return (
    <Section id="roadmap">
      <FadeIn>
        <SectionLabel text="Roadmap" />
        <SectionTitle>Milestones & Funding Gates</SectionTitle>
        <p style={{
          fontFamily: FONTS.body, fontSize: 16, color: COLORS.textMuted,
          lineHeight: 1.7, maxWidth: 600, marginBottom: 48,
        }}>
          Each phase has measurable exit criteria. Funding unlocks the next stage
          of validated R&D — no milestone, no next phase.
        </p>
      </FadeIn>
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", left: 18, top: 0, bottom: 0, width: 2,
          background: `linear-gradient(to bottom, ${COLORS.accent}, ${COLORS.border})`,
        }} />
        {phases.map((p, i) => (
          <FadeIn key={i} delay={i * 0.15}>
            <div style={{
              display: "flex", gap: 32, marginBottom: 40,
              position: "relative",
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: COLORS.bg, border: `2px solid ${COLORS.accent}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: FONTS.mono, fontSize: 12, color: COLORS.accent,
                flexShrink: 0, zIndex: 1,
              }}>{i + 1}</div>
              <div style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                borderRadius: 8, padding: "28px 32px", flex: 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  <div>
                    <span style={{
                      fontFamily: FONTS.mono, fontSize: 11, color: COLORS.accent,
                      letterSpacing: "0.1em",
                    }}>{p.phase}</span>
                    <h3 style={{
                      fontFamily: FONTS.display, fontSize: 18, fontWeight: 700,
                      color: COLORS.white, margin: "4px 0 0",
                    }}>{p.title}</h3>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{
                      fontFamily: FONTS.mono, fontSize: 11, padding: "4px 10px",
                      borderRadius: 4, background: COLORS.accentDim, color: COLORS.accent,
                    }}>{p.trl}</span>
                    <span style={{
                      fontFamily: FONTS.mono, fontSize: 11, padding: "4px 10px",
                      borderRadius: 4, background: `${COLORS.textDim}22`, color: COLORS.textMuted,
                    }}>{p.timeline}</span>
                  </div>
                </div>
                <div style={{ margin: "16px 0" }}>
                  {p.items.map((item, j) => (
                    <div key={j} style={{
                      fontFamily: FONTS.body, fontSize: 13, color: COLORS.text,
                      lineHeight: 1.6, marginBottom: 6, paddingLeft: 14,
                      borderLeft: `2px solid ${COLORS.border}`,
                    }}>{item}</div>
                  ))}
                </div>
                <div style={{
                  fontFamily: FONTS.mono, fontSize: 12, color: COLORS.accent,
                  marginTop: 16, paddingTop: 16, borderTop: `1px solid ${COLORS.border}`,
                }}>
                  Funding target: {p.funding}
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

// --- Safety ---

function SafetySection() {
  return (
    <Section id="safety">
      <FadeIn>
        <SectionLabel text="Safety & Compliance" />
        <SectionTitle>Safety is architecture, not an afterthought</SectionTitle>
        <p style={{
          fontFamily: FONTS.body, fontSize: 16, color: COLORS.textMuted,
          lineHeight: 1.7, maxWidth: 600, marginBottom: 48,
        }}>
          Metagrid's safety model is built into every layer of the system — from
          beam confinement physics to real-time sensing to fail-safe design.
        </p>
      </FadeIn>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 2,
      }}>
        {[
          {
            title: "Beam Confinement",
            desc: "Metamaterial-guided beams operate within defined safety corridors. Power is delivered directionally, not broadcast.",
            icon: "◎",
          },
          {
            title: "Real-Time Sensing",
            desc: "Continuous monitoring of field strength, occupancy, and environmental conditions feeds back into beam control.",
            icon: "◉",
          },
          {
            title: "Interlock Systems",
            desc: "Hardware-level fail-safes shut down transmission instantly if any safety parameter is violated.",
            icon: "⊘",
          },
          {
            title: "Exposure Compliance",
            desc: "Designed to meet or exceed FCC, IEEE, and ICNIRP exposure limits at every operating point.",
            icon: "◇",
          },
        ].map((s, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div style={{
              background: COLORS.surface, borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              padding: "32px 28px", height: "100%",
            }}>
              <div aria-hidden="true" style={{
                fontSize: 24, marginBottom: 16, color: COLORS.accent,
              }}>{s.icon}</div>
              <h3 style={{
                fontFamily: FONTS.display, fontSize: 16, fontWeight: 700,
                color: COLORS.white, margin: "0 0 10px",
              }}>{s.title}</h3>
              <p style={{
                fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted,
                lineHeight: 1.7, margin: 0,
              }}>{s.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
      <FadeIn delay={0.4}>
        <div style={{
          marginTop: 40, padding: "20px 28px", borderRadius: 8,
          border: `1px solid ${COLORS.accent}33`,
          background: COLORS.accentDim,
          fontFamily: FONTS.body, fontSize: 14, color: COLORS.text,
          lineHeight: 1.7,
        }}>
          <strong style={{ color: COLORS.accent }}>Fail-safe philosophy:</strong>{" "}
          The system defaults to OFF. Power is transmitted only when all safety
          conditions are confirmed. Any fault, obstruction, or anomaly triggers
          immediate shutdown — no operator intervention required.
        </div>
      </FadeIn>
    </Section>
  );
}

// --- Team ---

function TeamSection() {
  return (
    <Section id="team">
      <FadeIn>
        <SectionLabel text="Team" />
        <SectionTitle>Who's building this</SectionTitle>
      </FadeIn>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 2, marginTop: 40,
      }}>
        <FadeIn delay={0.1}>
          <div style={{
            background: COLORS.surface, borderRadius: 8,
            border: `1px solid ${COLORS.border}`, padding: "32px 28px",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 8,
              background: `linear-gradient(135deg, ${COLORS.accent}44, ${COLORS.accent}11)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: FONTS.display, fontWeight: 800, fontSize: 18,
              color: COLORS.accent, marginBottom: 16,
            }}>CW</div>
            <h3 style={{
              fontFamily: FONTS.display, fontSize: 16, fontWeight: 700,
              color: COLORS.white, margin: "0 0 4px",
            }}>Connor [Founder]</h3>
            <div style={{
              fontFamily: FONTS.mono, fontSize: 11, color: COLORS.textDim,
              marginBottom: 12,
            }}>Lead Researcher & System Architect</div>
            <p style={{
              fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted,
              lineHeight: 1.7, margin: 0,
            }}>
              Driving the R&D program from concept through experimentation.
              Responsible for system architecture, safety modeling, and
              research partnerships.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div style={{
            background: COLORS.surface, borderRadius: 8,
            border: `1px dashed ${COLORS.borderLight}`, padding: "32px 28px",
            display: "flex", flexDirection: "column", justifyContent: "center",
            minHeight: 200,
          }}>
            <div style={{
              fontFamily: FONTS.mono, fontSize: 11, color: COLORS.accent,
              letterSpacing: "0.1em", marginBottom: 12,
            }}>WE'RE SEEKING</div>
            {[
              "RF / Microwave Engineer",
              "Metamaterials Researcher",
              "Power Electronics Specialist",
              "Safety & Compliance Advisor",
              "Technical Advisory Board Members",
            ].map((r, i) => (
              <div key={i} style={{
                fontFamily: FONTS.body, fontSize: 13, color: COLORS.text,
                lineHeight: 1.6, marginBottom: 4, paddingLeft: 14,
                borderLeft: `2px solid ${COLORS.accent}44`,
              }}>{r}</div>
            ))}
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

// --- FAQ ---

function FAQSection() {
  const [open, setOpen] = useState(null);
  const faqs = [
    {
      q: "Is this just wireless charging?",
      a: "No. Wireless charging (like Qi) works at millimeters to centimeters. Metagrid is designing power transfer at room, building, and eventually campus scale — using fundamentally different physics and system architecture.",
    },
    {
      q: "Why AI data centers specifically?",
      a: "AI companies are increasingly building data centers in remote locations to access cheap land and resources. But extending the grid to these sites takes 4–7 years and costs hundreds of millions. Wireless power transfer could bridge that gap on a fraction of the timeline.",
    },
    {
      q: "What's the status of the patent?",
      a: "Our core technology is patent pending. We've filed for protection on the key innovations in metamaterial-based wireless power distribution and adaptive safety control architecture.",
    },
    {
      q: "What stage is the technology at?",
      a: "Metagrid is at concept stage. We have a detailed system architecture, safety model, and R&D plan — and we're seeking pre-seed investment to fund the first phase of bench-scale experimentation and validation.",
    },
    {
      q: "How do you prevent harmful exposure?",
      a: "Safety is built into the architecture: beam confinement via metamaterials, real-time occupancy sensing, hardware interlocks, and a default-OFF design. The system is engineered to meet or exceed all applicable exposure standards.",
    },
    {
      q: "What's the timeline to a real-world pilot?",
      a: "Our roadmap targets an integrated prototype demonstration in 24–36 months, with pilot environment deployment contingent on Phase 2 validation results and funding milestones.",
    },
    {
      q: "How much funding are you seeking?",
      a: "We're raising a pre-seed round of $250K–$500K to fund Phase 1: concept validation, metamaterial simulation, bench-scale experiments, and safety modeling. Each subsequent phase has defined funding gates tied to measurable milestones.",
    },
  ];
  return (
    <Section id="faq">
      <FadeIn>
        <SectionLabel text="FAQ" />
        <SectionTitle>Common questions</SectionTitle>
      </FadeIn>
      <div style={{ marginTop: 32, maxWidth: 720 }}>
        {faqs.map((f, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div style={{
              borderBottom: `1px solid ${COLORS.border}`,
              padding: "20px 0",
            }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                aria-controls={`faq-answer-${i}`}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  width: "100%", textAlign: "left", padding: 0, color: "inherit",
                }}
              >
                <span id={`faq-q-${i}`} style={{
                  fontFamily: FONTS.display, fontSize: 16, fontWeight: 600,
                  color: COLORS.white,
                }}>{f.q}</span>
                <span aria-hidden="true" style={{
                  fontFamily: FONTS.mono, fontSize: 18, color: COLORS.accent,
                  transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                  transition: "transform 0.25s ease",
                  flexShrink: 0, marginLeft: 16,
                }}>+</span>
              </button>
              <div
                id={`faq-answer-${i}`}
                role="region"
                aria-labelledby={`faq-q-${i}`}
                style={{
                  maxHeight: open === i ? 300 : 0,
                  overflow: "hidden", transition: "max-height 0.35s ease",
                }}
              >
                <p style={{
                  fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted,
                  lineHeight: 1.7, margin: "12px 0 0", paddingRight: 40,
                }}>{f.a}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

// --- Contact / Get Involved ---

function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", type: "investor", message: "" });
  const [errors, setErrors] = useState({});
  const [fieldFocus, setFieldFocus] = useState(null);
  const successRef = useRef(null);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function handleSubmit() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!EMAIL_RE.test(form.email)) e.email = "Enter a valid email";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSubmitted(true);
  }

  useEffect(() => {
    if (submitted && successRef.current) successRef.current.focus();
  }, [submitted]);

  const canSubmit = form.name.trim() && form.email.trim();

  const inputStyle = (field) => ({
    fontFamily: FONTS.body, fontSize: 14, padding: "12px 16px",
    background: COLORS.surface,
    border: `1px solid ${errors[field] ? COLORS.danger : fieldFocus === field ? COLORS.accent : COLORS.border}`,
    borderRadius: 6, color: COLORS.text, width: "100%",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxShadow: fieldFocus === field ? `0 0 0 2px ${COLORS.accentDim}` : "none",
  });

  const errorStyle = {
    fontFamily: FONTS.mono, fontSize: 11, color: COLORS.danger,
    marginTop: 4, letterSpacing: "0.02em",
  };

  return (
    <Section id="contact" style={{ paddingBottom: 60 }}>
      <FadeIn>
        <SectionLabel text="Get Involved" />
        <SectionTitle>Invest in the grid of the future</SectionTitle>
      </FadeIn>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48, marginTop: 40,
      }}>
        <FadeIn delay={0.1}>
          <div>
            <p style={{
              fontFamily: FONTS.body, fontSize: 16, color: COLORS.textMuted,
              lineHeight: 1.7, marginBottom: 32,
            }}>
              Whether you're an investor, researcher, strategic partner, or journalist —
              we'd like to hear from you.
            </p>
            {[
              { label: "Investors & Strategic Partners", desc: "Request a call or download the investor brief." },
              { label: "Researchers & Advisors", desc: "Join our advisory network or propose a collaboration." },
              { label: "Press & Media", desc: "Access the press kit and subscribe to updates." },
            ].map((c, i) => (
              <div key={i} style={{
                padding: "16px 0",
                borderBottom: i < 2 ? `1px solid ${COLORS.border}` : "none",
              }}>
                <div style={{
                  fontFamily: FONTS.display, fontSize: 15, fontWeight: 600,
                  color: COLORS.white, marginBottom: 4,
                }}>{c.label}</div>
                <div style={{
                  fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted,
                  lineHeight: 1.6,
                }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          {submitted ? (
            <div ref={successRef} tabIndex={-1} style={{
              background: COLORS.surface, borderRadius: 8,
              border: `1px solid ${COLORS.accent}44`,
              padding: 40, textAlign: "center",
            }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>✓</div>
              <div style={{
                fontFamily: FONTS.display, fontSize: 18, fontWeight: 700,
                color: COLORS.white, marginBottom: 8,
              }}>Thank you</div>
              <div style={{
                fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted,
              }}>We'll be in touch within 48 hours.</div>
            </div>
          ) : (
            <div style={{
              background: COLORS.surface, borderRadius: 8,
              border: `1px solid ${COLORS.border}`, padding: 32,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label htmlFor="contact-name" style={{
                    fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textDim,
                    letterSpacing: "0.1em", display: "block", marginBottom: 6,
                  }}>NAME *</label>
                  <input
                    id="contact-name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={e => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: undefined }); }}
                    onFocus={() => setFieldFocus("name")}
                    onBlur={() => setFieldFocus(null)}
                    style={inputStyle("name")}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "err-name" : undefined}
                  />
                  {errors.name && <div id="err-name" style={errorStyle}>{errors.name}</div>}
                </div>
                <div>
                  <label htmlFor="contact-email" style={{
                    fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textDim,
                    letterSpacing: "0.1em", display: "block", marginBottom: 6,
                  }}>EMAIL *</label>
                  <input
                    id="contact-email"
                    placeholder="Email address"
                    type="email"
                    value={form.email}
                    onChange={e => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                    onFocus={() => setFieldFocus("email")}
                    onBlur={() => setFieldFocus(null)}
                    style={inputStyle("email")}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "err-email" : undefined}
                  />
                  {errors.email && <div id="err-email" style={errorStyle}>{errors.email}</div>}
                </div>
                <div>
                  <label htmlFor="contact-type" style={{
                    fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textDim,
                    letterSpacing: "0.1em", display: "block", marginBottom: 6,
                  }}>I AM A</label>
                  <select
                    id="contact-type"
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    onFocus={() => setFieldFocus("type")}
                    onBlur={() => setFieldFocus(null)}
                    style={{ ...inputStyle("type"), cursor: "pointer" }}
                  >
                    <option value="investor">Investor / Strategic Partner</option>
                    <option value="researcher">Researcher / Advisor</option>
                    <option value="press">Press / Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" style={{
                    fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textDim,
                    letterSpacing: "0.1em", display: "block", marginBottom: 6,
                  }}>MESSAGE</label>
                  <textarea
                    id="contact-message"
                    placeholder="Tell us briefly what you're interested in..."
                    rows={4}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    onFocus={() => setFieldFocus("message")}
                    onBlur={() => setFieldFocus(null)}
                    style={{ ...inputStyle("message"), resize: "vertical" }}
                  />
                </div>
                <Btn primary onClick={handleSubmit} disabled={!canSubmit} style={{ width: "100%", textAlign: "center" }}>
                  Send Request
                </Btn>
                <div style={{
                  fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textDim,
                  textAlign: "center", marginTop: -8,
                }}>We respond within 48 hours.</div>
              </div>
            </div>
          )}
        </FadeIn>
      </div>
    </Section>
  );
}

// --- Footer ---

function Footer() {
  return (
    <footer style={{
      position: "relative", zIndex: 1,
      borderTop: `1px solid ${COLORS.border}`,
      padding: "40px 24px",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16,
      }}>
        <div style={{
          fontFamily: FONTS.display, fontWeight: 800, fontSize: 14,
          color: COLORS.textDim, letterSpacing: "-0.02em",
        }}>
          METAGRID
        </div>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 11, color: COLORS.textDim,
          display: "flex", gap: 16, flexWrap: "wrap",
        }}>
          <span>© {new Date().getFullYear()} Metagrid. All rights reserved.</span>
          <span style={{ color: COLORS.textDim }}>·</span>
          <span>Patent Pending</span>
        </div>
      </div>
    </footer>
  );
}

// --- Main App ---

export default function MetagridSite() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    // Load fonts
    const linkId = "metagrid-google-fonts";
    let ownedLink = false;
    let link = document.getElementById(linkId);
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
      ownedLink = true;
    }

    // Global focus-visible styles
    const styleId = "metagrid-focus-styles";
    let ownedStyle = false;
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        *:focus-visible {
          outline: 2px solid ${COLORS.accent} !important;
          outline-offset: 2px;
        }
        nav > div > div::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
        }
      `;
      document.head.appendChild(style);
      ownedStyle = true;
    }

    return () => {
      if (ownedLink && link?.parentNode) link.parentNode.removeChild(link);
      const style = document.getElementById(styleId);
      if (ownedStyle && style?.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const sections = ["whynow", "what", "tech", "roadmap", "safety", "team", "faq", "contact"];
    let ticking = false;
    let frameId = null;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      frameId = requestAnimationFrame(() => {
        let nextSection = "";
        for (const id of [...sections].reverse()) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top < 200) {
            nextSection = id;
            break;
          }
        }
        setActiveSection(current => (current === nextSection ? current : nextSection));
        ticking = false;
        frameId = null;
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div style={{
      background: COLORS.bg, color: COLORS.text, minHeight: "100vh",
      overflowX: "hidden",
    }}>
      <a href="#main-content" style={{
        position: "fixed", top: -100, left: 16, zIndex: 999,
        background: COLORS.accent, color: COLORS.bg, padding: "8px 16px",
        borderRadius: 6, fontFamily: FONTS.body, fontWeight: 700, fontSize: 13,
        textDecoration: "none", transition: "top 0.2s",
      }} onFocus={e => { e.target.style.top = "16px"; }} onBlur={e => { e.target.style.top = "-100px"; }}>
        Skip to content
      </a>
      <GridBackground />
      <Nav activeSection={activeSection} />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <div style={{
          height: 1, background: `linear-gradient(to right, transparent, ${COLORS.border}, transparent)`,
          maxWidth: 1100, margin: "0 auto",
        }} />
        <WhyNowSection />
        <WhatSection />
        <TechSection />
        <RoadmapSection />
        <SafetySection />
        <TeamSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

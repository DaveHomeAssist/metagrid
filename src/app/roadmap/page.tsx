import { Metadata } from "next";
import { Section, SectionLabel, SectionTitle, SectionBody } from "@/components/Section";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = { title: "Roadmap" };

const phases = [
  {
    phase: "Phase 1", title: "Concept Validation & Feasibility",
    trl: "TRL 1–3", timeline: "Months 1–12", funding: "$250K–$500K",
    items: [
      "Patent application filed (pending)",
      "Metamaterial element design and simulation",
      "Bench-scale power transfer experiments",
      "Safety envelope modeling and sensor prototyping",
      "Control loop architecture definition",
    ],
  },
  {
    phase: "Phase 2", title: "Subsystem Validation",
    trl: "TRL 3–4", timeline: "Months 12–24", funding: "$1M–$2M",
    items: [
      "Multi-element array fabrication and testing",
      "Closed-loop beamforming demonstration",
      "Single-tier relay proof of concept",
      "Safety interlock validation under fault conditions",
    ],
  },
  {
    phase: "Phase 3", title: "Integrated Prototype",
    trl: "TRL 4–5", timeline: "Months 24–36", funding: "$3M–$5M",
    items: [
      "Multi-tier relay network demonstration",
      "Real-world pilot environment deployment",
      "Compliance and certification pathway initiation",
      "Partner integration and commercial pilot design",
    ],
  },
];

export default function RoadmapPage() {
  return (
    <Section>
      <FadeIn>
        <SectionLabel text="Roadmap" />
        <SectionTitle>Milestones &amp; Funding Gates</SectionTitle>
        <SectionBody>
          Each phase has measurable exit criteria. Funding unlocks the next stage
          of validated R&amp;D — no milestone, no next phase.
        </SectionBody>
      </FadeIn>
      <div className="relative">
        <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00d4aa] to-[#1f2533]" />
        {phases.map((p, i) => (
          <FadeIn key={p.phase} delay={i * 0.15}>
            <div className="flex gap-8 mb-10 relative">
              <div className="w-[38px] h-[38px] rounded-full bg-[#0a0c10] border-2 border-[#00d4aa] flex items-center justify-center font-[var(--font-mono)] text-xs text-[#00d4aa] shrink-0 z-10">
                {i + 1}
              </div>
              <div className="bg-[#12151c] border border-[#1f2533] rounded-lg p-7 flex-1">
                <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                  <div>
                    <span className="font-[var(--font-mono)] text-[11px] text-[#00d4aa] tracking-[0.1em]">
                      {p.phase}
                    </span>
                    <h3 className="font-[var(--font-display)] text-lg font-bold text-white mt-1">
                      {p.title}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-[var(--font-mono)] text-[11px] px-2.5 py-1 rounded bg-[#00d4aa22] text-[#00d4aa]">
                      {p.trl}
                    </span>
                    <span className="font-[var(--font-mono)] text-[11px] px-2.5 py-1 rounded bg-[#5a647822] text-[#8892a4]">
                      {p.timeline}
                    </span>
                  </div>
                </div>
                <div className="my-4">
                  {p.items.map((item) => (
                    <div key={item} className="font-[var(--font-body)] text-[13px] text-[#e8eaf0] leading-relaxed mb-1.5 pl-3.5 border-l-2 border-[#1f2533]">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="font-[var(--font-mono)] text-xs text-[#00d4aa] mt-4 pt-4 border-t border-[#1f2533]">
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

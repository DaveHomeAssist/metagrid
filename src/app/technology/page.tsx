import { Metadata } from "next";
import { Section, SectionLabel, SectionTitle, SectionBody } from "@/components/Section";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = { title: "Technology" };

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

export default function TechnologyPage() {
  return (
    <Section>
      <FadeIn>
        <SectionLabel text="Technology" />
        <SectionTitle>How it works</SectionTitle>
        <SectionBody>
          Three interlocking technology pillars form the Metagrid architecture.
          Each has clear build targets and validation gates.
        </SectionBody>
      </FadeIn>
      <div className="flex flex-col gap-0.5">
        {pillars.map((p, i) => (
          <FadeIn key={p.title} delay={i * 0.12}>
            <div className="bg-[#12151c] rounded-lg border border-[#1f2533] p-9">
              <div className="flex gap-3 items-center mb-3">
                <span className="font-[var(--font-mono)] text-[11px] text-[#00d4aa] bg-[#00d4aa22] px-2 py-0.5 rounded">
                  0{i + 1}
                </span>
                <h3 className="font-[var(--font-display)] text-xl font-bold text-white">
                  {p.title}
                </h3>
              </div>
              <p className="font-[var(--font-body)] text-sm text-[#8892a4] leading-relaxed mb-6 max-w-[600px]">
                {p.desc}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="font-[var(--font-mono)] text-[10px] text-[#00d4aa] tracking-[0.12em] mb-3">
                    WHAT WE&apos;RE BUILDING
                  </div>
                  {p.building.map((b) => (
                    <div key={b} className="font-[var(--font-body)] text-[13px] text-[#e8eaf0] leading-relaxed mb-2 pl-3.5 border-l-2 border-[#00d4aa44]">
                      {b}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="font-[var(--font-mono)] text-[10px] text-[#f59e0b] tracking-[0.12em] mb-3">
                    WHAT MUST BE PROVEN
                  </div>
                  {p.proving.map((v) => (
                    <div key={v} className="font-[var(--font-body)] text-[13px] text-[#e8eaf0] leading-relaxed mb-2 pl-3.5 border-l-2 border-[#f59e0b44]">
                      {v}
                    </div>
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

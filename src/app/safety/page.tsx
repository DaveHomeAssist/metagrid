import { Metadata } from "next";
import { Section, SectionLabel, SectionTitle, SectionBody } from "@/components/Section";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Safety",
  description:
    "Metagrid's safety model is built into every layer — beam confinement, real-time sensing, hardware interlocks, and a default-OFF fail-safe architecture designed to meet FCC, IEEE, and ICNIRP standards.",
  openGraph: {
    title: "Safety | Metagrid",
    description:
      "Metagrid's safety model is built into every layer — beam confinement, real-time sensing, hardware interlocks, and a default-OFF fail-safe architecture designed to meet FCC, IEEE, and ICNIRP standards.",
    url: "https://metagrid.energy/safety",
  },
  twitter: {
    title: "Safety | Metagrid",
    description:
      "Metagrid's safety model is built into every layer — beam confinement, real-time sensing, hardware interlocks, and a default-OFF fail-safe architecture designed to meet FCC, IEEE, and ICNIRP standards.",
  },
};

const pillars = [
  { title: "Beam Confinement", icon: "◎", desc: "Metamaterial-guided beams operate within defined safety corridors. Power is delivered directionally, not broadcast." },
  { title: "Real-Time Sensing", icon: "◉", desc: "Continuous monitoring of field strength, occupancy, and environmental conditions feeds back into beam control." },
  { title: "Interlock Systems", icon: "⊘", desc: "Hardware-level fail-safes shut down transmission instantly if any safety parameter is violated." },
  { title: "Exposure Compliance", icon: "◇", desc: "Designed to meet or exceed FCC, IEEE, and ICNIRP exposure limits at every operating point." },
];

export default function SafetyPage() {
  return (
    <Section>
      <FadeIn>
        <SectionLabel text="Safety & Compliance" />
        <SectionTitle>Safety is architecture, not an afterthought</SectionTitle>
        <SectionBody>
          Metagrid&apos;s safety model is built into every layer of the system — from
          beam confinement physics to real-time sensing to fail-safe design.
        </SectionBody>
      </FadeIn>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
        {pillars.map((s, i) => (
          <FadeIn key={s.title} delay={i * 0.1}>
            <div className="bg-[#12151c] rounded-lg border border-[#1f2533] p-8 h-full">
              <div className="text-2xl mb-4 text-[#00d4aa]">{s.icon}</div>
              <h3 className="font-[var(--font-display)] text-base font-bold text-white mb-2.5">
                {s.title}
              </h3>
              <p className="font-[var(--font-body)] text-[13px] text-[#8892a4] leading-relaxed">
                {s.desc}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
      <FadeIn delay={0.4}>
        <div className="mt-10 p-5 rounded-lg border border-[#00d4aa33] bg-[#00d4aa22] font-[var(--font-body)] text-sm text-[#e8eaf0] leading-relaxed">
          <strong className="text-[#00d4aa]">Fail-safe philosophy:</strong>{" "}
          The system defaults to OFF. Power is transmitted only when all safety
          conditions are confirmed. Any fault, obstruction, or anomaly triggers
          immediate shutdown — no operator intervention required.
        </div>
      </FadeIn>
    </Section>
  );
}

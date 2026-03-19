import { Metadata } from "next";
import { Section, SectionLabel, SectionTitle } from "@/components/Section";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Team",
  description:
    "Meet the team behind Metagrid and the technical roles we're actively building toward — from RF engineering to metamaterials research and safety compliance.",
  openGraph: {
    title: "Team | Metagrid",
    description:
      "Meet the team behind Metagrid and the technical roles we're actively building toward — from RF engineering to metamaterials research and safety compliance.",
    url: "https://metagrid.energy/team",
  },
  twitter: {
    title: "Team | Metagrid",
    description:
      "Meet the team behind Metagrid and the technical roles we're actively building toward — from RF engineering to metamaterials research and safety compliance.",
  },
};

const seeking = [
  "RF / Microwave Engineer",
  "Metamaterials Researcher",
  "Power Electronics Specialist",
  "Safety & Compliance Advisor",
  "Technical Advisory Board Members",
];

export default function TeamPage() {
  return (
    <Section>
      <FadeIn>
        <SectionLabel text="Team" />
        <SectionTitle>Who&apos;s building this</SectionTitle>
      </FadeIn>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 mt-10">
        <FadeIn delay={0.1}>
          <div className="bg-[#12151c] rounded-lg border border-[#1f2533] p-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00d4aa44] to-[#00d4aa11] flex items-center justify-center font-[var(--font-display)] font-extrabold text-lg text-[#00d4aa] mb-4">
              CW
            </div>
            <h3 className="font-[var(--font-display)] text-base font-bold text-white mb-1">
              Connor [Founder]
            </h3>
            <div className="font-[var(--font-mono)] text-[11px] text-[#5a6478] mb-3">
              Lead Researcher &amp; System Architect
            </div>
            <p className="font-[var(--font-body)] text-[13px] text-[#8892a4] leading-relaxed">
              Driving the R&amp;D program from concept through experimentation.
              Responsible for system architecture, safety modeling, and research
              partnerships.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="bg-[#12151c] rounded-lg border border-dashed border-[#2a3040] p-8 flex flex-col justify-center min-h-[200px]">
            <div className="font-[var(--font-mono)] text-[11px] text-[#00d4aa] tracking-[0.1em] mb-3">
              WE&apos;RE SEEKING
            </div>
            {seeking.map((r) => (
              <div key={r} className="font-[var(--font-body)] text-[13px] text-[#e8eaf0] leading-relaxed mb-1 pl-3.5 border-l-2 border-[#00d4aa44]">
                {r}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

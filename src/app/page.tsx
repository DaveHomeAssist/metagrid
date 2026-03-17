import { Section, SectionLabel, SectionTitle, SectionBody } from "@/components/Section";
import FadeIn from "@/components/FadeIn";
import StatCard from "@/components/StatCard";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <Section className="pt-40 pb-20">
        <FadeIn>
          <div className="font-[var(--font-mono)] text-xs text-[#5a6478] tracking-[0.12em] mb-6 flex items-center gap-4">
            WIRELESS POWER INFRASTRUCTURE
            <span className="text-[10px] tracking-wider px-2.5 py-1 rounded border border-[#00d4aa66] text-[#00d4aa] bg-[#00d4aa22]">
              PATENT PENDING
            </span>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="font-[var(--font-display)] font-extrabold text-[clamp(36px,6vw,68px)] leading-[1.05] text-white mb-7 tracking-tight max-w-[800px]">
            Power delivery,{" "}
            <span className="text-[#00d4aa]">without the wire.</span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="font-[var(--font-body)] text-lg leading-relaxed text-[#8892a4] max-w-[560px] mb-10">
            Metagrid is engineering a hierarchical, safety-first wireless power
            network using metamaterials and adaptive control — delivering
            utility-scale energy to remote AI data centers and critical
            infrastructure without traditional last-mile wiring.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="flex gap-3.5 flex-wrap">
            <Link
              href="/contact"
              className="px-7 py-3 text-sm font-semibold bg-[#00d4aa] text-[#0a0c10] rounded-md hover:brightness-110 transition-all"
            >
              Request an Intro
            </Link>
            <Link
              href="/technology"
              className="px-7 py-3 text-sm font-semibold border border-[#2a3040] text-[#e8eaf0] rounded-md hover:border-[#8892a4] transition-colors"
            >
              Learn More →
            </Link>
          </div>
        </FadeIn>
        <FadeIn delay={0.45}>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-px mt-20 bg-[#1f2533] rounded-lg overflow-hidden">
            {[
              { label: "Focus", value: "Metamaterial WPT" },
              { label: "Application", value: "Remote AI Infrastructure" },
              { label: "Stage", value: "Concept / Patent Pending" },
              { label: "Seeking", value: "Pre-Seed Investment" },
            ].map((s) => (
              <div key={s.label} className="bg-[#12151c] py-5 px-6">
                <div className="font-[var(--font-mono)] text-[10px] text-[#5a6478] tracking-[0.12em] mb-1.5">
                  {s.label.toUpperCase()}
                </div>
                <div className="font-[var(--font-body)] text-sm text-[#e8eaf0] font-semibold">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </Section>

      <div className="h-px bg-gradient-to-r from-transparent via-[#1f2533] to-transparent max-w-[1100px] mx-auto" />

      {/* Why Now */}
      <Section id="whynow" className="pt-20 pb-16">
        <FadeIn>
          <SectionLabel text="Why Now" />
          <SectionTitle>The grid wasn&apos;t built for this</SectionTitle>
          <SectionBody>
            AI is driving explosive demand for compute — and that compute needs
            power. Data centers are increasingly sited in remote locations to
            access cheap land and resources, but the grid can&apos;t follow fast
            enough.
          </SectionBody>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 mt-4">
          {[
            { stat: "35%", label: "Annual growth in AI data center energy demand", source: "IEA, 2025" },
            { stat: "4–7 yrs", label: "Typical timeline to build new transmission infrastructure", source: "DOE estimates" },
            { stat: "$B+", label: "Capital stranded waiting for grid interconnection queues", source: "LBNL, 2024" },
          ].map((s, i) => (
            <FadeIn key={s.stat} delay={i * 0.1}>
              <StatCard {...s} />
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.35}>
          <div className="mt-8 p-5 rounded-lg border border-[#1f2533] bg-[#181c26] font-[var(--font-body)] text-sm text-[#8892a4] leading-relaxed">
            <strong className="text-white">The opportunity:</strong> Remote AI
            facilities need power now, but traditional grid extension takes years
            and costs hundreds of millions per project. Wireless power transfer
            could bypass the last-mile bottleneck entirely — delivering energy
            where wires can&apos;t reach, on timelines the market demands.
          </div>
        </FadeIn>
      </Section>

      {/* What */}
      <Section id="what">
        <FadeIn>
          <SectionLabel text="60-Second Explainer" />
          <SectionTitle>What is Metagrid?</SectionTitle>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
          <FadeIn delay={0.1}>
            <p className="font-[var(--font-body)] text-base leading-[1.8] text-[#8892a4]">
              Metagrid is a next-generation energy distribution concept: a
              hierarchical wireless power network that uses engineered
              metamaterials and adaptive beamforming to deliver electricity
              without physical conductors in the last-mile. The core technology
              is patent pending.
            </p>
            <p className="font-[var(--font-body)] text-base leading-[1.8] text-[#8892a4] mt-4">
              The primary application: powering remote AI data centers that are
              increasingly sited far from existing grid infrastructure. Think of
              it as a cellular network — but for energy, routing power through
              tiers of relay nodes with real-time safety management.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="bg-[#12151c] border border-[#1f2533] rounded-lg p-8">
              <div className="font-[var(--font-mono)] text-[11px] text-[#00d4aa] tracking-[0.1em] mb-5">
                PROBLEMS SOLVED
              </div>
              {[
                "Remote AI data centers stranded by grid interconnection delays",
                "Explosive compute demand outpacing transmission buildout",
                "Last-mile deployment friction in dense or remote terrain",
                "Stranded renewable capacity with no viable transmission path",
              ].map((p) => (
                <div key={p} className="flex gap-3 items-start mb-3.5">
                  <span className="w-1.5 h-1.5 rounded-sm bg-[#00d4aa] mt-[7px] shrink-0" />
                  <span className="font-[var(--font-body)] text-sm text-[#e8eaf0] leading-relaxed">
                    {p}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </Section>
    </>
  );
}

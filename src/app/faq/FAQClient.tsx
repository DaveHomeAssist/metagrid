"use client";

import { useState } from "react";
import { Section, SectionLabel, SectionTitle } from "@/components/Section";
import FadeIn from "@/components/FadeIn";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: ReadonlyArray<FAQItem> = [
  {
    question: "Is this just wireless charging?",
    answer:
      "No. Wireless charging (like Qi) works at millimeters to centimeters. Metagrid is designing power transfer at room, building, and eventually campus scale — using fundamentally different physics and system architecture.",
  },
  {
    question: "Why AI data centers specifically?",
    answer:
      "AI companies are increasingly building data centers in remote locations to access cheap land and resources. But extending the grid to these sites takes 4–7 years and costs hundreds of millions. Wireless power transfer could bridge that gap on a fraction of the timeline.",
  },
  {
    question: "What's the status of the patent?",
    answer:
      "Our core technology is patent pending. We've filed for protection on the key innovations in metamaterial-based wireless power distribution and adaptive safety control architecture.",
  },
  {
    question: "What stage is the technology at?",
    answer:
      "Metagrid is at concept stage. We have a detailed system architecture, safety model, and R&D plan — and we're seeking pre-seed investment to fund the first phase of bench-scale experimentation and validation.",
  },
  {
    question: "How do you prevent harmful exposure?",
    answer:
      "Safety is built into the architecture: beam confinement via metamaterials, real-time occupancy sensing, hardware interlocks, and a default-OFF design. The system is engineered to meet or exceed all applicable exposure standards.",
  },
  {
    question: "What's the timeline to a real-world pilot?",
    answer:
      "Our roadmap targets an integrated prototype demonstration in 24–36 months, with pilot environment deployment contingent on Phase 2 validation results and funding milestones.",
  },
  {
    question: "How much funding are you seeking?",
    answer:
      "We're raising a pre-seed round of $250K–$500K to fund Phase 1: concept validation, metamaterial simulation, bench-scale experiments, and safety modeling. Each subsequent phase has defined funding gates tied to measurable milestones.",
  },
];

export default function FAQClient() {
  const [open, setOpen] = useState<number | null>(null);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
      <Section>
        <FadeIn>
          <SectionLabel text="FAQ" />
          <SectionTitle>Common questions</SectionTitle>
        </FadeIn>
        <div role="region" aria-label="Frequently asked questions" className="mt-8 max-w-[720px]">
          {FAQ_ITEMS.map((item, i) => (
            <FadeIn key={item.question} delay={i * 0.08}>
              <div className="border-b border-[#1f2533] py-5">
                <button
                  type="button"
                  onClick={() => setOpen((current) => (current === i ? null : i))}
                  className="bg-transparent border-none cursor-pointer flex justify-between items-center w-full text-left p-0"
                  aria-expanded={open === i}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-header-${i}`}
                >
                  <span className="font-[var(--font-display)] text-base font-semibold text-white">
                    {item.question}
                  </span>
                  <span
                    className="font-[var(--font-mono)] text-lg text-[#00d4aa] shrink-0 ml-4 transition-transform duration-200"
                    style={{ transform: open === i ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    +
                  </span>
                </button>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-header-${i}`}
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="font-[var(--font-body)] text-sm text-[#8892a4] leading-relaxed mt-3 pr-10">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>
    </>
  );
}

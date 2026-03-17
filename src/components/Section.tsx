import { ReactNode } from "react";

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative z-10 py-24 px-6 max-w-[1100px] mx-auto ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionLabel({ text }: { text: string }) {
  return (
    <div className="font-[var(--font-mono)] text-[11px] tracking-[0.18em] uppercase text-[#00d4aa] mb-3 flex items-center gap-2.5">
      <span className="w-5 h-px bg-[#00d4aa] inline-block" />
      {text}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-[var(--font-display)] text-[clamp(28px,4vw,42px)] font-bold text-white mb-5 leading-[1.15] tracking-tight">
      {children}
    </h2>
  );
}

export function SectionBody({ children }: { children: ReactNode }) {
  return (
    <p className="font-[var(--font-body)] text-base text-[#8892a4] leading-relaxed max-w-[600px] mb-12">
      {children}
    </p>
  );
}

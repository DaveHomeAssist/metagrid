import type { CSSProperties, ReactNode } from "react";

export default function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={["metagrid-fade-in", className].filter(Boolean).join(" ")}
      style={{ "--metagrid-fade-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}

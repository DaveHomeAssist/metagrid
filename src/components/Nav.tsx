"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/technology", label: "Technology" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/safety", label: "Safety" },
  { href: "/team", label: "Team" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0c10]/90 backdrop-blur-lg border-b border-[#1f2533]">
      <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between h-[60px]">
        <Link
          href="/"
          className="font-[var(--font-display)] font-extrabold text-lg text-white no-underline tracking-tight flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-sm bg-[#00d4aa] inline-block" />
          METAGRID
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`font-[var(--font-mono)] text-[11px] tracking-wider uppercase px-3 py-1.5 rounded transition-colors ${
                pathname === l.href
                  ? "text-[#00d4aa]"
                  : "text-[#8892a4] hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="ml-2 px-4 py-2 text-xs font-semibold bg-[#00d4aa] text-[#0a0c10] rounded-md hover:brightness-110 transition-all"
          >
            Get Involved
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[#8892a4]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="md:hidden bg-[#12151c] border-t border-[#1f2533] px-6 py-4 flex flex-col gap-2"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`font-[var(--font-mono)] text-sm tracking-wider uppercase py-2 ${
                pathname === l.href ? "text-[#00d4aa]" : "text-[#8892a4]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

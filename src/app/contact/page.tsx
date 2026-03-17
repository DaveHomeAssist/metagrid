"use client";

import { useState } from "react";
import { Section, SectionLabel, SectionTitle } from "@/components/Section";
import FadeIn from "@/components/FadeIn";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", type: "investor", message: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    // TODO: Wire to Formspree or API route
    // await fetch("https://formspree.io/f/YOUR_ID", { method: "POST", body: JSON.stringify(form), headers: { "Content-Type": "application/json" } });
    setSubmitted(true);
  };

  const inputClass =
    "font-[var(--font-body)] text-sm p-3 bg-[#12151c] border border-[#1f2533] rounded-md text-[#e8eaf0] w-full outline-none focus:border-[#00d4aa] transition-colors";

  return (
    <Section>
      <FadeIn>
        <SectionLabel text="Get Involved" />
        <SectionTitle>Invest in the grid of the future</SectionTitle>
      </FadeIn>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10">
        <FadeIn delay={0.1}>
          <p className="font-[var(--font-body)] text-base text-[#8892a4] leading-relaxed mb-8">
            Whether you&apos;re an investor, researcher, strategic partner, or
            journalist — we&apos;d like to hear from you.
          </p>
          {[
            { label: "Investors & Strategic Partners", desc: "Request a call or download the investor brief." },
            { label: "Researchers & Advisors", desc: "Join our advisory network or propose a collaboration." },
            { label: "Press & Media", desc: "Access the press kit and subscribe to updates." },
          ].map((c, i) => (
            <div key={c.label} className={`py-4 ${i < 2 ? "border-b border-[#1f2533]" : ""}`}>
              <div className="font-[var(--font-display)] text-[15px] font-semibold text-white mb-1">
                {c.label}
              </div>
              <div className="font-[var(--font-body)] text-[13px] text-[#8892a4] leading-relaxed">
                {c.desc}
              </div>
            </div>
          ))}
        </FadeIn>
        <FadeIn delay={0.2}>
          {submitted ? (
            <div className="bg-[#12151c] rounded-lg border border-[#00d4aa44] p-10 text-center">
              <div className="text-3xl mb-4">✓</div>
              <div className="font-[var(--font-display)] text-lg font-bold text-white mb-2">
                Thank you
              </div>
              <div className="font-[var(--font-body)] text-sm text-[#8892a4]">
                We&apos;ll be in touch within 48 hours.
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-[#12151c] rounded-lg border border-[#1f2533] p-8 flex flex-col gap-4"
            >
              <input
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                required
              />
              <input
                placeholder="Email address"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                required
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="investor">Investor / Strategic Partner</option>
                <option value="researcher">Researcher / Advisor</option>
                <option value="press">Press / Media</option>
                <option value="other">Other</option>
              </select>
              <textarea
                placeholder="Tell us briefly what you're interested in..."
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`${inputClass} resize-y`}
              />
              {error && (
                <div className="text-[#ef4444] text-sm font-[var(--font-body)]">{error}</div>
              )}
              <button
                type="submit"
                className="w-full py-3 text-sm font-semibold bg-[#00d4aa] text-[#0a0c10] rounded-md hover:brightness-110 transition-all cursor-pointer"
              >
                Send Request
              </button>
            </form>
          )}
        </FadeIn>
      </div>
    </Section>
  );
}

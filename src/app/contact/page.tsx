"use client";

import { useState } from "react";
import { Section, SectionLabel, SectionTitle } from "@/components/Section";
import FadeIn from "@/components/FadeIn";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", type: "investor", message: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { name?: string; email?: string } = {};

    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    }
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitStatus("idle");
      return;
    }

    setSubmitStatus("submitting");

    const formData = { ...form };

    try {
      const response = await fetch(
        `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID || "YOUR_FORM_ID"}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setSubmitStatus("success");
        setForm({ name: "", email: "", type: "investor", message: "" });
        setErrors({});
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    }
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
          <form
            onSubmit={handleSubmit}
            className="bg-[#12151c] rounded-lg border border-[#1f2533] p-8 flex flex-col gap-4"
          >
            <div>
              <label htmlFor="contact-name" className="sr-only">Your name</label>
              <input
                id="contact-name"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                required
                aria-required="true"
                aria-describedby={errors.name ? "name-error" : undefined}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <span id="name-error" role="alert" className="text-red-400 text-sm mt-1">
                  {errors.name}
                </span>
              )}
            </div>
            <div>
              <label htmlFor="contact-email" className="sr-only">Email address</label>
              <input
                id="contact-email"
                placeholder="Email address"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                required
                aria-required="true"
                aria-describedby={errors.email ? "email-error" : undefined}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <span id="email-error" role="alert" className="text-red-400 text-sm mt-1">
                  {errors.email}
                </span>
              )}
            </div>
            <div>
              <label htmlFor="contact-type" className="sr-only">Inquiry type</label>
              <select
                id="contact-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="investor">Investor / Strategic Partner</option>
                <option value="researcher">Researcher / Advisor</option>
                <option value="press">Press / Media</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="contact-message" className="sr-only">Message</label>
              <textarea
                id="contact-message"
                placeholder="Tell us briefly what you're interested in..."
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`${inputClass} resize-y`}
              />
            </div>
            <button
              type="submit"
              disabled={submitStatus === "submitting"}
              className="w-full py-3 text-sm font-semibold bg-[#00d4aa] text-[#0a0c10] rounded-md hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitStatus === "submitting" ? "Sending..." : "Send Request"}
            </button>
            <div aria-live="polite" className="mt-4">
              {submitStatus === "success" && <p className="text-[#00d4aa]">Message sent. We&apos;ll be in touch.</p>}
              {submitStatus === "error" && <p className="text-red-400">Something went wrong. Please try again.</p>}
            </div>
          </form>
        </FadeIn>
      </div>
    </Section>
  );
}

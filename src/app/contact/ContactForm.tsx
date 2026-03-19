"use client";

import { type FormEvent, useState } from "react";
import { Section, SectionLabel, SectionTitle } from "@/components/Section";
import FadeIn from "@/components/FadeIn";

type ContactInquiryType = "investor" | "researcher" | "press" | "other";

interface ContactFormValues {
  name: string;
  email: string;
  type: ContactInquiryType;
  message: string;
}

interface ContactFormErrors {
  name?: string;
  email?: string;
}

type ContactSubmitStatus = "idle" | "submitting" | "success" | "error";

const INITIAL_CONTACT_FORM_VALUES: ContactFormValues = {
  name: "",
  email: "",
  type: "investor",
  message: "",
};

const CONTACT_INQUIRY_OPTIONS: ReadonlyArray<{
  value: ContactInquiryType;
  label: string;
}> = [
  { value: "investor", label: "Investor / Strategic Partner" },
  { value: "researcher", label: "Researcher / Advisor" },
  { value: "press", label: "Press / Media" },
  { value: "other", label: "Other" },
];

const CONTACT_INQUIRY_SUMMARIES: ReadonlyArray<{
  label: string;
  desc: string;
}> = [
  { label: "Investors & Strategic Partners", desc: "Request a call or download the investor brief." },
  { label: "Researchers & Advisors", desc: "Join our advisory network or propose a collaboration." },
  { label: "Press & Media", desc: "Access the press kit and subscribe to updates." },
];

const CONTACT_FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const nextErrors: ContactFormErrors = {};

  if (!values.name.trim()) {
    nextErrors.name = "Name is required.";
  }

  if (!values.email.trim()) {
    nextErrors.email = "Email is required.";
  } else if (!isValidEmail(values.email)) {
    nextErrors.email = "Please enter a valid email address.";
  }

  return nextErrors;
}

function getFormspreeEndpoint(formspreeId: string | undefined): string | null {
  return formspreeId ? `https://formspree.io/f/${formspreeId}` : null;
}

export default function ContactForm() {
  const [form, setForm] = useState<ContactFormValues>(INITIAL_CONTACT_FORM_VALUES);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<ContactSubmitStatus>("idle");

  const updateField = <K extends keyof ContactFormValues>(
    field: K,
    value: ContactFormValues[K]
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedForm: ContactFormValues = {
      name: form.name.trim(),
      email: form.email.trim(),
      type: form.type,
      message: form.message.trim(),
    };

    const nextErrors = validateContactForm(normalizedForm);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitStatus("idle");
      return;
    }

    setSubmitStatus("submitting");

    const formspreeEndpoint = getFormspreeEndpoint(CONTACT_FORMSPREE_ID);
    if (!formspreeEndpoint) {
      console.error("NEXT_PUBLIC_FORMSPREE_ID is not set");
      setSubmitStatus("error");
      return;
    }

    try {
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalizedForm),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setForm(INITIAL_CONTACT_FORM_VALUES);
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
          {CONTACT_INQUIRY_SUMMARIES.map((summary, i) => (
            <div key={summary.label} className={`py-4 ${i < 2 ? "border-b border-[#1f2533]" : ""}`}>
              <div className="font-[var(--font-display)] text-[15px] font-semibold text-white mb-1">
                {summary.label}
              </div>
              <div className="font-[var(--font-body)] text-[13px] text-[#8892a4] leading-relaxed">
                {summary.desc}
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
                onChange={(event) => updateField("name", event.target.value)}
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
                onChange={(event) => updateField("email", event.target.value)}
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
                onChange={(event) => updateField("type", event.target.value as ContactInquiryType)}
                className={`${inputClass} cursor-pointer`}
              >
                {CONTACT_INQUIRY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="contact-message" className="sr-only">Message</label>
              <textarea
                id="contact-message"
                placeholder="Tell us briefly what you're interested in..."
                rows={4}
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
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

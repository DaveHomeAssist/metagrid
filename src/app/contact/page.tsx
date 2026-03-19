import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Get Involved",
  description:
    "Connect with Metagrid as an investor, researcher, strategic partner, or press. Request an intro, propose a collaboration, or access the press kit.",
  openGraph: {
    title: "Get Involved | Metagrid",
    description:
      "Connect with Metagrid as an investor, researcher, strategic partner, or press. Request an intro, propose a collaboration, or access the press kit.",
    url: "https://metagrid.energy/contact",
  },
  twitter: {
    title: "Get Involved | Metagrid",
    description:
      "Connect with Metagrid as an investor, researcher, strategic partner, or press. Request an intro, propose a collaboration, or access the press kit.",
  },
};

export default function ContactPage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Metagrid",
    url: "https://metagrid.energy",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <ContactForm />
    </>
  );
}

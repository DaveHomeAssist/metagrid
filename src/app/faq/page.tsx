import type { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about Metagrid — how wireless power transfer works at scale, patent status, technology stage, safety approach, and pre-seed funding targets.",
  openGraph: {
    title: "FAQ | Metagrid",
    description:
      "Answers to common questions about Metagrid — how wireless power transfer works at scale, patent status, technology stage, safety approach, and pre-seed funding targets.",
    url: "https://metagrid.energy/faq",
  },
  twitter: {
    title: "FAQ | Metagrid",
    description:
      "Answers to common questions about Metagrid — how wireless power transfer works at scale, patent status, technology stage, safety approach, and pre-seed funding targets.",
  },
};

export default function FAQPage() {
  return <FAQClient />;
}

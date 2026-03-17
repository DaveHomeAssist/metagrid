import type { Metadata } from "next";
import { dmSans, ibmPlexSans, ibmPlexMono } from "@/lib/fonts";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GridBackground from "@/components/GridBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Metagrid — Wireless Power Infrastructure",
    template: "%s | Metagrid",
  },
  description:
    "Metagrid is engineering a hierarchical, safety-first wireless power network using metamaterials and adaptive control — delivering utility-scale energy to remote AI data centers without traditional last-mile wiring.",
  openGraph: {
    title: "Metagrid — Power delivery, without the wire.",
    description:
      "Metamaterial-based wireless power transfer for remote AI infrastructure. Patent pending.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="bg-[#0a0c10] text-[#e8eaf0] antialiased min-h-screen overflow-x-hidden">
        <GridBackground />
        <Nav />
        <main className="pt-[60px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

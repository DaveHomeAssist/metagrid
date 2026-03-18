import type { Metadata } from "next";
import { dmSans, ibmPlexSans, ibmPlexMono } from "@/lib/fonts";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GridBackground from "@/components/GridBackground";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://metagrid.energy"),
  title: {
    default: "Metagrid — Wireless Power Infrastructure",
    template: "%s | Metagrid",
  },
  icons: {
    icon: "/favicon.svg",
  },
  description:
    "Metagrid is engineering a hierarchical, safety-first wireless power network using metamaterials and adaptive control — delivering utility-scale energy to remote AI data centers without traditional last-mile wiring.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Metagrid — Wireless Power for AI Infrastructure",
    description:
      "Engineering wireless power delivery for remote AI data centers using metamaterials and adaptive control. Patent pending.",
    url: "https://metagrid.energy",
    siteName: "Metagrid",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Metagrid — Wireless Power for AI Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Metagrid — Wireless Power for AI Infrastructure",
    description:
      "Engineering wireless power delivery for remote AI data centers using metamaterials and adaptive control.",
    images: ["/og-image.svg"],
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#00d4aa] focus:text-[#0a0c10] focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <GridBackground />
        <Nav />
        <main id="main-content" className="pt-[60px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

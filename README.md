# Metagrid

**Wireless power infrastructure for remote AI data centers.**

Metagrid is engineering a hierarchical, safety-first wireless power network using metamaterials and adaptive control — delivering utility-scale energy without traditional last-mile wiring. Patent pending.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS 4
- **Fonts:** DM Sans, IBM Plex Sans, IBM Plex Mono (via next/font)
- **Deploy target:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    page.tsx            # Landing page (hero + why now + what)
    technology/         # Tech pillars
    roadmap/            # Milestones + funding gates
    safety/             # Safety architecture
    team/               # Team bios
    contact/            # Contact form
    faq/                # FAQ accordion
    layout.tsx          # Global layout (nav, footer, fonts, metadata)
    globals.css         # Design tokens + base styles
  components/
    Nav.tsx             # Responsive nav with mobile hamburger
    Footer.tsx          # Site footer
    Section.tsx         # Reusable section/label/title components
    FadeIn.tsx          # Intersection Observer fade-in animation
    StatCard.tsx        # Stat display card
    GridBackground.tsx  # Ambient grid pattern
  lib/
    tokens.ts           # Color + font design tokens
    fonts.ts            # next/font configuration
archive/
  metagrid-prototype.jsx  # Original single-file prototype
```

## Deploy

```bash
npm run build
npx vercel
```

## Contact Form

Currently client-side only. To wire to Formspree, add your form ID in `src/app/contact/page.tsx`.

## Team

- **Connor** — Founder, Lead Researcher & System Architect
- **Dave** — Engineering & Product

## Status

Pre-seed stage. Patent pending. Seeking investment for Phase 1 validation.

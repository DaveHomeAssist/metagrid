# Metagrid

**Wireless power infrastructure for remote AI data centers.**

Metagrid is engineering a hierarchical, safety-first wireless power network using metamaterials and adaptive control — delivering utility-scale energy without traditional last-mile wiring. Patent pending.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS 4
- **Fonts:** Local/system fallback stack (no external font fetch at runtime)
- **Deploy target:** Vercel

## Getting Started

```bash
nvm use
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Runtime

- **Node:** `22.22.1`
- Repo pinning is provided in `.nvmrc` and `package.json#engines`

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
    sitemap.ts          # Sitemap.xml route
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
    fonts.ts            # Local font variable shims
public/
  og-image.svg         # Social preview image
  robots.txt           # Crawl directives
archive/
  metagrid-prototype.jsx  # Original single-file prototype
```

## Deploy

```bash
npm run build
npx vercel
```

## Contact Form

The contact form posts to Formspree. Set `NEXT_PUBLIC_FORMSPREE_ID` before deploy.

```bash
export NEXT_PUBLIC_FORMSPREE_ID=your_form_id
```

Without that value, the form will submit to the placeholder endpoint.

## Accessibility / SEO

- Skip link and keyboard-friendly mobile nav are enabled globally
- FAQ accordion uses button/region ARIA wiring
- Contact form exposes inline error and status messaging
- `robots.txt`, sitemap, Open Graph, and Twitter metadata are included

## Team

- **Connor** — Founder, Lead Researcher & System Architect
- **Dave** — Engineering & Product

## Status

Pre-seed stage. Patent pending. Seeking investment for Phase 1 validation.

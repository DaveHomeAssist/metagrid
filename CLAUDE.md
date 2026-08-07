# CLAUDE.md

Inherits root rules from `/Users/daverobertson/Desktop/Code/AGENTS.md`.

## Project Overview

Metagrid is a public facing site for a wireless power infrastructure concept. It combines technical positioning, investor messaging, and contact capture in a polished web surface.

## Stack

- Next.js app
- React
- Static and server rendered marketing pages
- Vercel friendly deployment path

## Key Decisions

- Keep the site positioned as a high trust marketing and investor surface
- Treat accessibility and SEO as first class site requirements
- Preserve a strong editorial brand rather than a template style landing page

## Documentation Maintenance

- **Issues**: Track in the issue tracker table below
- **Session log**: Append to `/Users/daverobertson/Desktop/Code/95-docs-personal/today.csv` after each meaningful change

## Issue Tracker

| ID | Severity | Status | Title | Notes |
|----|----------|--------|-------|-------|
| 001 | P1 | blocked | Contact form cannot deliver: no Formspree ID in the deployed bundle | The form now renders an explicit unavailable state and CI emits a configuration warning. The remaining step is to create `NEXT_PUBLIC_FORMSPREE_ID` with the real form ID and redeploy. |
| 002 | P2 | resolved | FAQ accordion truncates answers longer than 300px | Already fixed by the `grid-template-rows: 0fr/1fr` accordion rebuild in `FAQClient.tsx` (no max-height anywhere in src). Verified live 2026-07-02. Tracker row was stale. |
| 003 | P2 | resolved | Subpages missing per-page OpenGraph and Twitter metadata | All six subpages (contact, faq, roadmap, safety, team, technology) export per-page `metadata` with `openGraph` + `twitter` blocks. Verified 2026-07-02; tracker row was stale. |
| 004 | P2 | resolved | No JSON-LD structured data for Organization or FAQPage | FAQPage JSON-LD was already live on /faq/ (rendered by `FAQClient.tsx`). Organization JSON-LD added to the root layout 2026-07-02. |
| 005 | P1 | resolved | Production dependency vulnerabilities | Upgraded to Next.js 16.3.0 and current React 19; production audit is zero and CI now blocks new high-severity production advisories. |
| 006 | P1 | resolved | Metadata points to non-resolving metagrid.energy | Canonicals, sitemap, robots, Open Graph, and JSON-LD now use the verified GitHub Pages deployment. |
| 007 | P1 | resolved | Residence electrical tools are publicly indexed | All four tool surfaces now declare `noindex,nofollow`; the tools remain absent from the sitemap. |
| 008 | P1 | resolved | Electrical suites cannot run in CI | `jsdom` is a pinned dev dependency and the full suite runs in the Pages workflow. |

## Session Log

[2026-03-18] [Metagrid] [docs] Add AGENTS baseline
[2026-06-21] [Metagrid] [build] Ship electrical suite: moved 3 HTML tools + wiring-shared.js to public/tools/ so they're in the static export; added /tools/ landing page. Live at /metagrid/tools/. Build + full test suite pass.
[2026-07-02] [Metagrid] [fix] Issue-tracker audit against live site: 002/003 were already fixed (marked resolved). Closed 004 by adding Organization JSON-LD to the root layout (FAQPage half was already live). Re-scoped 001: form no longer posts to a placeholder but the deployed bundle has no Formspree ID, so submits error — wired NEXT_PUBLIC_FORMSPREE_ID from repo secret into deploy-pages.yml; needs the secret created to close.
[2026-08-06] [Metagrid] [security] Upgrade Next/React production tree, add production audit and electrical-suite CI gates, restore GitHub Pages canonical authority, noindex residence tools, and make missing form configuration explicit.

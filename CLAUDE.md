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
| 001 | P2 | open | Contact form cannot deliver: no Formspree ID in the deployed bundle | Original "posts to YOUR_FORM_ID placeholder" behavior is gone — `getFormspreeEndpoint` returns null when `NEXT_PUBLIC_FORMSPREE_ID` is unset and the form shows its error state instead of silently 404ing. Verified live 2026-07-02: the deployed chunk contains no `formspree.io/f/` endpoint, so every submit errors. `deploy-pages.yml` now passes `NEXT_PUBLIC_FORMSPREE_ID` from the repo secret of the same name; **remaining step: Dave creates that secret with the real form ID** and re-deploys. |
| 002 | P2 | resolved | FAQ accordion truncates answers longer than 300px | Already fixed by the `grid-template-rows: 0fr/1fr` accordion rebuild in `FAQClient.tsx` (no max-height anywhere in src). Verified live 2026-07-02. Tracker row was stale. |
| 003 | P2 | resolved | Subpages missing per-page OpenGraph and Twitter metadata | All six subpages (contact, faq, roadmap, safety, team, technology) export per-page `metadata` with `openGraph` + `twitter` blocks. Verified 2026-07-02; tracker row was stale. |
| 004 | P2 | resolved | No JSON-LD structured data for Organization or FAQPage | FAQPage JSON-LD was already live on /faq/ (rendered by `FAQClient.tsx`). Organization JSON-LD added to the root layout 2026-07-02. |

## Session Log

[2026-03-18] [Metagrid] [docs] Add AGENTS baseline
[2026-06-21] [Metagrid] [build] Ship electrical suite: moved 3 HTML tools + wiring-shared.js to public/tools/ so they're in the static export; added /tools/ landing page. Live at /metagrid/tools/. Build + full test suite pass.
[2026-07-02] [Metagrid] [fix] Issue-tracker audit against live site: 002/003 were already fixed (marked resolved). Closed 004 by adding Organization JSON-LD to the root layout (FAQPage half was already live). Re-scoped 001: form no longer posts to a placeholder but the deployed bundle has no Formspree ID, so submits error — wired NEXT_PUBLIC_FORMSPREE_ID from repo secret into deploy-pages.yml; needs the secret created to close.

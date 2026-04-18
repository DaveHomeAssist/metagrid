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
| 001 | P2 | open | Contact form Formspree ID falls back to YOUR_FORM_ID placeholder | Submissions fail silently if env var not set |
| 002 | P2 | open | FAQ accordion truncates answers longer than 300px | Hardcoded max-height with no overflow scroll |
| 003 | P2 | open | Subpages missing per-page OpenGraph and Twitter metadata | Social shares show generic homepage description for all routes |
| 004 | P2 | open | No JSON-LD structured data for Organization or FAQPage | Missed rich snippet opportunities in search results |

## Session Log

[2026-03-18] [Metagrid] [docs] Add AGENTS baseline

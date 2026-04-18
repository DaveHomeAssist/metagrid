# Metagrid -- Feature Analysis

**Date:** 2026-03-25
**Scope:** All source files in metagrid/src (Next.js app: pages, components, lib, globals.css)

---

## Summary Table

| Feature | Status | Data Source / Persistence | Critical Gap |
|---|---|---|---|
| Homepage with hero, stats, explainer | Complete | Static content in page.tsx | None |
| Technology page (3-pillar breakdown) | Complete | Static data array in page.tsx | None |
| Roadmap page (3-phase timeline) | Complete | Static data array in page.tsx | None |
| Safety page (4-pillar grid) | Complete | Static data in page.tsx | None |
| Team page (founder + open roles) | Complete | Static data in page.tsx | None |
| FAQ page with accordion | Complete | Client component with JSON-LD | Accordion max-height may truncate long answers (issue #002) |
| Contact form (Formspree) | Complete | Formspree API via env var | Falls back to placeholder ID if env not set (issue #001) |
| Responsive navigation with mobile menu | Complete | Client component with focus trap | None |
| SEO metadata (per-page OG/Twitter) | Partial | Next.js Metadata API | Some subpages still share homepage description (issue #003) |
| JSON-LD structured data | Partial | FAQPage schema on /faq only | No Organization schema on homepage (issue #004) |
| Skip-to-content link | Complete | Layout.tsx | None |
| Keyboard accessibility | Complete | Focus-visible rings, Escape to close menu, tab trap | None |
| Animated grid background | Complete | GridBackground.tsx component | None |
| FadeIn scroll animations | Complete | FadeIn.tsx (IntersectionObserver) | None |
| Design tokens system | Complete | src/lib/tokens.ts + CSS variables | Tokens defined but partially used; many hardcoded values in pages |
| Custom font stack | Complete | src/lib/fonts.ts (DM Sans, IBM Plex Sans, IBM Plex Mono) | None |
| Sitemap generation | Complete | src/app/sitemap.ts | None |
| Light/dark theme | Not implemented | N/A | Site is dark-only; no light mode or system preference detection |
| Analytics | Not implemented | N/A | No tracking or analytics integration |
| CMS / Content management | Not implemented | All content hardcoded in TSX | Content changes require code deploys |

---

## Detailed Feature Analysis

### 1. Investor-Grade Marketing Surface

**Problem solved:** Present Metagrid's wireless power infrastructure concept to investors, researchers, and press with a polished, high-trust web presence that communicates both technical depth and business readiness.

**Implementation:** Next.js App Router with 7 pages: Home, Technology, Roadmap, Safety, Team, FAQ, Contact. Each page is a server component (except FAQ and Contact which use client components for interactivity). Content is structured using reusable `Section`, `SectionLabel`, `SectionTitle`, `SectionBody` components from `src/components/Section.tsx`. Visual consistency comes from a shared design token system and font stack.

**Files:** `src/app/page.tsx` (home), `src/app/technology/page.tsx`, `src/app/roadmap/page.tsx`, `src/app/safety/page.tsx`, `src/app/team/page.tsx`, `src/app/faq/page.tsx` + `FAQClient.tsx`, `src/app/contact/page.tsx` + `ContactForm.tsx`.

**Tradeoffs:** All content is hardcoded in TSX files. This is appropriate for a pre-seed company with infrequent content changes, but becomes a bottleneck if the team grows or update frequency increases. No CMS integration exists.

### 2. Contact Form with Formspree Integration

**Problem solved:** Capture inbound interest from investors, researchers, press, and partners without building a backend.

**Implementation:** Client component (`ContactForm.tsx`) with typed form state, client-side validation (name required, email format), inquiry type selector, and async submission to Formspree. The Formspree form ID is read from `NEXT_PUBLIC_FORMSPREE_ID` environment variable. Submission states (idle, submitting, success, error) are managed via React state with aria-live feedback.

**Tradeoffs:** The form has no anti-spam protection beyond Formspree's built-in measures. No rate limiting on the client side. The env var fallback path logs a console error but shows a generic "Something went wrong" to the user, which is unhelpful for debugging deployment issues.

**Limitations:** No duplicate submission protection (no debounce or disable-after-submit beyond the submitting state). Form reset happens on success but there is no confirmation email to the submitter.

### 3. FAQ Accordion with JSON-LD

**Problem solved:** Answer common investor and technical questions in a structured, scannable format that also improves search engine rich snippets.

**Implementation:** `FAQClient.tsx` renders 7 Q&A items with a single-open accordion pattern using `gridTemplateRows` animation. A `FAQPage` JSON-LD schema is injected via `dangerouslySetInnerHTML` for search engine consumption. Each accordion item has proper `aria-expanded` and `aria-controls` attributes.

**Tradeoffs:** The accordion uses CSS grid row animation which is smooth but the `overflow-hidden` wrapper may clip content if answers exceed the container. The JSON-LD is only present on the FAQ page; other structured data types (Organization, WebSite) are missing from the homepage.

### 4. Responsive Navigation

**Problem solved:** Provide consistent navigation across desktop and mobile viewports with proper accessibility.

**Implementation:** `Nav.tsx` is a client component with a fixed top navbar, desktop horizontal links, and a mobile hamburger menu. The mobile menu implements a focus trap (Tab cycles through menu items), Escape key closes the menu, and `body.overflow = hidden` prevents background scrolling. Active route is highlighted using `usePathname()`.

**Files:** `src/components/Nav.tsx`

**Tradeoffs:** The mobile menu is conditionally rendered (not animated in/out), so there is no enter/exit transition. The CTA button ("Get Involved") links to /contact and is visually prominent in both desktop and mobile layouts.

### 5. FadeIn Animation System

**Problem solved:** Add subtle scroll-triggered entrance animations to content sections without a heavy animation library.

**Implementation:** `FadeIn.tsx` uses IntersectionObserver with a configurable delay prop. Elements start with `opacity: 0; transform: translateY(12px)` and transition to visible state when they enter the viewport with `triggerOnce` behavior.

**Tradeoffs:** Simple and lightweight but no exit animations or complex orchestration. The delay prop is used to stagger sibling elements (e.g., stat cards, roadmap phases).

### 6. Design Token System

**Problem solved:** Establish a consistent visual language across all pages.

**Implementation:** `src/lib/tokens.ts` defines color, spacing, and typography tokens. `src/lib/fonts.ts` configures Next.js font optimization for DM Sans, IBM Plex Sans, and IBM Plex Mono. CSS variables are set in `globals.css` and referenced throughout components.

**Limitations:** Many pages use hardcoded Tailwind color values (e.g., `bg-[#12151c]`, `text-[#8892a4]`) instead of referencing tokens. This creates a maintenance risk where changing the brand palette requires find-and-replace across all page files rather than updating a single source of truth.

---

## Top 3 Priorities

1. **Fix the Formspree fallback (issue #001).** The contact form silently fails when `NEXT_PUBLIC_FORMSPREE_ID` is not set. Add a build-time warning or a visible UI indicator so deployment errors are caught before they lose leads.

2. **Add Organization JSON-LD to the homepage.** The FAQ page has structured data but the homepage does not. Adding Organization and WebSite schemas would improve search presence and credibility signals for a company seeking investment.

3. **Consolidate hardcoded colors into design tokens.** The current pattern of inline Tailwind hex values (`#12151c`, `#8892a4`, `#00d4aa`, etc.) appears on every page. Migrating these to CSS variable references would reduce maintenance cost and make a future light mode or brand refresh feasible.

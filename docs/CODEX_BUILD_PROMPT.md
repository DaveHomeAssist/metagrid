# Metagrid — Codex Build Prompt

> Execute all tasks below in order. Each task is atomic and grep-verifiable.
> Do not refactor, rename, or restructure anything not listed here.
> Working directory: `/Users/daverobertson/Desktop/Code/10-active-projects/metagrid/`

---

## TASK 1 — Skip Link (layout.tsx)

**File:** `src/app/layout.tsx`

Add a skip link as the first child inside `<body>`, before `<Nav />`.

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#00d4aa] focus:text-[#0a0c10] focus:rounded-lg focus:text-sm focus:font-semibold"
>
  Skip to content
</a>
```

Ensure the `<main>` tag already has `id="main-content"`. If not, add it.

**Verify:** `grep -n "Skip to content" src/app/layout.tsx` returns a match.

---

## TASK 2 — FadeIn: prefers-reduced-motion (FadeIn.tsx)

**File:** `src/components/FadeIn.tsx`

At the top of the component (inside the function body, before any other hooks), add:

```tsx
const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

useEffect(() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  setPrefersReducedMotion(mq.matches);
  const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}, []);
```

Then in the IntersectionObserver setup, if `prefersReducedMotion` is true OR `typeof IntersectionObserver === 'undefined'`, set visible to true immediately and skip observer creation.

In the rendered div's inline style, when `prefersReducedMotion` is true, set `opacity: 1` and `transform: 'none'` with `transition: 'none'`.

**Verify:** `grep -n "prefers-reduced-motion" src/components/FadeIn.tsx` returns a match.

---

## TASK 3 — Nav: Escape key + scroll lock (Nav.tsx)

**File:** `src/components/Nav.tsx`

Add a `useEffect` that:
1. Listens for `keydown` on `document`
2. If `key === 'Escape'` and `isOpen` is true, calls `setIsOpen(false)`
3. Cleans up the listener on unmount

Add a second `useEffect` that:
1. When `isOpen` is true, sets `document.body.style.overflow = 'hidden'`
2. When `isOpen` is false or on cleanup, sets `document.body.style.overflow = ''`

Add `aria-controls="mobile-menu"` to the hamburger `<button>`.

Add `id="mobile-menu"` and `role="dialog"` and `aria-modal="true"` and `aria-label="Navigation menu"` to the mobile menu container div.

**Verify:**
- `grep -n "Escape" src/components/Nav.tsx` returns a match
- `grep -n "aria-controls" src/components/Nav.tsx` returns a match
- `grep -n 'overflow' src/components/Nav.tsx` returns a match

---

## TASK 4 — FAQ Accordion: ARIA pattern (faq/page.tsx)

**File:** `src/app/faq/page.tsx`

For each accordion item, update the markup:

1. The `<button>` must have `aria-controls={`faq-panel-${i}`}` and `id={`faq-header-${i}`}`
2. The answer container `<div>` must have `id={`faq-panel-${i}`}`, `role="region"`, and `aria-labelledby={`faq-header-${i}`}`
3. Wrap the entire FAQ list in a `<div role="region" aria-label="Frequently asked questions">`

**Verify:**
- `grep -n "aria-controls" src/app/faq/page.tsx` returns a match
- `grep -n "aria-labelledby" src/app/faq/page.tsx` returns a match

---

## TASK 5 — Contact Form: Accessibility + Formspree (contact/page.tsx)

**File:** `src/app/contact/page.tsx`

### 5a — Formspree wiring

Replace the TODO/placeholder submit handler. The form should POST to `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID || 'YOUR_FORM_ID'}`.

Use `fetch` with method POST, headers `{ 'Accept': 'application/json' }`, body `JSON.stringify(formData)`.

Add a `submitStatus` state: `'idle' | 'submitting' | 'success' | 'error'`.

On success (response.ok): set status to `'success'`, reset form.
On failure: set status to `'error'`.

Disable the submit button when `submitStatus === 'submitting'`.

### 5b — ARIA enhancements

1. Add `aria-required="true"` to all required inputs
2. For each field, add an error span:
   ```tsx
   {errors.fieldName && (
     <span id="fieldName-error" role="alert" className="text-red-400 text-sm mt-1">
       {errors.fieldName}
     </span>
   )}
   ```
3. On each input, add `aria-describedby={errors.fieldName ? 'fieldName-error' : undefined}` and `aria-invalid={!!errors.fieldName}`
4. Add a status region after the submit button:
   ```tsx
   <div aria-live="polite" className="mt-4">
     {submitStatus === 'success' && <p className="text-[#00d4aa]">Message sent. We'll be in touch.</p>}
     {submitStatus === 'error' && <p className="text-red-400">Something went wrong. Please try again.</p>}
   </div>
   ```

**Verify:**
- `grep -n "aria-live" src/app/contact/page.tsx` returns a match
- `grep -n "aria-invalid" src/app/contact/page.tsx` returns a match
- `grep -n "formspree" src/app/contact/page.tsx` returns a match (case-insensitive)

---

## TASK 6 — OG Metadata (layout.tsx)

**File:** `src/app/layout.tsx`

In the `metadata` export, ensure these fields exist:

```ts
metadataBase: new URL('https://metagrid.energy'),
openGraph: {
  title: 'Metagrid — Wireless Power for AI Infrastructure',
  description: 'Engineering wireless power delivery for remote AI data centers using metamaterials and adaptive control. Patent pending.',
  url: 'https://metagrid.energy',
  siteName: 'Metagrid',
  type: 'website',
  images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Metagrid — Wireless Power for AI Infrastructure' }],
},
twitter: {
  card: 'summary_large_image',
  title: 'Metagrid — Wireless Power for AI Infrastructure',
  description: 'Engineering wireless power delivery for remote AI data centers using metamaterials and adaptive control.',
  images: ['/og-image.png'],
},
robots: { index: true, follow: true },
```

If `metadataBase` already exists, update it. If not, add it.

**Verify:** `grep -n "metadataBase" src/app/layout.tsx` returns a match.

---

## TASK 7 — robots.txt

**File:** `public/robots.txt` (create new)

```
User-agent: *
Allow: /

Sitemap: https://metagrid.energy/sitemap.xml
```

**Verify:** `cat public/robots.txt` contains `User-agent`.

---

## TASK 8 — Sitemap (Next.js metadata API)

**File:** `src/app/sitemap.ts` (create new)

```ts
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://metagrid.energy';
  const pages = ['', '/technology', '/roadmap', '/safety', '/team', '/faq', '/contact'];

  return pages.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1.0 : 0.7,
  }));
}
```

**Verify:** `ls src/app/sitemap.ts` succeeds.

---

## TASK 9 — House Logging Standard Compliance

**All files in `src/`**

Run: `grep -rn "console\." src/`

If any `console.log`, `console.info`, `console.debug`, `console.warn`, or `console.error` calls exist in app runtime code, remove them or replace with the house standard logger pattern. Test/config files are exempt.

If zero matches, this task is already done.

**Verify:** `grep -rn "console\.\(log\|info\|debug\)" src/` returns zero matches.

---

## TASK 10 — Build verification

Run:

```bash
npm run build
```

Fix any TypeScript or build errors introduced by Tasks 1–9. Do not change any code unrelated to the errors.

Then run:

```bash
npm run lint
```

Fix any lint errors introduced by Tasks 1–9.

**Verify:** Both commands exit 0.

---

## EXECUTION RULES

1. Complete tasks in order (1 through 10)
2. Do not add comments like `// removed` or `// TODO` — clean code only
3. Do not refactor, rename, or restructure existing code outside the scope of each task
4. Do not add new dependencies
5. Do not add new pages or components
6. Preserve all existing Tailwind class names and styling
7. Use exact hex values from tokens: bg `#0a0c10`, accent `#00d4aa`, text `#e8eaf0`, muted `#8892a4`, border `#1f2533`, surface `#12151c`
8. Every task has a grep-based verify command — if it doesn't pass, the task isn't done

# BuyTuk — Global Digital Flagship

Bilingual (Arabic RTL / English LTR) flagship experience for **BuyTuk** — built as a
technology-company product surface, not a brochure site.

> **Honesty rule (non-negotiable).** Every product, metric, milestone, customer and
> stack claim in this repository is either **verified from the delivered codebase** or
> **marked as pending client documentation**. Nothing unverified is rendered as a fact.

---

## 1. Quick start

```bash
npm install
npm run dev            # http://localhost:3000  -> redirects to /ar (or /en from Accept-Language)
npm run build && npm start
```

Routes (every route exists in both locales):

| Route | Purpose |
| --- | --- |
| `/ar`, `/en` | Homepage — the 19 required blocks |
| `/ar/products`, `/en/products` | Product register |
| `/ar/products/[slug]` | Product detail (status, problem, features, tech, screenshots, case study, CTA, evidence) |
| `/ar/services`, `/en/services` | Six sector-specific solution concepts (law firm, clinic, supermarket, online store, cafe, real estate) |
| `/ar/academy`, `/en/academy` | BuyTuk Academy — evidence chain + AI's role |
| `/ar/ai-lab`, `/en/ai-lab` | AI Lab — production / prototype / research / future separation |
| `/sitemap.xml`, `/robots.txt` | SEO |
| `/api/contact` | Validated, rate-limited contact endpoint (POST only) |

---

## 2. Homepage — the 19 blocks

Order is fixed by the brief and implemented in `components/sections/AllSections.js`
(blocks 1–9) and `components/sections/SectionsB.js` (blocks 10–19):

1. Cinematic opening — `CinematicOpening.js` (once per session, skippable, motion-aware)
2. Logo reveal — `Hero.js` (SVG arc draw)
3. Interactive 3D hero — `components/three/HeroScene.jsx`
4. Main brand statement — hero `h1` + `Statement`
5. What is BuyTuk — `WhatIs`
6. Ecosystem — `Ecosystem`
7. Technology — `Technology`
8. AI — `AiSection`
9. Products — `ProductsSection` → `ProductsRegister`
10. Projects · 11. Company journey · 12. Verified metrics · 13. Industries / customers
14. BuyTuk Academy · 15. Innovation Lab · 16. Infrastructure & security
17. Insights · 18. Contact · 19. Global footer

---

## 3. Design system

`app/globals.css` is the single source of truth: colour, typography, spacing, radii,
shadow, gradients, motion tokens, plus the primitive classes (`.card`, `.chip`, `.btn`,
`.node`, `.timeline`, `.flow`, `.metric`). Components never hard-code raw values.

- **Typography** — Inter (Latin), IBM Plex Sans Arabic (Arabic), mono for data.
  Arabic switches family *and* line-height via `html[dir='rtl']`.
- **Colour** — near-black ink scale with an "Arc" accent (`#4ce0ff → #6f7bff → #a855f7`)
  and a warm signal amber reserved for *unverified* content.
- **Motion tokens** — `--d-instant` … `--d-cinema` durations, three easing curves.

---

## 4. Motion system & reduced motion

| Layer | Implementation |
| --- | --- |
| Page transition | `pageIn` keyframe on `[data-page-enter]` |
| Scroll reveal | `Reveal.js` — IntersectionObserver, unobserve after fire |
| 3D interaction | scroll + pointer camera rig in `HeroScene.jsx` |
| Micro-interactions | hover/elevate transitions on cards and buttons |
| **Reduced motion** | `prefers-reduced-motion` media query *and* a user-facing motion toggle (header) writing `html[data-motion]` |

Reduced-motion path freezes the 3D rig, disables reveals, removes the intro and
swaps in the static hero composition. A CSS-only override also guarantees the
fallback even if JavaScript never runs.

---

## 5. Performance

- 3D is a **separate dynamic chunk** (`next/dynamic`, `ssr:false`), loaded only when:
  viewport ≥ 900px **and** WebGL is present **and** no reduced-motion preference **and**
  not a coarse-pointer small screen **and** `saveData` is off — then deferred to
  `requestIdleCallback`.
- **No external 3D assets.** Geometry is procedural (icosahedron + torus + buffer
  attribute), so there is nothing heavy to preload or fail. Level of detail derives
  from viewport width; DPR is capped at 1.75; antialias is off.
- Images: `next/image` with AVIF → WebP, 30-day minimum cache TTL, immutable caching
  for hashed assets.
- Fonts: `preconnect` + `display=swap`, and a system-font stack fallback if the CDN
  is unreachable (loaded as a stylesheet, not a blocking script).
- Static-first: pages are pre-rendered; a fallback static hero paints before any JS.

---

## 6. Content / CMS (no code deploy required)

`lib/cms.js` reads content from one of two sources:

1. **`CMS_ENDPOINT` set** → headless CMS with ISR (`CMS_REVALIDATE_SECONDS`) and cache
   tags `buytuk:<collection>`.
2. **No endpoint** (default) → the committed JSON in `/content/cms`.

Editable without code: `products`, `projects`, `insights`, `journey`, `metrics`, `site`,
**and the hero copy** (`hero.json`, satisfying "hero text editable from CMS").

The specialist solution showcase lives in `components/sections/ServiceShowcase.js`
with Arabic and English copy in the locale dictionaries. Its six sector previews are
illustrative design concepts, clearly labeled as concepts—not delivered work or client
references. Each has a distinct visual treatment and sector-specific sample interface.

If the CMS is unreachable, the module logs and degrades to the committed copy — the page
never breaks because of a CMS outage.

### Product statuses
`live` · `in-development` · `research` · `coming-soon` — rendered by `StatusChip` with
distinct colour tokens, and each record additionally carries `verified` + `evidence[]`.

### Files still needed from BuyTuk
| # | Item | Why it blocks publication |
| --- | --- | --- |
| 1 | Verified product list (name, status, problem, features, tech, screenshots, case study) | The register currently holds clearly-labelled placeholder rows |
| 2 | Confirmed company journey dates & milestone wording | Rows render as *proposed structure — awaiting confirmation* |
| 3 | Any provable metric **with its source** | Metrics section renders `—` and "pending documentation" by design |
| 4 | Sector confirmations + customer references (written permission) | Industries are proposed focus areas; no logos published |
| 5 | Internal production architecture (cloud, DB, model providers, CI/CD, observability) | Kept separate from the verifiable platform stack |
| 6 | Legal entity details, official email/phone, registered address | Legal pages wired but unpublished; contact channels deliberately empty |
| 7 | Social accounts (official URLs) | `Organization.sameAs` left empty rather than guessed |
| 8 | Real screenshots & OG image | OG uses a generated SVG; screenshots marked as pending |

---

## 7. SEO

`lib/seo.js` produces canonical URLs, `hreflang` alternates (`ar`, `en`, `x-default`),
Open Graph/Twitter cards and JSON-LD (`Organization`, `WebSite`, `BreadcrumbList`,
`SoftwareApplication`). `app/sitemap.js` emits every route × locale plus product pages
with alternates; `app/robots.js` disallows `/api/` and `/_next/`. One `<h1>` per page,
semantic landmarks, `Breadcrumb` nav on detail pages, `lang`/`dir` on `<html>`.

---

## 8. Security

- Headers on every response (`next.config.mjs`): CSP, `X-Frame-Options: DENY`,
  `nosniff`, strict referrer policy, HSTS (2 years, preload), locked-down
  `Permissions-Policy`, `Cross-Origin-Opener-Policy`.
- `/api/contact`: POST-only, body-size guard, full server-side re-validation,
  per-IP token-bucket rate limit, honeypot trap, control-character sanitisation,
  generic error surface, provider failures logged not leaked.
- Secrets (`CMS_READ_TOKEN`, `RESEND_API_KEY`, `CONTACT_INBOX`) are read from the
  server environment only — nothing sensitive ships to the client bundle.
- `npm audit` as part of the release checklist (see below).

---

## 9. Accessibility

Skip link, visible focus rings, `aria-current`/`aria-expanded`/`aria-pressed`,
`aria-invalid` + `aria-describedby` on every form error, `role="status"` on success,
live-region-safe notices, decorative SVG marked `aria-hidden`, screen-reader text for
the hero statement, and a print stylesheet.

---

## 10. Analytics (privacy-first)

`lib/analytics.js` — nothing is sent until consent is granted (banner in
`ConsentBanner.js`). Fixed event vocabulary only: `page_view`, `section_view`,
`product_view`, `cta_click`, `contact_submit`, `scroll_depth`, `language_switch`,
`motion_preference`. Random session id in `sessionStorage`, no personal data, no
cross-site identifiers, `sendBeacon` transport, `NEXT_PUBLIC_ANALYTICS_ENDPOINT`
unset ⇒ events are dropped entirely.

---

## 11. Deployment

```bash
cp .env.example .env.local     # fill in
npm run build
```

Vercel/Netlify/Node host: `npm run build` then `npm start`. The middleware performs
locale routing at the edge; keep `NEXT_PUBLIC_SITE_URL` set to the real origin so
canonicals, hreflang and the sitemap stay correct.

---

## 12. QA checklist before launch

- [ ] `npm run build` clean (done — see build log)
- [ ] Responsive: 360 / 480 / 768 / 1024 / 1440 / 1920 px
- [ ] Devices: Android Chrome, iOS Safari, iPad Safari, desktop Chrome/Firefox/Safari
- [ ] Accessibility: keyboard-only pass, axe/Lighthouse ≥ 95, screen-reader pass on the contact form
- [ ] Performance: Lighthouse mobile ≥ 90 — verify the 3D chunk is *absent* on mobile
- [ ] Reduced motion: OS setting **and** header toggle, on every animated section
- [ ] SEO: validate JSON-LD, confirm canonical + hreflang, submit sitemap
- [ ] Security: `npm audit`, header scan, rate-limit + honeypot test on `/api/contact`
- [ ] Bilingual: full pass in `ar` (RTL) and `en` (LTR) — layout, 3D, forms, navigation
- [ ] CMS: switch `CMS_ENDPOINT` on and confirm products/insights update without a deploy

---

## 13. Structure

```
app/
  [locale]/          layout.js (lang/dir, JSON-LD, fonts) · page.js · not-found.js
    products/        page.js · [slug]/page.js
    academy/ ai-lab/
  api/contact/       route.js
  sitemap.js  robots.js  globals.css
components/
  layout/            Header · Footer · NotFoundView
  sections/          AllSections (1-9) · SectionsB (10-19) · Hero · ProductsRegister
                     ContactForm · CinematicOpening
  three/             HeroScene.jsx (R3F, procedural, LOD, motion-aware)
  ui/                Reveal · StatusChip · LocalizedLink · ConsentBanner
                     AnalyticsProvider · MotionProvider · MotionToggle
content/
  cms/               products · projects · insights · journey · metrics · site · hero
  dictionaries/      ar.json · en.json
lib/                 site.js · i18n.js · cms.js · seo.js · analytics.js
```

**Swapping the i18n layer:** `lib/i18n.js` is a dependency-free dictionary translator
with the same call shape as an ICU catalogue (`t('products.items.0.name')`). Moving to
`next-intl` later means replacing this one module and the middleware — no component
touches the translation mechanism directly.

---

## 14. Final acceptance test

A stranger arriving at the site should, within minutes, know: who BuyTuk is, what it
builds, which products it owns, which fields it works in, how it uses technology and AI,
how to collaborate, where to find products and projects, and how to make contact — while
the experience stays fast, clear, scalable, and **built on information that can be proven**.

---

# PWA (Progressive Web App)

The app is installable and works offline.

**What ships**

| Piece | Path |
|---|---|
| Manifest | `app/manifest.js` → served at `/manifest.webmanifest` (name, short_name, description, `start_url: /ar`, `scope: /`, `display: standalone`, `lang: ar`, `dir: rtl`, `theme_color`, `background_color`, icons, shortcuts) |
| Icons | `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png` (safe-zone padded), `apple-touch-icon-180.png` — real PNGs generated from `public/icon.svg` |
| Service worker | `public/sw.js`, versioned caches |
| Registration | `components/ui/ServiceWorkerRegister.js`, mounted in `app/[locale]/layout.js`, **after `load`, production only** |
| Offline page | `app/[locale]/offline/page.js` → `/ar/offline`, `/en/offline` (bilingual) |

**Caching policy (deliberate, not a blanket cache)**

- Non-GET requests are **never** handled and **never** cached (the contact form POST always hits the network).
- `/api/*` is **never** cached.
- `/_next/static/*` → *stale-while-revalidate*.
- Page navigations → *network-first*, falling back to the cached page, then to the offline page.
- Caches are versioned (`VERSION` in `public/sw.js`); older versions are deleted on `activate`.

**Security headers** — `worker-src 'self'` and `manifest-src 'self'` were added to the CSP; `/sw.js` is served with `Cache-Control: no-cache` and `Service-Worker-Allowed: /`. Nothing else in the CSP was relaxed.

**HTTPS is required in production.** Service workers (and therefore installation and offline mode) only run on a secure origin — `https://` — or on `localhost` during development. Deploy behind TLS before announcing installability.

**Verify**

```bash
npm run build && npm start
BASE=http://localhost:3000 node smoke-test.mjs     # includes the PWA + link-crawl + heading checks
node scripts/pwa-offline.mjs                       # proves the offline fallback headlessly
```

# What BuyTuk must supply — fillable input table

**The previously completed baseline is listed at the bottom (§B).** Everything in §A is data only BuyTuk can provide. Recent contact-delivery and sitemap changes still require a fresh build and smoke-test run before release.

## §A — Input required from BuyTuk

Fill the **Your value** column and send it back. "Status" is pre-set by the build.

### A1 — Hosting & domain *(blocks every Production row)*

| Category | Field | Required | Example | Current value | Status |
|---|---|---|---|---|---|
| Hosting | Provider + account / deploy permission | **Yes** | Vercel account, or SSH/Git access | — | Missing |
| Hosting | Production environment variables set | **Yes** | see `.env.example` | — | Missing |
| Domain | Primary domain | **Yes** | `buytuk.com` | — | Missing |
| Domain | Canonical host (apex or `www`) | **Yes** | `www.buytuk.com` | — | Missing |
| Domain | DNS access to point the record | **Yes** | registrar or DNS panel access | — | Missing |
| Contact | `CONTACT_INBOX` address | **Yes** | `hello@buytuk.com` | — | Missing |
| Contact | Mail transport key (Resend / SMTP) | **Yes** | `RESEND_API_KEY=re_…` | — | Missing |
| Contact | Verified sender (`CONTACT_FROM`) | No | `BuyTuk <no-reply@buytuk.com>` | — | Missing |
| Analytics | Provider endpoint + consent wording | No | Plausible / first-party | — | Missing |
| CMS | `CMS_ENDPOINT` + read token, if a CMS is used | No | `https://cms.buytuk.com` | — | Not needed (JSON mode works) |

### A2 — Company identity (legal)

| Category | Field | Required | Example | Current value | Status |
|---|---|---|---|---|---|
| Company | Legal name | **Yes** | `BuyTuk LLC` | — | Missing |
| Company | Legal form | **Yes** | `LLC / Ltd / SA` | — | Missing |
| Company | Registration number | **Yes** | — | — | Missing |
| Company | VAT / tax number | No | — | — | Missing |
| Company | Registered address, city, country, postal code | **Yes** | — | — | Missing |
| Company | General email | **Yes** | `hello@buytuk.com` | — | Missing |
| Company | Sales email | **Yes** | `sales@buytuk.com` | — | Missing |
| Company | Partnerships email | No | — | — | Missing |
| Company | Press email | No | — | — | Missing |
| Company | Privacy email | **Yes** | `privacy@buytuk.com` | — | Missing |
| Company | Main phone | No | `+971 …` | — | Missing |
| Company | Business hours | No | `Sun–Thu 09:00–18:00` | — | Missing |
| Legal | Privacy Policy (reviewed text) | **Yes** | — | — | Missing |
| Legal | Terms of Use (reviewed text) | **Yes** | — | — | Missing |
| Legal | Cookie / Analytics policy | **Yes** | — | — | Missing |
| Legal | Effective date per document | **Yes** | `2026-01-01` | — | Missing |

### A3 — Social accounts *(each URL must be opened and confirmed official)*

| Category | Field | Required | Example | Current value | Status |
|---|---|---|---|---|---|
| Social | Platform + official URL | No | `https://www.linkedin.com/company/buytuk` | — | Missing |
| Social | Handle as displayed | No | `@buytuk` | — | Missing |
| Social | Confirmation it is the official account | **Yes if published** | human-verified | — | Missing |

### A4 — Products & platforms *(8 entries exist; each needs approval or correction)*

| Category | Field | Required | Example | Current value | Status |
|---|---|---|---|---|---|
| Product | English name | **Yes** | `BuyTuk Academy` | 8 names present | Awaiting approval |
| Product | Arabic name | **Yes** | `BuyTuk Academy` | 8 names present | Awaiting approval |
| Product | Classification (product / platform / capability / solution) | **Yes** | `platform` | 8 classified | Awaiting approval |
| Product | Lifecycle status (live / in-development / research / coming-soon) | **Yes** | `in-development` | all `coming-soon` or `research` | Awaiting approval |
| Product | Short description (ar + en) | **Yes** | — | present | Awaiting approval |
| Product | Problem solved (ar + en) | **Yes** | — | present | Awaiting approval |
| Product | Features list | **Yes** | — | present | Awaiting approval |
| Product | Technology list | **Yes** | — | present | Awaiting approval |
| Product | Screenshots | No | PNG/JPG set | — | Missing |
| Product | `verified: true` + evidence URL | **Yes to publish as verified** | repo / store / doc link | — | Missing |
| Product | Are any of the 8 actually Live today? | **Yes** | yes/no | — | Missing |

### A5 — Projects & case studies *(deliberately empty)*

| Category | Field | Required | Example | Current value | Status |
|---|---|---|---|---|---|
| Project | Client / organisation name | **Yes** | — | — | Missing |
| Project | Written client permission to publish | **Yes** | signed email / letter | — | Missing |
| Project | Industry / sector | **Yes** | — | — | Missing |
| Project | Problem, solution, BuyTuk contribution | **Yes** | — | — | Missing |
| Project | Technologies used | No | — | — | Missing |
| Project | Outcome + source for any number | **Yes if a number is quoted** | URL or document | — | Missing |
| Project | Screenshots + permission | **Yes** | — | — | Missing |
| Project | Date of delivery | **Yes** | `2025-06` | — | Missing |

### A6 — Journey, metrics, sectors

| Category | Field | Required | Example | Current value | Status |
|---|---|---|---|---|---|
| Journey | Company founding year | **Yes** | `2020` | `2020` | Provided |
| Journey | Exact dates for later launches or milestones | No | `2024-03` | Not published; later entries are undated work areas | Not required unless confirmed |
| Journey | Additional manager biography facts | No | Qualifications / career history | Only the supplied name and role are published | Not provided |
| Metric | Value + measurement method + date + source URL | No | `…%, measured 2026-09, source: …` | `null` → renders `—` | Missing |
| Metric | Active users / products live / projects delivered / markets / institutions / uptime | No | — | `null` | Missing |
| Sector | Confirm the 13 sectors, and which are focus vs exploratory | **Yes** | — | 13 listed | Awaiting approval |
| Asset | Final logo (SVG + PNG) | **Yes** | — | placeholder arc mark | Missing |
| Asset | Favicon set | No | — | `icon.svg` present | Acceptable |
| Asset | OG / social image 1200×630 | No | — | generated PNG present | Acceptable |
| Asset | Team photos + names + roles | No | — | — | Missing |
| 3D | Optional hero model / visual asset | No | `.glb` | procedural scene | Acceptable |

## §B — Already completed by the engineering side

| Area | Done |
|---|---|
| Engineering | Next.js 16.4.3 App Router; production build and 118-check smoke test passed |
| Engineering | Routes, API validation, rate limit, honeypot, error handling |
| Engineering | CMS **three-state** fallback (missing / present / failing) — website never breaks |
| Design | Desktop, mobile, tablet, RTL, LTR, 3D fallback, reduced motion, 3D isolation from the initial bundle |
| Accessibility | Keyboard, focus, skip link, ARIA, contrast, heading hierarchy (no jumps), Lighthouse A11y 100 |
| Security | CSP, HSTS, frame, nosniff, referrer, permissions, no secrets in the client bundle |
| SEO | Canonical, hreflang + x-default, OG, Twitter, JSON-LD, sitemap, robots, one H1 per page |
| Content | Identity repositioned, ecosystem + sectors, 5-way class distinction, CTA per entry, no invented data anywhere |
| Docs | Deployment guide, QA report, content inventory, cross-browser matrix, smoke test, this input form |

## §C — Small optional improvements (not blocking)

- Subset and preload the Arabic webfont to close the `/ar` Lighthouse gap.
- Publish real screenshots per product once supplied.
- Add a physical-device pass (iPhone Safari / Android Chrome) once the site is live.

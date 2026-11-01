# BuyTuk Flagship — Content Inventory

**Purpose.** A single auditable list of every claim, product, project, number, client and date that exists in the repository, with the class it is allowed to occupy. Nothing listed here was promoted to *Verified* or *Project* by the build. Those two classes are empty by design until BuyTuk supplies a source.

**Classes used**

| Class | Meaning | May be presented as |
|---|---|---|
| **Verified** | Confirmed by BuyTuk and supported by a source that can be opened and checked | A shipped fact (with the source attached) |
| **Unverified** | Needs review before it may be published | Not published, or published with an explicit "pending documentation" marker |
| **Capability** | Something BuyTuk can build. Wording must stay "we build…" | A capability, never a reference or a delivered project |
| **Product** | An owned BuyTuk product/platform with a declared lifecycle state | A product entry in the register |
| **Project** | Delivered work with attribution and evidence | A project or case study |
| **Coming Soon** | Declared, not yet delivered | A declared future entry |
| **Research** | Study / experiment, no delivery claim | A research entry |
| **Platform** | A product-class entry that is a multi-user system rather than a single tool | A product/platform entry |

**Source of truth:** `content/cms/*.json` and `content/dictionaries/{ar,en}.json`. Anything typed into a component is marked *copy*, not content.

---

## 1. Products register — `content/cms/products.json`

Bilingual `{ar, en}` on every user-visible field (name, tagline, description, problem, features, technology, CTA label).

| # | Slug | Name | Class | Status | Verified | Evidence | Notes |
|---|---|---|---|---|---|---|---|
| 1 | `buytuk-academy` | BuyTuk Academy | **Product / Platform**, sector Education | Coming Soon | ❌ | none | Positioned as an example *inside* the ecosystem (`BuyTuk → Ecosystem → Education → BuyTuk Academy`), not as the company identity. Screenshots pending; no case study. |
| 2 | `buytuk-ai` | BuyTuk AI | **Capability** (applied-AI layer) | Research | ❌ | none | Framed as a technology layer used across sectors, not as the company. |
| 3 | `web-and-saas-platforms` | Web & SaaS Platforms | **Capability / Platform** | Coming Soon | ❌ | none | Capability wording only. Not a delivered client project. |
| 4 | `business-and-professional-websites` | Business & Professional Websites | **Capability / Solution** | Coming Soon | ❌ | none | Covers the doctor / engineer / teacher / consultant / services cases named in the brief. |
| 5 | `ecommerce-solutions` | E-Commerce Solutions | **Capability / Solution** | Coming Soon | ❌ | none | — |
| 6 | `mobile-applications` | Android & iOS Applications | **Capability / Solution** | Coming Soon | ❌ | none | No app-store listing claimed. |
| 7 | `ai-powered-applications` | AI-Powered Applications | **Capability / Solution** | Coming Soon | ❌ | none | — |
| 8 | `business-systems-and-custom-solutions` | Business Systems & Custom Solutions | **Capability / Solution** | Coming Soon | ❌ | none | — |

**Removed:** the two previous `platform-reserved-01/02` placeholder rows ("Reserved slot — client product 01/02"). They were invented placeholder text, so they were deleted rather than re-presented as content. The register supports any number of entries through the CMS, which is what those rows existed to demonstrate.

**Not present anywhere:** delivered customers, logos, testimonials, screenshots, case studies.

---

## 2. Projects — `content/cms/projects.json`

| Item | Class | Status |
|---|---|---|
| `verified` list | **Project** | **Empty.** No delivered project is published. Renders: "لا توجد مشاريع منفّذة منشورة بعد" / "No delivered projects are published yet." |
| Products bucket | **Product** | Derived live from the product register (single source; the two sections cannot drift). |
| Capabilities bucket | **Capability** | Derived live from the product register. |
| Concepts bucket | **Coming Soon / Research** | Derived live from the product register where status is `coming-soon` or `research`. |

No project was invented. `attribution`, `client` and `evidence` remain empty for every row.

---

## 3. Metrics — `content/cms/metrics.json`

| Metric | Value | Class | Rendered as |
|---|---|---|---|
| Active users | `null` | Unverified | `—` + "pending documentation" |
| Products in Live status | `null` | Unverified | `—` |
| Projects delivered | `null` | Unverified | `—` |
| Markets served | `null` | Unverified | `—` |
| Partner institutions | `null` | Unverified | `—` |
| Measured uptime | `null` | Unverified | `—` |

**Zero numeric claims exist on the site.** Every figure currently visible is a build-measurement (bundle size, section count, product-entry count) read from the code, or `—`.

---

## 4. Company journey — `content/cms/journey.json`

The founding milestone is confirmed as 2020. Further rows describe software development, websites and platforms, applications, and ongoing product work as work areas—not dated launches or delivered client projects. They intentionally have no dates. The section also includes a concise leadership profile for Director Eng. Ahmed Antar Ahmed; no unprovided qualifications or achievements are claimed.

---

## 5. Sectors / industries — `content/dictionaries/{ar,en}.json` → `industries.segments`

Thirteen sectors, each tagged **Capability** except where noted. The section body states plainly: "قائمة قدرة وتغطية، لا قائمة عملاء منفّذين" / "a coverage and capability list, not a list of delivered clients."

| Sector | Tag | Sector | Tag |
|---|---|---|---|
| Education (BuyTuk Academy is the example) | Capability | Business | Capability |
| Engineering | Capability | Entrepreneurship | Capability |
| Construction | Capability | E-Commerce | Capability |
| Infrastructure | Capability | Professional services | Capability |
| Architecture | Capability | Digital products | **Product** |
| Healthcare | Capability | AI & intelligent systems | Capability |
| Sports | Capability | | |

**Client references: none.** Published state: "لا توجد مراجع عملاء منشورة… الأسماء والشعارات ودراسات الحالة تحتاج موافقة مكتوبة."

---

## 6. Capabilities / solutions — dictionary `capabilities.groups` and `solutions.items`

Four classes shown separately, as required:

- **Products** — BuyTuk Academy, BuyTuk AI
- **Platforms** — integrated web platforms, SaaS platforms, multi-user business systems
- **Solutions** — professional websites, e-commerce stores, Android & iOS apps, AI-powered apps, business systems, custom digital solutions
- **Capabilities** — web & API engineering, cloud & scaling, data & analytics, automation, information security, applied AI

Class: **Capability**. Each group renders a count of published register rows in that class, read from the register itself. Copy states these are "قدرات وحلول يمكن تصميمها — وليست مشاريع منفّذة ولا مراجع عملاء."

---

## 7. Technology — dictionary `technology`

| Item | Class | Note |
|---|---|---|
| Disciplines (AI, Cloud, APIs, Automation, Data, Web, Mobile, Infrastructure, Security, Scale) | **Capability** | Describes how BuyTuk works. |
| "This platform — verifiable today" stack list | **Verified (self-evident)** | Verifiable by inspecting this deployment (Next.js App Router, RSC, committed JSON content layer, CSP, rate limiting). |
| "BuyTuk production infrastructure — awaiting documentation" | **Unverified** | Explicitly labelled as awaiting client documentation. No cloud vendor, database or model provider is named. |

---

## 8. AI — dictionary `ai`

Four maturity levels are declared (production / prototype / research / future) as a **disclosure policy**. **The list of AI surfaces that actually hold each level is empty** — no AI feature is claimed as production, prototype or research output. Section framing: "الذكاء الاصطناعي طبقة تقنية داخل المنظومة… قدرة داخل الشركة، وليست هوية الشركة."

---

## 9. Academy — dictionary `academy`

Flow of seven steps (student → teacher → school → administration → evidence → AI assistance → reports) — Class: **Product / Platform** (design description, Coming Soon). AI role: assistance only, human decides. Positioning line rendered: `BuyTuk ← المنظومة ← التعليم ← BuyTuk Academy`.

## 10. Innovation / AI Lab — dictionary `lab`

Four phase names (hypothesis → experiment → evaluation → graduation) — Class: **Capability / Research process**. No experiment result is claimed. Lab pages carry Production / Prototype / Research / Future labels; the *published* list of actual lab outputs is empty.

## 11. Infrastructure & security — dictionary `infrastructure`

Six measures (security headers, server-only secrets, input validation, rate limiting, dependency hygiene, static-first delivery) — Class: **Verified against this codebase** (each one is inspectable in the delivered source). Class **Unverified** where it would describe BuyTuk's internal production estate.

## 12. Insights — `content/cms/insights.json`

Empty. Renders the honest empty state. No article, author or date invented.

## 13. Company / legal data — `content/cms/company.json`, `legal.json`, `social.json`

| Field | State | Class |
|---|---|---|
| Legal name, legal form, registration no., VAT no., registered address, city, country, postal code | `null` | **Unverified — not published** |
| Email (general, sales, partnerships, press, careers, privacy) | `null` | **Unverified — not published** |
| Phone (main, support), hours | `null` | **Unverified — not published** |
| Display name "BuyTuk" | published | **Verified (brand name only)** |
| Privacy / Terms / Cookies pages | `published: false` → they 404 by design | **Unverified** |
| Social accounts | Empty array → footer renders no icons | **Unverified — none published** |

The contact section renders only approved channels and otherwise shows the pending note. No email address, phone number or address was guessed.

---

## 14. Things that are real and measurable today

| Claim | Value | Source |
|---|---|---|
| Homepage content blocks | 19 brief blocks retained, re-ordered into 14 journey steps | `components/sections/AllSections.js` |
| Published product/register entries | 8 | `content/cms/products.json` |
| Claim classes in the register | 4 (product, platform, capability, solution) | `content/cms/products.json` |
| Sectors listed | 13 | dictionaries |
| Locales | 2 (ar RTL, en LTR) | `lib/site.js` |
| Verified projects | 0 | `content/cms/projects.json` |
| Published client references | 0 | dictionaries |
| Published numeric business metrics | 0 | `content/cms/metrics.json` |

---

## 15. Rule applied when publishing

1. No number, client, project, date or achievement appears unless a source exists — otherwise `—`, an empty state, or an explicit "pending documentation" marker.
2. Capability wording is used for capability content: "we build…", "solutions we can design" — never "we built for X".
3. `verified: true` and the `projects.verified` list are set **only** by BuyTuk, after review.

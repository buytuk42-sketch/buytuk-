# Progress ledger — final production & market readiness pass

Status vocabulary, used strictly:
**Implemented** = code written · **Verified** = executed and observed here · **Production Verified** = observed on a real deployed origin · **External Input Required** = blocked on data/hardware/credentials only BuyTuk can supply.

**Evidence note:** The saved build log records 35 generated pages and the saved smoke-test output records 116 passing checks. Older entries with different counts are outdated. These are historical results; the latest edits still require a fresh build and smoke-test run.

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Previous production build | Historically verified | Saved `docs/build-output.txt` reports exit 0 and 35 generated pages; latest edits not yet rebuilt |
| 2 | P0 — heading hierarchy on product pages | Verified | Smoke test: `/ar/products` one `<h1>`, no level jump |
| 3 | P0 — reduced-motion console errors | Verified | Fresh capture: reduced-motion context rendered with 0 console errors |
| 4 | P0 — 404 console errors | Verified | `/ar/route-that-does-not-exist` → 404 status, page renders, 0 console errors |
| 5 | Console / hydration / React warnings | Verified | 12 fresh page loads instrumented: total console errors = 0 |
| 6 | Internal links + assets | Verified | All routes 200; og image + icon.svg 200 |
| 7 | Contact form fields (name, email, phone, client type, industry, solution, budget, consent) | Implemented + Verified | Bilingual `content/cms/contact-form.json`; API validation probes all pass |
| 8 | Contact delivery wiring (`CONTACT_INBOX`, provider) | Implemented — External Input Required | Needs inbox address + transport key |
| 9 | CMS three-state fallback | Verified | States 1 and 3 probed against the production server → 200 both, local data served |
| 10 | CTA audit — specific action per entry, no bare "Learn More" | Implemented | Per-product CTA map in content + `lib/i18n.js` |
| 11 | Content-status taxonomy | Implemented | Exact tags: Verified Product / Verified Project / Capability / Solution / Research / Coming Soon / Unverified |
| 12 | No invented clients, numbers, projects, testimonials | Verified | Projects section renders the empty-state placeholder; metrics render `—` |
| 13 | Smoke-test harness (PASS/FAIL, rerunnable) | Implemented + historically verified | Saved `docs/smoke-test-output.txt` — **116 PASS / 0 FAIL**; latest edits not yet rerun |
| 14 | Lighthouse (labelled Local) | Verified | `docs/lh-ar.json`, `docs/lh-en.json` |
| 15 | Cross-browser / real-device matrix | Implemented, rows marked Not tested | `docs/CROSS-BROWSER-TEST-MATRIX.md` |
| 16 | Deployment documentation | Implemented | `docs/DEPLOYMENT.md` |
| 17 | Client input form | Implemented | `docs/CLIENT-INPUT-REQUIRED.md` |
| 18 | Production deployment, DNS, HTTPS, real inbox, real devices | External Input Required | See §D of the QA report |

## Remaining external inputs (cannot be closed from here)

1. Hosting account / deploy permission + production environment variables
2. Domain DNS access + the chosen canonical host
3. Production email inbox (`CONTACT_INBOX`) and mail-transport key
4. Real company & legal information; social accounts
5. Approval of the 8 product entries (names, status, classification)
6. Real, permissioned projects/case studies (with sources for any number)
7. Approved metrics (value + measurement method + date + source)

## جولة PWA (مُقاسة)

| البند | الحالة | الدليل |
|---|---|---|
| npm ci / npm run build | Historically verified | exit 0، 35 صفحة (`docs/build-output.txt`) |
| Manifest + 4 أيقونات PNG + maskable | Verified | 200 لكل مسار + الأبعاد من `file` + قياس منطقة maskable الآمنة |
| Service Worker بسياسة صريحة | Verified | 200 + الترويسات؛ لا `/api/` ولا غير GET |
| صفحة offline ثنائية اللغة | Verified | تُعرض فعليًا لصفحة غير مخزَّنة عند قطع الشبكة |
| زاحف الروابط + فحوص PWA | Verified | داخل `smoke-test.mjs` — 116 PASS / 0 FAIL |
| التثبيت على جهاز حقيقي / Safari / Firefox | Not tested / EXTERNAL INPUT REQUIRED | لا أجهزة متاحة |

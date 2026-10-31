# BuyTuk Global Flagship — Deployment Guide

Run these steps in order. Nothing here requires editing application source: every environment-specific value is read from the environment at build/run time.

---

## 1. Where the project lives

Deploy the **contents of the ZIP as the project root** — `package.json` must sit at the top level, not inside a subfolder.

```
buytuk-flagship/
├── app/            routes (App Router), incl. app/api/contact
├── components/     UI + sections + three/
├── content/cms/    committed JSON = the fallback content source
├── lib/            i18n, cms, seo, site, analytics
├── public/         icon, og image, static assets
├── proxy.js        locale routing
└── package.json
```

- **Node.js 20.9+ required** (the current Next.js 16 minimum).
- Install with `npm ci` if a lockfile is present, otherwise `npm install`.
- The project uses Next.js 16 App Router and deploys to Vercel or another Node.js host that meets the engine requirement.

## 2–4. Environment variables

Copy `.env.example` → `.env.local` (local) or paste into the host's environment settings (production).

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Public origin. Drives canonical URLs, hreflang, sitemap, OG. Set to the real HTTPS origin, no trailing slash. |
| `CONTACT_INBOX` | **Yes** | Address that receives contact submissions. |
| `CONTACT_PROVIDER` | **Yes for delivery** | Set to `resend` to enable real sending. If delivery is not configured, valid enquiries receive HTTP 503 and are not falsely reported as received. |
| `RESEND_API_KEY` | **Yes if `CONTACT_PROVIDER=resend`** | Transport key. Server-side only, never exposed to the browser. |
| `CONTACT_FROM` | No | Verified sender, e.g. `BuyTuk <no-reply@buytuk.com>`. Ignored unless `CONTACT_PROVIDER=resend`. |
| `CONTACT_RATE_WINDOW_MS` | No | Rate-limit window in milliseconds, default `60000`; invalid values use the default. |
| `CONTACT_RATE_MAX` | No | Max submissions per window per IP, default `5`; invalid values use the default. |
| `CMS_ENDPOINT` | No | Leave **empty** to serve all content from the committed JSON. |
| `CMS_READ_TOKEN` | No | Bearer token for a protected CMS. |
| `CMS_REVALIDATE_SECONDS` | No | ISR revalidation when a CMS is used, default `300`. |
| `NEXT_PUBLIC_ANALYTICS_ENDPOINT` | No | Consent-gated analytics. Empty ⇒ events dropped, nothing sent. |

Secrets are read only inside server code; the smoke test asserts none of them appear in the served HTML.

## 5. Build

```bash
npm ci
npm run build          # must end with "Compiled successfully" and list the route table
```
Check the generated route table for the exact route count. In the latest verified build, 34 routes were generated. Three.js should remain absent from the shared bundle (it is dynamically imported only when the 3D scene qualifies).

## 6. Deploy

**Vercel (recommended).** Import the repo → Framework preset **Next.js** → add the environment variables from §2–4 → Deploy. No `vercel.json` needed.

**Any Node host.**
```bash
npm ci && npm run build
PORT=3000 npm run start        # keep alive with pm2/systemd/Docker
```
Put a TLS-terminating proxy (the platform's edge, Nginx, Caddy) in front. `next.config.mjs` already sends HSTS, CSP and the other security headers.

The production CSP currently retains `'unsafe-inline'` for scripts to preserve Next.js static rendering and hydration. Moving to a nonce-based script policy requires dynamic rendering and a fresh performance/build review; do not remove the directive without implementing and validating that migration.

## 7–8. Domain and HTTPS

1. Point the domain at the host: `A`/`ALIAS` to the apex, `CNAME` for `www` (or the provider's guidance).
2. Add the domain in the host dashboard → it issues and renews the TLS certificate automatically. Do not disable HTTPS; HSTS is preloaded for two years, so **make sure HTTPS works before the first public request**.
3. Set `NEXT_PUBLIC_SITE_URL` to the exact HTTPS origin you settled on (apex *or* `www`, never both) and redeploy so canonical/hreflang/sitemap match.

## 9. CMS (optional — the site runs without it)

The content layer has three states and never breaks. The sitemap revalidates every five minutes and reads product slugs through the CMS content layer, including its local fallback:

| State | Configuration | Behaviour |
|---|---|---|
| 1 — no CMS | `CMS_ENDPOINT` empty | Serves `/content/cms/*.json`. Default state. |
| 2 — CMS live | `CMS_ENDPOINT` set and reachable | Serves CMS content, revalidated every `CMS_REVALIDATE_SECONDS`. |
| 3 — CMS failing | `CMS_ENDPOINT` set but unreachable/erroring | Catches the failure, logs it, **falls back to the local JSON**. The pages still render. |

**Verified in this build (both states probed against the production server):**

```
STATE 1 (no CMS endpoint)                                  → status=200, products rendered
STATE 3 (CMS configured but unreachable → falls back)      → status=200, products rendered
```

State 2 uses the identical code path as state 3 for parsing; only the fetch target differs. To move from JSON to CMS, set `CMS_ENDPOINT` and redeploy — no code change.

## 10. Contact — configuration and a real delivery test

1. Set `CONTACT_INBOX=…`, `CONTACT_PROVIDER=resend`, `RESEND_API_KEY=…`, `CONTACT_FROM=…`.
2. Verify the sending domain with the mail provider (SPF + DKIM records the provider gives you).
3. Redeploy, then open `/ar#contact` (or `/en#contact`).
4. Submit a real enquiry with your own address in the message.
5. **Pass condition:** the message arrives in `CONTACT_INBOX` within a minute, and the visitor sees the success state (no error, no blank screen).
6. Also submit an invalid form (empty/bad email) and confirm inline Arabic/English errors appear and nothing is sent.
7. If provider configuration is missing or delivery fails, the API returns an error and the form does not show success. Configure delivery before launch; submissions are not persisted as a fallback.

The smoke test skips valid-message delivery probes by default. Set `EXPECT_CONTACT_DELIVERY_UNAVAILABLE=1` when testing a deployment with no delivery provider, or set `ALLOW_CONTACT_EMAIL_TEST=1` only when you intentionally want it to send a real test email to the configured inbox.

The limiter uses the request IP supplied by the hosting platform, then the platform's `x-real-ip` / `x-forwarded-for` headers. Configure the ingress to replace or securely set these headers; do not pass through visitor-supplied forwarding headers. The in-memory limiter is per process, so use a platform WAF or shared rate-limit store for multi-instance deployments.

## 11. SEO verification

```bash
curl -s https://<origin>/sitemap.xml | head
curl -s https://<origin>/robots.txt
curl -s https://<origin>/ar | grep -o '<link rel="canonical"[^>]*>'
curl -s https://<origin>/ar | grep -o 'hreflang="[^"]*"'
```
Confirm: exactly one canonical per page; hreflang `ar`, `en` and `x-default`; sitemap URLs on the production origin; `robots.txt` referencing the sitemap. Then paste `/ar` and `/en` into the Rich Results / social-preview debuggers and check the OG card renders. Finally re-run:

```bash
BASE=https://<origin> SKIP_WRITE=1 node smoke-test.mjs
```
It must print `OVERALL: PASS`.

## 12. Rollback

1. **Instant:** in the host dashboard, promote the previous successful deployment (Vercel → Deployments → ⋯ → *Promote to Production*).
2. **CLI:** redeploy the previous commit/tag and rebuild.
3. **Content only:** if a CMS change caused the problem, unset `CMS_ENDPOINT` (or restore `/content/cms/*.json`) and redeploy — the site immediately serves the known-good local content.
4. **Env only:** restore the previous variable values; no rebuild of application code is needed.
5. After any rollback, re-run `curl -s -o /dev/null -w '%{http_code}' https://<origin>/ar` and `SKIP_WRITE=1 node smoke-test.mjs` to confirm recovery.

---

## 13. PWA — deployment notes

The PWA needs **no extra build step and no extra service**: the manifest, icons, service worker and offline page are committed and served by the same Next.js app.

1. **Serve over HTTPS.** Installation, the service worker and offline mode require a secure context. `http://` origins (other than `localhost`) will not register the worker. Ensure the TLS certificate is live *before* announcing installability.
2. **Do not strip these headers.** `next.config.mjs` sets `Cache-Control: no-cache` + `Service-Worker-Allowed: /` on `/sw.js`. If you terminate at a CDN or reverse proxy, make sure it does not cache `/sw.js` or remove `Service-Worker-Allowed` — otherwise an updated worker can never take over.
3. **CSP.** `worker-src 'self'` and `manifest-src 'self'` are required. If you tighten the CSP further, keep both directives or the worker and manifest will be blocked.
4. **`start_url` / `scope`.** `start_url` is `/ar` and `scope` is `/`. If the canonical host changes (apex ↔ `www`), keep the visitor on one origin — a cross-origin redirect breaks the installed-app scope.
5. **`NEXT_PUBLIC_SITE_URL`** must match the deployed origin so canonical/hreflang/sitemap and the manifest agree.
6. **Verify after deploy:**

```bash
curl -sI https://<origin>/sw.js | grep -iE 'cache-control|service-worker-allowed'
curl -s  https://<origin>/manifest.webmanifest | head -c 300
BASE=https://<origin> SKIP_WRITE=1 node smoke-test.mjs     # must end with OVERALL: PASS
```
7. **When you change cached assets**, bump `VERSION` inside `public/sw.js`. Old caches are removed on `activate`; without a bump, clients keep serving the previous copy.
8. **Rollback** — the PWA adds no server dependency: redeploy the previous build. If a stale worker is suspected, bump `VERSION`, redeploy, and clients refresh on the next visit (or clear site data).

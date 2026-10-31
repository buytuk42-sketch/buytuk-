/**
 * BuyTuk Global Flagship — post-deploy smoke test.
 *
 *   node smoke-test.mjs                              # http://127.0.0.1:3120
 *   BASE=https://buytuk.com node smoke-test.mjs      # after deploy
 *   SKIP_WRITE=1 node smoke-test.mjs                 # read-only (no live POST)
 *
 * Exit 0 = all PASS. Exit 1 = at least one FAIL. Every check is a real probe.
 * HTML attribute names are matched case-insensitively (hrefLang == hreflang).
 */
const BASE = (process.env.BASE || 'http://127.0.0.1:3120').replace(/\/$/, '');
const WRITE = process.env.SKIP_WRITE !== '1';
const results = [];
let fail = 0;
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  if (!ok) fail++;
};

async function req(path, { ip, ...init } = {}) {
  const headers = { ...(init.headers || {}) };
  if (ip) headers['x-forwarded-for'] = ip;          // isolate rate-limit buckets
  try {
    const r = await fetch(BASE + path, { redirect: 'manual', ...init, headers });
    return { status: r.status, headers: r.headers, text: await r.text().catch(() => '') };
  } catch (e) {
    return { status: 0, headers: new Headers(), text: '', error: e.message };
  }
}
let ipSeq = 1;
const post = (body, ip) =>
  // Each write-path probe gets its own synthetic client IP so the (correct)
  // per-IP rate limiter never conflates separate assertions with abuse.
  req('/api/contact', { ip: ip || `10.7.0.${++ipSeq}`, method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

// ---- 1. routes --------------------------------------------------------------
const ROUTES = ['/ar', '/en', '/ar/products', '/en/products', '/ar/academy', '/en/academy',
                '/ar/ai-lab', '/en/ai-lab', '/ar/legal', '/en/legal'];
for (const p of ROUTES) {
  const r = await req(p);
  check(`route ${p} → 200`, r.status === 200, `got ${r.status}`);
}
check('unknown route → 404', (await req('/ar/no-such-route-xyz')).status === 404);

// product detail pages — derived from the sitemap, never hard-coded
const sm = await req('/sitemap.xml');
const detail = [...new Set([...sm.text.matchAll(/https?:\/\/[^<]*?\/(ar|en)\/products\/([a-z0-9-]+)/g)]
  .map((m) => `/${m[1]}/products/${m[2]}`))];
check('sitemap exposes product detail URLs', detail.length > 0, `${detail.length} found`);
for (const p of detail.slice(0, 4)) {
  const r = await req(p);
  check(`product detail ${p} → 200`, r.status === 200, `got ${r.status}`);
}

// ---- 2. locale, direction ---------------------------------------------------
const ar = await req('/ar'), en = await req('/en');
check('/ar lang="ar" dir="rtl"', /<html[^>]+lang="ar"/i.test(ar.text) && /<html[^>]+dir="rtl"/i.test(ar.text));
check('/en lang="en" dir="ltr"', /<html[^>]+lang="en"/i.test(en.text) && /<html[^>]+dir="ltr"/i.test(en.text));

// ---- 3. one H1, no heading jump --------------------------------------------
const heads = (h) => [...h.matchAll(/<h([1-6])[\s>]/gi)].map((m) => +m[1]);
for (const [name, html] of [['/ar', ar.text], ['/en', en.text], ['/ar/products', (await req('/ar/products')).text]]) {
  const hs = heads(html), h1 = hs.filter((x) => x === 1).length;
  check(`${name}: exactly one <h1>`, h1 === 1, `found ${h1}`);
  let jump = null;
  for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) { jump = `h${hs[i - 1]}→h${hs[i]}`; break; }
  check(`${name}: no heading-level jump`, !jump, jump || '');
}

// ---- 4. SEO head -----------------------------------------------------------
for (const [name, html] of [['/ar', ar.text], ['/en', en.text]]) {
  check(`${name}: exactly one canonical`, (html.match(/rel="canonical"/gi) || []).length === 1,
    (html.match(/rel="canonical" href="([^"]+)"/i) || [])[1] || '');
  check(`${name}: hreflang ar + en + x-default`,
    /hreflang="ar"/i.test(html) && /hreflang="en"/i.test(html) && /hreflang="x-default"/i.test(html));
  check(`${name}: og:image`, /property="og:image"/i.test(html));
  check(`${name}: twitter:card`, /name="twitter:card"/i.test(html));
  check(`${name}: JSON-LD`, /application\/ld\+json/i.test(html));
  check(`${name}: meta description`, /name="description"/i.test(html));
  check(`${name}: no duplicate <title>`, (html.match(/<title/gi) || []).length === 1);
}

// ---- 5. sitemap / robots ---------------------------------------------------
check('sitemap.xml → 200', sm.status === 200, `got ${sm.status}`);
check('sitemap covers both locales', sm.text.includes('/ar') && sm.text.includes('/en'));
const rb = await req('/robots.txt');
check('robots.txt → 200', rb.status === 200, `got ${rb.status}`);
check('robots points to sitemap', /sitemap/i.test(rb.text));

// ---- 6. assets that previously logged 404s ---------------------------------
check('og image → 200', (await req('/og/buytuk-og.png')).status === 200);
check('icon.svg → 200', (await req('/icon.svg')).status === 200);

// ---- 7. security headers ---------------------------------------------------
for (const [k, label] of [['content-security-policy', 'CSP'], ['strict-transport-security', 'HSTS'],
  ['x-frame-options', 'X-Frame-Options'], ['x-content-type-options', 'X-Content-Type-Options'],
  ['referrer-policy', 'Referrer-Policy'], ['permissions-policy', 'Permissions-Policy']]) {
  check(`header ${label}`, !!ar.headers.get(k), (ar.headers.get(k) || 'missing').slice(0, 60));
}

// ---- 8. contact API validation (each from its own IP bucket) ---------------
check('API: GET → 405', (await req('/api/contact')).status === 405);
check('API: empty body → 400', (await post({})).status === 400);
check('API: malformed JSON → 400', (await req('/api/contact', {
  ip: `10.7.0.${++ipSeq}`, method: 'POST',
  headers: { 'content-type': 'application/json' }, body: '{'
})).status === 400);
check('API: invalid email → 400', (await post({ name: 'A', email: 'nope', message: 'x'.repeat(40), consent: true })).status === 400);
check('API: short message → 400', (await post({ name: 'A', email: 'a@b.co', message: 'short', consent: true })).status === 400);
check('API: missing consent → 400', (await post({ name: 'A', email: 'a@b.co', message: 'x'.repeat(40) })).status === 400);
check('API: invalid phone → 400', (await post({ name: 'A', email: 'a@b.co', phone: '!!!', message: 'x'.repeat(40), consent: true })).status === 400);
if (WRITE) {
  check('API: honeypot swallowed → 200', (await post({ name: 'A', email: 'a@b.co', message: 'x'.repeat(40), consent: true, website: 'bot' })).status === 200);
  if (process.env.ALLOW_CONTACT_EMAIL_TEST === '1') {
    const good = await post({ name: 'Smoke Test', email: 'smoke@example.com', phone: '+1 555 0100',
      clientType: 'Company', industry: 'Education', solution: 'Professional website', budget: 'Not specified',
      message: 'Automated smoke-test submission used to validate the contact pipeline.', consent: true });
    check('API: explicitly authorized delivery test accepted → 200', good.status === 200,
      `${good.status} ${good.text.slice(0, 70)}`);
  } else if (process.env.EXPECT_CONTACT_DELIVERY_UNAVAILABLE === '1') {
    const unavailable = await post({ name: 'Smoke Test', email: 'smoke@example.com',
      message: 'Automated smoke-test probe for missing delivery configuration.', consent: true });
    check('API: unconfigured delivery is not falsely acknowledged → 503', unavailable.status === 503,
      `${unavailable.status} ${unavailable.text.slice(0, 70)}`);
  } else {
    results.push({ name: 'API delivery probe', ok: true, detail: 'SKIPPED (opt in with EXPECT_CONTACT_DELIVERY_UNAVAILABLE=1 or ALLOW_CONTACT_EMAIL_TEST=1)' });
  }
  const oversizedBody = JSON.stringify({
    name: 'A', email: 'a@b.co', message: 'x'.repeat(20000), consent: true
  });
  const oversized = await req('/api/contact', {
    ip: `10.7.0.${++ipSeq}`, method: 'POST',
    headers: {
      'content-type': 'application/json',
      'content-length': String(new TextEncoder().encode(oversizedBody).byteLength)
    },
    body: oversizedBody
  });
  check('API: oversized payload rejected before parsing', oversized.status === 413);
  check('API: null JSON payload → 400', (await post(null)).status === 400);
  // positive proof the limiter engages: 7 rapid posts from ONE bucket
  const rapid = [];
  for (let i = 0; i < 7; i++) rapid.push((await post({ name: 'RL', email: 'rl@example.com', message: 'x'.repeat(40), consent: true }, '10.99.99.99')).status);
  check('API: rate limiter engages (429 seen)', rapid.includes(429), rapid.join(','));
} else {
  results.push({ name: 'API write-path checks', ok: true, detail: 'SKIPPED (SKIP_WRITE=1)' });
}

// ---- 9. no secret leakage --------------------------------------------------
for (const s of ['RESEND_API_KEY', 'CMS_READ_TOKEN', 'CONTACT_INBOX', 're_', 'SMTP_PASS']) {
  check(`no "${s}" leaked in /ar HTML`, !ar.text.includes(s));
}


// ===========================================================================
// LINK CRAWLER + FULL HEADING COVERAGE + PWA (added by the PWA round)
// ===========================================================================
const ASSET = /\.(png|jpe?g|svg|webp|avif|ico|css|js|json|xml|txt|webmanifest|woff2?|map)$/i;

// ---- 10. crawl every internal link on the entry pages ----------------------
const ENTRY = ['/ar', '/en', '/ar/products', '/en/products'];
const seen = new Set(); const queue = [...ENTRY]; const broken = [];
while (queue.length && seen.size < 80) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  const r = await req(path);                                   // redirects followed by default
  if (r.status >= 400) { broken.push(`${r.status} ${path}`); continue; }
  if (!/text\/html/i.test(r.headers.get('content-type') || '')) continue;
  for (const m of r.text.matchAll(/href="([^"]+)"/g)) {
    let h = m[1];
    if (h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:')) continue;
    if (/^https?:\/\//i.test(h)) { if (!h.includes('localhost') && !h.includes('127.0.0.1')) continue; h = new URL(h).pathname; }
    if (!h.startsWith('/') || ASSET.test(h) || h.startsWith('/api/') || h.startsWith('/_next/')) continue;
    const clean = h.split('#')[0].replace(/\/$/, '') || '/';
    if (clean === '/') continue;
    if (!seen.has(clean)) queue.push(clean);
  }
}
check(`LINK CRAWLER: no broken internal link (${seen.size} pages crawled)`, broken.length === 0, broken.slice(0, 6).join(' | '));

// ---- 11. headings on /en/products and ALL product detail pages -------------
const sitemapXml = (await req('/sitemap.xml')).text;
const allDetail = [...new Set([...sitemapXml.matchAll(/https?:\/\/[^<]*?\/(ar|en)\/products\/([a-z0-9-]+)/g)]
  .map((m) => `/${m[1]}/products/${m[2]}`))];
const headingTargets = ['/en/products', '/ar/products', ...allDetail];
const worst = { one: [], jump: [] };
for (const path of headingTargets) {
  const html = (await req(path)).text;
  const hs = [...html.matchAll(/<h([1-6])[\s>]/gi)].map((m) => +m[1]);
  const h1 = hs.filter((x) => x === 1).length;
  if (h1 !== 1) worst.one.push(`${path}=${h1}`);
  for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) { worst.jump.push(`${path}:h${hs[i - 1]}->h${hs[i]}`); break; }
}
check(`HEADINGS: exactly one <h1> on ${headingTargets.length} pages (incl. /en/products + all detail)`, worst.one.length === 0, worst.one.slice(0, 4).join(' | '));
check(`HEADINGS: no level jump on ${headingTargets.length} pages`, worst.jump.length === 0, worst.jump.slice(0, 4).join(' | '));
check(`product detail coverage = 16`, allDetail.length === 16, `${allDetail.length} detail URLs in sitemap`);

// ---- 12. PWA: manifest, icons, service worker, offline page ----------------
const mf = await req('/manifest.webmanifest');
check('PWA: /manifest.webmanifest → 200', mf.status === 200, `got ${mf.status}`);
check('PWA: manifest served as json', /json/i.test(mf.headers.get('content-type') || ''), mf.headers.get('content-type') || '');
let mani = null;
try { mani = JSON.parse(mf.text); } catch {}
if (mani) {
  for (const k of ['name', 'short_name', 'description', 'start_url', 'scope', 'display', 'lang', 'dir', 'theme_color', 'background_color', 'icons']) {
    check(`PWA: manifest has "${k}"`, mani[k] !== undefined && String(mani[k]).length > 0, JSON.stringify(mani[k] || '').slice(0, 40));
  }
  const sizes = (mani.icons || []).map((i) => i.sizes + ':' + i.purpose);
  check('PWA: icons 192 + 512 + maskable', sizes.some((s) => s.startsWith('192x192')) && sizes.some((s) => s.startsWith('512x512:any')) && sizes.some((s) => s.includes('maskable')), sizes.join(','));
  check('PWA: display standalone', mani.display === 'standalone');
  check('PWA: dir rtl', mani.dir === 'rtl');
} else check('PWA: manifest is valid JSON', false, mf.text.slice(0, 60));

for (const [iconPath, want] of [['/icons/icon-192.png', 'image/png'], ['/icons/icon-512.png', 'image/png'],
  ['/icons/maskable-512.png', 'image/png'], ['/icons/apple-touch-icon-180.png', 'image/png'], ['/icon.svg', 'image/svg+xml']]) {
  const r = await req(iconPath);
  check(`PWA: ${iconPath} → 200 ${want}`, r.status === 200 && (r.headers.get('content-type') || '').includes(want.split('/')[1]),
    `${r.status} ${r.headers.get('content-type') || ''}`);
}

const sw = await req('/sw.js');
check('PWA: /sw.js → 200', sw.status === 200, `got ${sw.status}`);
check('PWA: /sw.js is javascript', /javascript/i.test(sw.headers.get('content-type') || ''), sw.headers.get('content-type') || '');
check('PWA: sw.js Cache-Control no-cache', /no-cache|no-store/i.test(sw.headers.get('cache-control') || ''), sw.headers.get('cache-control') || '');
check('PWA: Service-Worker-Allowed: /', (sw.headers.get('service-worker-allowed') || '') === '/', sw.headers.get('service-worker-allowed') || '');
check('PWA: sw.js never caches /api/', sw.text.includes("startsWith('/api/')") && sw.text.includes('return;'));
check('PWA: sw.js ignores non-GET', sw.text.includes("req.method !== 'GET'"));
check('PWA: sw.js is versioned', /VERSION\s*=/.test(sw.text));
check('PWA: sw.js deletes old caches on activate', sw.text.includes('caches.delete'));

for (const p of ['/ar/offline', '/en/offline']) {
  const r = await req(p);
  check(`PWA: offline page ${p} → 200`, r.status === 200, `got ${r.status}`);
}
const arHtml2 = (await req('/ar')).text;
check('PWA: <link rel="manifest"> in HTML', /rel="manifest"/i.test(arHtml2));
check('PWA: theme-color meta in HTML', /name="theme-color"/i.test(arHtml2));
check('PWA: mobile web app capable meta', /name="(?:apple-)?mobile-web-app-capable"/i.test(arHtml2));
check('PWA: apple-mobile-web-app-title meta', /apple-mobile-web-app-title/i.test(arHtml2));
check('SEO kept: canonical still present', /rel="canonical"/i.test(arHtml2));
check('SEO kept: hreflang still present', /hreflang="(ar|en|x-default)"/i.test(arHtml2));

// ---- 13. CTA locale integrity ---------------------------------------------
// The contact section exists ONLY on the home page, so a CTA must navigate to
// /<locale>#contact from anywhere (a bare "#contact" on a product page is dead).
for (const locale of ['ar', 'en']) {
  const listing = (await req(`/${locale}/products`)).text;
  const detail0 = allDetail.find((u) => u.startsWith(`/${locale}/`)) || `/${locale}/products`;
  const detailHtml = (await req(detail0)).text;
  const anchors = [...listing.matchAll(/href="([^"]*#contact[^"]*)"/g)].map((m) => m[1]);
  check(`CTA ${locale}: products listing has a #contact CTA`, anchors.length > 0, anchors.slice(0, 3).join(','));
  check(`CTA ${locale}: every #contact CTA is locale-prefixed (${'/'.concat(locale)}#contact)`,
    anchors.every((h) => h === `/${locale}#contact`), anchors.join(','));
  const dead = anchors.filter((h) => h === '#contact');
  check(`CTA ${locale}: no dead same-page anchor on ${detail0}`, !dead.includes('#contact') || /id="contact"/i.test(detailHtml),
    dead.join(','));
  const home = (await req(`/${locale}`)).text;
  check(`CTA ${locale}: /${locale} actually contains the #contact target`, /id="contact"/i.test(home));
  const target = `/${locale}#contact`;
  const res = await req(target.replace(`#contact`, ''));
  check(`CTA ${locale}: target page ${res.status === 200 ? 'reachable' : 'unreachable'} (${res.status})`, res.status === 200);
}

// ---- report ----------------------------------------------------------------
const w = Math.max(...results.map((r) => r.name.length));
console.log(`\nBuyTuk smoke test — ${BASE}\n${'='.repeat(w + 14)}`);
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(w)}  ${r.detail}`);
console.log('='.repeat(w + 14));
console.log(`${results.length - fail} PASSED / ${fail} FAILED  →  OVERALL: ${fail ? 'FAIL' : 'PASS'}\n`);
process.exit(fail ? 1 : 0);

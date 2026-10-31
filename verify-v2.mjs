import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://127.0.0.1:3100';
const OUT = 'docs/screenshots';
fs.mkdirSync(OUT, { recursive: true });
const R = { shots: [], checks: {}, a11y: {}, errors: [] };
const b = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });

async function shot(name, url, o = {}) {
  const { w = 1440, h = 900, full = true, reduced = false, clip = null } = o;
  const c = await b.newContext({
    viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1,
    isMobile: w < 500, hasTouch: w < 500, reducedMotion: reduced ? 'reduce' : 'no-preference'
  });
  const p = await c.newPage();
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
  p.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 140)));
  const res = await p.goto(BASE + url, { waitUntil: 'networkidle', timeout: 45000 });
  await p.waitForTimeout(reduced ? 800 : 2400);
  await p.evaluate(async () => {
    const s = Math.floor(innerHeight * 0.85);
    for (let y = 0; y < document.body.scrollHeight; y += s) { scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); }
    scrollTo(0, 0);
  });
  await p.waitForTimeout(600);
  if (clip) await p.locator(clip).screenshot({ path: `${OUT}/${name}.png` });
  else await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });

  const m = await p.evaluate(() => {
    const box = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom) }; };
    const cue = document.querySelector('.hero__scroll'), note = document.querySelector('.hero-fallback-note');
    const hd = document.querySelector('#what-is .h2') || document.querySelector('#what-is h2');
    const cb = box(cue), nb = box(note);
    const ov = (a, z) => (!a || !z) ? null : !(a.bottom <= z.y || z.bottom <= a.y || (a.x + a.w) <= z.x || (z.x + z.w) <= a.x);
    return {
      h1: document.querySelectorAll('h1').length,
      dir: document.documentElement.dir, lang: document.documentElement.lang,
      canonical: document.querySelector('link[rel=canonical]')?.href || null,
      alts: [...document.querySelectorAll('link[rel=alternate]')].map(l => l.hreflang),
      og: !!document.querySelector('meta[property="og:image"]'),
      cueDisplay: cue ? getComputedStyle(cue).display : 'absent',
      notePos: note ? getComputedStyle(note).position : 'absent',
      overlap: ov(cb, nb), cueBox: cb, noteBox: nb,
      headingText: hd ? hd.textContent.trim() : null,
      headingClipped: hd ? hd.scrollHeight > hd.clientHeight + 1 : null,
      headingBox: box(hd),
      hOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      scrim: (() => { const x = document.querySelector('.hero__content'); return x ? getComputedStyle(x, '::before').content : null; })(),
      titleShadow: (() => { const t = document.querySelector('.hero__title'); return t ? getComputedStyle(t).textShadow.slice(0, 60) : null; })(),
      h2s: [...document.querySelectorAll('h2')].map(x => x.textContent.trim().slice(0, 55)),
      sections: [...document.querySelectorAll('section[id]')].map(x => x.id)
    };
  });
  R.shots.push({ name, url, viewport: `${w}x${h}`, full, reduced, http: res?.status(), errs, m });
  if (errs.length) R.errors.push(`${name}: ${errs.join(' | ')}`);
  await c.close();
}

// screenshots
await shot('v2-01-home-ar-desktop-hero', '/ar', { full: false });
await shot('v2-02-home-ar-desktop-full', '/ar');
await shot('v2-03-home-en-desktop-full', '/en');
await shot('v2-04-home-ar-mobile-hero', '/ar', { w: 390, h: 844, full: false });
await shot('v2-05-home-ar-mobile-full', '/ar', { w: 390, h: 844 });
await shot('v2-06-home-en-mobile-full', '/en', { w: 390, h: 844 });
await shot('v2-07-home-ar-tablet-full', '/ar', { w: 834, h: 1112 });
await shot('v2-08-section-capabilities-ar', '/ar', { full: false, clip: '#capabilities' });
await shot('v2-09-section-solutions-ar', '/ar', { full: false, clip: '#solutions' });
await shot('v2-10-section-ecosystem-ar', '/ar', { full: false, clip: '#ecosystem' });
await shot('v2-11-section-projects-ar', '/ar', { full: false, clip: '#projects' });
await shot('v2-12-section-academy-ar', '/ar', { full: false, clip: '#academy' });
await shot('v2-13-section-lab-ar', '/ar', { full: false, clip: '#lab' });
await shot('v2-14-section-products-ar', '/ar', { full: false, clip: '#products' });
await shot('v2-15-products-register-en', '/en/products');
await shot('v2-16-product-detail-ar', '/ar/products/business-and-professional-websites');
await shot('v2-17-reduced-motion-ar-mobile', '/ar', { w: 390, h: 844, full: false, reduced: true });
await shot('v2-18-not-found-ar', '/ar/does-not-exist');

// 3D: bundle isolation + device gating
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  const scripts = [];
  p.on('request', r => { if (r.resourceType() === 'script') scripts.push(r.url()); });
  await p.goto(BASE + '/en', { waitUntil: 'networkidle' });
  const pre = await p.evaluate(() => ({ webgl: (() => { try { const x = document.createElement('canvas'); return !!(x.getContext('webgl2') || x.getContext('webgl')); } catch { return false; } })(), canvas: document.querySelectorAll('canvas').length }));
  await p.waitForTimeout(9000);
  const post = await p.evaluate(() => ({ canvas: document.querySelectorAll('canvas').length, note: (document.querySelector('.hero-fallback-note')?.textContent || '').trim().slice(0, 80) || null, cueDisplay: getComputedStyle(document.querySelector('.hero__scroll')).display }));
  R.checks.threeD = {
    webglSupported: pre.webgl, canvasBeforeIdle: pre.canvas, canvasAfterIdle: post.canvas,
    scriptsTotal: scripts.length,
    threeChunks: scripts.filter(u => /three|heroscene/i.test(u)).length,
    threeInSharedBundle: scripts.some(u => /three/i.test(u) && !/chunk|_next\/static\/chunks/i.test(u)),
    fallbackNote: post.note, cueDisplay: post.cueDisplay
  };
  R.checks.threeDScriptList = scripts.map(u => u.split('/').pop()).slice(0, 30);
  await c.close();
}

// reduced motion on desktop -> no 3D
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await c.newPage();
  await p.goto(BASE + '/en', { waitUntil: 'networkidle' });
  await p.waitForTimeout(6000);
  R.checks.reducedMotionDesktop = await p.evaluate(() => ({ canvas: document.querySelectorAll('canvas').length, noteShown: !!document.querySelector('.hero-fallback-note') }));
  await c.close();
}

// data saver -> no 3D
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.addInitScript(() => { Object.defineProperty(navigator, 'connection', { value: { saveData: true, effectiveType: '3g' }, configurable: true }); });
  await p.goto(BASE + '/en', { waitUntil: 'networkidle' });
  await p.waitForTimeout(6000);
  R.checks.dataSaver = await p.evaluate(() => ({ canvas: document.querySelectorAll('canvas').length }));
  await c.close();
}

// structural accessibility
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  for (const url of ['/ar', '/en', '/ar/products', '/en/products', '/ar/academy', '/ar/ai-lab']) {
    await p.goto(BASE + url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1100);
    R.a11y[url] = await p.evaluate(() => {
      const hs = [...document.querySelectorAll('h1,h2,h3,h4')].map(x => Number(x.tagName[1]));
      let jump = null;
      for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) { jump = `${hs[i - 1]}->${hs[i]}`; break; }
      return {
        h1Count: document.querySelectorAll('h1').length, headingJump: jump,
        imagesWithoutAlt: [...document.images].filter(x => !x.hasAttribute('alt')).length,
        buttonsWithoutName: [...document.querySelectorAll('button')].filter(x => !x.textContent.trim() && !x.getAttribute('aria-label')).length,
        unlabelledFields: [...document.querySelectorAll('input,textarea,select')].filter(x => !x.labels?.length && !x.getAttribute('aria-label') && !x.getAttribute('placeholder')).length,
        lang: document.documentElement.lang, dir: document.documentElement.dir,
        skipLink: !!document.querySelector('a[href="#main"]'),
        landmarks: { main: document.querySelectorAll('main').length, header: document.querySelectorAll('header').length, footer: document.querySelectorAll('footer').length, nav: document.querySelectorAll('nav').length }
      };
    });
  }
  await p.goto(BASE + '/ar', { waitUntil: 'networkidle' });
  await p.keyboard.press('Tab');
  R.a11y.keyboardFirstStop = await p.evaluate(() => { const el = document.activeElement; const cs = getComputedStyle(el); return { tag: el.tagName, text: (el.textContent || '').trim().slice(0, 40), focusVisible: cs.outlineStyle !== 'none' || cs.outlineWidth !== '0px' || cs.boxShadow !== 'none' }; });
  await c.close();
}

// headers, contact API, SEO, secret leakage
{
  const c = await b.newContext();
  const p = await c.newPage();
  const resp = await p.goto(BASE + '/en', { waitUntil: 'domcontentloaded' });
  const h = resp.headers();
  R.checks.headers = { csp: !!h['content-security-policy'], hsts: !!h['strict-transport-security'], frame: h['x-frame-options'] || null, nosniff: h['x-content-type-options'] || null, referrer: h['referrer-policy'] || null, permissions: h['permissions-policy'] || null };
  const api = async (body) => { const r = await p.request.post(BASE + '/api/contact', { data: body, headers: { 'content-type': 'application/json' } }); return { status: r.status(), body: (await r.text()).slice(0, 120) }; };
  R.checks.contactApi = {
    empty: await api({}),
    invalidEmail: await api({ name: 'A', email: 'nope', message: 'x'.repeat(40), consent: true }),
    honeypot: await api({ name: 'A', email: 'a@b.com', message: 'x'.repeat(40), consent: true, company: 'bot' }),
    valid: await api({ name: 'Test', email: 'test@example.com', message: 'A'.repeat(40), consent: true, topic: 'product' })
  };
  const rb = await p.request.get(BASE + '/robots.txt');
  const sm = await p.request.get(BASE + '/sitemap.xml');
  const smT = await sm.text();
  R.checks.seo = { robotsStatus: rb.status(), robotsSnippet: (await rb.text()).replace(/\s+/g, ' ').slice(0, 140), sitemapStatus: sm.status(), sitemapUrls: (smT.match(/<loc>/g) || []).length, sitemapBothLocales: smT.includes('/ar') && smT.includes('/en') };
  const leaked = [];
  const srcs = await p.evaluate(() => [...document.querySelectorAll('script[src]')].map(s => s.src));
  for (const s of srcs.slice(0, 25)) {
    const t = await (await p.request.get(s)).text();
    for (const k of ['RESEND_API_KEY', 'CMS_READ_TOKEN', 'CONTACT_INBOX']) if (t.includes(k)) leaked.push(`${s.split('/').pop()}:${k}`);
  }
  R.checks.clientSecretLeak = leaked;
  await c.close();
}

await b.close();
fs.writeFileSync('docs/verify-v2.json', JSON.stringify(R, null, 2));
console.log('SHOTS=' + R.shots.length + ' CONSOLE_ERRORS=' + R.errors.length);
console.log('CHECKS=' + JSON.stringify({ threeD: R.checks.threeD, reducedMotionDesktop: R.checks.reducedMotionDesktop, dataSaver: R.checks.dataSaver, headers: R.checks.headers, contactApi: R.checks.contactApi, seo: R.checks.seo, clientSecretLeak: R.checks.clientSecretLeak }, null, 1));
console.log('A11Y=' + JSON.stringify(R.a11y, null, 1));
console.log('--- LAYOUT ---');
for (const s of R.shots) console.log(s.name, s.viewport, JSON.stringify({ http: s.http, overlap: s.m.overlap, cue: s.m.cueDisplay, notePos: s.m.notePos, clipped: s.m.headingClipped, hOverflow: s.m.hOverflow, h1: s.m.h1, dir: s.m.dir, canon: !!s.m.canonical, alts: s.m.alts, og: s.m.og, scrim: s.m.scrim, err: s.errs.length }));

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Captures real screenshots of the running production build and runs an axe
 * accessibility scan on each page. Writes results.json for the QA report.
 */
const BASE = process.env.BASE_URL || 'http://localhost:3111';
const OUT = '/home/user/shots';
fs.mkdirSync(OUT, { recursive: true });

const targets = [
  { name: 'ar-desktop', path: '/ar', width: 1440, height: 1000 },
  { name: 'en-desktop', path: '/en', width: 1440, height: 1000 },
  { name: 'ar-mobile', path: '/ar', width: 430, height: 932 },
  { name: 'en-mobile', path: '/en', width: 430, height: 932 },
  { name: 'ar-tablet', path: '/ar', width: 834, height: 1112 },
  { name: 'ar-products', path: '/ar/products', width: 1440, height: 1000 },
  { name: 'ar-product-detail', path: '/ar/products/buytuk-academy', width: 1440, height: 1000 },
  { name: 'ar-academy', path: '/ar/academy', width: 1440, height: 1000 },
  { name: 'ar-ailab', path: '/ar/ai-lab', width: 1440, height: 1000 },
  { name: 'en-products', path: '/en/products', width: 1440, height: 1000 },
  { name: 'ar-404', path: '/ar/this-page-does-not-exist', width: 1440, height: 900 },
  { name: 'ar-reduced-motion', path: '/ar', width: 1440, height: 1000, reducedMotion: true }
];

const axePath = path.resolve('node_modules/axe-core/axe.min.js');
const hasAxe = fs.existsSync(axePath);

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1']
});

const results = { captures: [], axe: [], consoleErrors: [] };

for (const target of targets) {
  const context = await browser.newContext({
    viewport: { width: target.width, height: target.height },
    deviceScaleFactor: 1,
    locale: target.path.startsWith('/ar') ? 'ar-EG' : 'en-US',
    reducedMotion: target.reducedMotion ? 'reduce' : 'no-preference'
  });

  const page = await context.newPage();
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err.message)));

  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('buytuk_motion', 'on');
      window.sessionStorage.setItem('buytuk_intro', '1');
      window.localStorage.setItem('buytuk_consent', 'denied');
    } catch {}
  });

  await page.goto(`${BASE}${target.path}`, { waitUntil: 'load', timeout: 60000 });

  // Walk the page so every IntersectionObserver reveal fires before capture.
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 110));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 350));
  });
  await page.waitForTimeout(1100);

  await page.screenshot({ path: `${OUT}/${target.name}.png`, fullPage: true });
  const height = await page.evaluate(() => document.body.scrollHeight);

  // Structural checks used by the QA report.
  const structure = await page.evaluate(() => ({
    h1Count: document.querySelectorAll('h1').length,
    h1Text: document.querySelector('h1')?.textContent?.trim() || '',
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    hreflang: Array.from(document.querySelectorAll('link[rel="alternate"]')).map((l) => l.hreflang).filter(Boolean),
    jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
    skipLink: Boolean(document.querySelector('.skip-link')),
    imagesWithoutAlt: Array.from(document.querySelectorAll('img')).filter((i) => !i.hasAttribute('alt')).length,
    canvas: document.querySelectorAll('canvas').length
  }));

  let axeViolations = null;
  if (hasAxe) {
    try {
      await page.addScriptTag({ path: axePath });
      const axeResult = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const r = await window.axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }
        });
        return {
          violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
          passes: r.passes.length
        };
      });
      axeViolations = axeResult;
      results.axe.push({ page: target.name, ...axeResult });
    } catch (error) {
      results.axe.push({ page: target.name, error: String(error.message) });
    }
  }

  if (errors.length) results.consoleErrors.push({ page: target.name, errors: errors.slice(0, 8) });
  results.captures.push({ ...target, height, structure, axeViolations });
  console.log(`${target.name}: ${height}px  h1=${structure.h1Count} lang=${structure.lang} dir=${structure.dir} axe_violations=${axeViolations ? axeViolations.violations.length : 'n/a'}`);
  await context.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
console.log('captures:', results.captures.length);
console.log('console error pages:', results.consoleErrors.length);

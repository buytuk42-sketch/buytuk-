import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://127.0.0.1:3165';
const shots = [
  ['final-01-home-ar-desktop-hero', '/ar', 1440, 900, {}],
  ['final-02-home-ar-desktop-full', '/ar', 1440, 900, { fullPage: true }],
  ['final-03-home-en-desktop-full', '/en', 1440, 900, { fullPage: true }],
  ['final-04-home-ar-mobile-full', '/ar', 390, 844, { fullPage: true }],
  ['final-05-home-en-mobile-full', '/en', 390, 844, { fullPage: true }],
  ['final-06-home-ar-tablet-full', '/ar', 834, 1112, { fullPage: true }],
  ['final-07-products-ar', '/ar/products', 1440, 900, { fullPage: true }],
  ['final-08-products-en', '/en/products', 1440, 900, { fullPage: true }],
  ['final-09-academy-ar', '/ar/academy', 1440, 900, { fullPage: true }],
  ['final-10-ai-lab-ar', '/ar/ai-lab', 1440, 900, { fullPage: true }],
  ['final-11-not-found-ar', '/ar/route-that-does-not-exist', 1440, 900, {}],
  ['final-12-reduced-motion-ar', '/ar', 1440, 900, { fullPage: true, reducedMotion: 'reduce' }],
];
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
let total = 0;
for (const [name, path, w, h, opt] of shots) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    reducedMotion: opt.reducedMotion || 'no-preference',
    locale: 'ar-EG'
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push('pageerror:' + e.message));
  try { await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 }); } catch {}
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `docs/screenshots/${name}.png`, fullPage: !!opt.fullPage });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  total += errs.length;
  console.log(`${errs.length === 0 ? 'CLEAN' : 'ERRORS'}  ${name}  console=${errs.length} hOverflow=${overflow}  ${errs.slice(0, 2).join(' | ').slice(0, 120)}`);
  await ctx.close();
}
await browser.close();
console.log('TOTAL_CONSOLE_ERRORS=' + total);

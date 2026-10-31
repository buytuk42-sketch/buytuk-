import { chromium } from 'playwright';
import fs from 'node:fs';

/**
 * Renders the social sharing card to a real PNG (1200x630) using the same
 * brand tokens as the site. Run before `next build` so the asset is part of
 * the deployment. Output: public/og/buytuk-og.png
 */
const SRC = 'file:///home/user/buytuk-flagship/public/og/og-card.html';
const OUT = '/home/user/buytuk-flagship/public/og/buytuk-og.png';

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const context = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1
});
const page = await context.newPage();
await page.goto(SRC, { waitUntil: 'load' });
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.waitForTimeout(500);
await page.screenshot({ path: OUT, type: 'png' });
await browser.close();

const size = fs.statSync(OUT).size;
console.log(`og-image: ${OUT} (${(size / 1024).toFixed(1)} KB)`);
if (size < 5000) {
  console.error('og-image: TOO SMALL — likely blank');
  process.exit(1);
}

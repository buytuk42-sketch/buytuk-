import { chromium } from 'playwright';
import fs from 'node:fs';
const BASE = process.env.BASE || 'http://127.0.0.1:3165';
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const report = {};
for (const [lang, path] of [['ar', '/ar'], ['en', '/en']]) {
  for (const w of [360, 390, 414]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, locale: lang === 'ar' ? 'ar-EG' : 'en-US' });
    const page = await ctx.newPage();
    const bad = [];
    page.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
    page.on('requestfailed', (r) => bad.push('REQFAIL ' + r.url()));
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(2000);
    report[`${lang}-${w}`] = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const out = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > vw + 1) {
          const cs = getComputedStyle(el);
          out.push({ tag: el.tagName.toLowerCase(), cls: String(el.className || '').slice(0, 64),
                     right: Math.round(r.right), w: Math.round(r.width), left: Math.round(r.left),
                     ws: cs.whiteSpace, ox: cs.overflowX, pos: cs.position });
        }
      }
      out.sort((a, b) => b.right - a.right);
      return { vw, scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth, offenders: out.slice(0, 8) };
    });
    report[`${lang}-${w}`].httpErrors = bad.slice(0, 4);
    await ctx.close();
  }
}
fs.writeFileSync('docs/diagnostics.json', JSON.stringify(report, null, 1));
for (const [k, v] of Object.entries(report)) {
  console.log(`${k}: vw=${v.vw} docScrollWidth=${v.scrollWidth} bodyScrollWidth=${v.bodyScrollWidth} overflow=${v.scrollWidth > v.vw + 1} httpErrors=${v.httpErrors.length ? v.httpErrors.join(' ; ') : 'none'}`);
  for (const o of v.offenders) console.log(`      offender <${o.tag}> .${o.cls} right=${o.right} w=${o.w} left=${o.left} ws=${o.ws} ox=${o.ox} pos=${o.pos}`);
}
await browser.close();

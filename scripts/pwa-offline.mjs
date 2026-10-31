import { chromium } from 'playwright';
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:3000';
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const out = {};
for (const [lang, home] of [['ar', '/ar'], ['en', '/en']]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: lang === 'ar' ? 'ar-EG' : 'en-US' });
  const page = await ctx.newPage();
  await page.goto(BASE + home, { waitUntil: 'networkidle' });
  const swReady = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return 'unsupported';
    const r = await navigator.serviceWorker.ready.catch(() => null);
    return r ? (r.active ? 'active' : 'registered') : 'none';
  });
  await page.reload({ waitUntil: 'networkidle' });                  // let the SW take control
  const controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
  await ctx.setOffline(true);                                      // cut the network
  const target = `${home}/legal`;                                  // a page NOT visited before
  let status = 0, body = '';
  try { const res = await page.goto(BASE + target, { waitUntil: 'domcontentloaded', timeout: 20000 }); status = res ? res.status() : 0; } catch (e) { status = -1; }
  await page.waitForTimeout(700);
  try { body = (await page.textContent('body')) || ''; } catch {}
  const offlineText = lang === 'ar' ? 'لا يوجد اتصال' : 'You are offline';
  out[lang] = { swReady, controlled, status, showsOfflinePage: body.includes(offlineText), first80: body.replace(/\s+/g, ' ').slice(0, 80) };
  await page.screenshot({ path: `docs/screenshots/pwa-offline-${lang}.png`, fullPage: true });
  await ctx.setOffline(false); await ctx.close();
}
await browser.close();
fs.writeFileSync('docs/pwa-offline-proof.json', JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(`${k}: sw=${v.swReady} controlled=${v.controlled} navStatus=${v.status} showsOfflinePage=${v.showsOfflinePage} | "${v.first80}"`);

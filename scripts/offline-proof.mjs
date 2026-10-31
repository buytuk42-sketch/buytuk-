import { chromium } from 'playwright';
import fs from 'node:fs';
const BASE = process.env.BASE;
const txt = async (u) => await (await fetch(u)).text();
const h1 = (html) => { const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/); return m ? m[1].replace(/<[^>]+>/g,'').trim() : null; };
const offTitle = { ar: h1(await txt(`${BASE}/ar/offline`)), en: h1(await txt(`${BASE}/en/offline`)) };
const out = { offlinePageTitles: offTitle };
const browser = await chromium.launch({ args:['--no-sandbox','--disable-dev-shm-usage'] });
for (const loc of ['ar','en']) {
  const ctx = await browser.newContext({ viewport:{width:390,height:844} });
  const page = await ctx.newPage();
  const r = { swRegistered:false, controlled:false, cachedRevisitStatus:0, cachedRevisitTitle:null,
              uncachedStatus:0, uncachedTitle:null, showsOfflineFallbackPage:false, error:'' };
  const uncachedRoute = loc === 'ar' ? '/ar/academy' : '/en/academy';
  try {
    await page.goto(`${BASE}/${loc}`, { waitUntil:'load' });                 // first visit (caches shell + navigations)
    r.swRegistered = await page.evaluate(async () => { try { await navigator.serviceWorker.ready; return (await navigator.serviceWorker.getRegistrations()).length>0; } catch { return false; } });
    await page.reload({ waitUntil:'load' });
    r.controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
    await ctx.setOffline(true);
    const a = await page.goto(`${BASE}/${loc}`, { waitUntil:'load' }).catch(e => { r.error=String(e).slice(0,110); return null; });
    r.cachedRevisitStatus = a ? a.status() : 0;
    r.cachedRevisitTitle = await page.evaluate(() => document.querySelector('h1')?.textContent?.trim() || null);
    const b = await page.goto(`${BASE}${uncachedRoute}`, { waitUntil:'load' }).catch(() => null);   // never visited -> must fall back
    r.uncachedStatus = b ? b.status() : 0;
    r.uncachedTitle = await page.evaluate(() => document.querySelector('h1')?.textContent?.trim() || null);
    r.showsOfflineFallbackPage = r.uncachedTitle !== null && r.uncachedTitle === offTitle[loc];
    await page.screenshot({ path:`docs/screenshots/pwa-offline-${loc}.png` });
  } catch(e){ r.error=String(e).slice(0,150); }
  out[loc]=r; await ctx.close();
}
await browser.close();
fs.writeFileSync('docs/pwa-offline-proof.json', JSON.stringify(out,null,2));
console.log('  offline page <h1>:', JSON.stringify(offTitle));
for (const k of ['ar','en']) console.log(`  ${k}: ${JSON.stringify(out[k])}`);

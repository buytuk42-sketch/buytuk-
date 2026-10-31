import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--no-sandbox','--disable-dev-shm-usage'] });
async function probe(ctxOpts, url, label) {
  const c = await b.newContext(ctxOpts);
  const p = await c.newPage();
  const hits = [];
  p.on('response', r => { if (r.status() >= 400) hits.push(`${r.status()} ${r.url()}`); });
  p.on('requestfailed', r => hits.push(`NETFAIL ${r.url()} :: ${r.failure()?.errorText}`));
  const res = await p.goto('http://127.0.0.1:3111'+url, { waitUntil:'networkidle', timeout:45000 });
  await p.waitForTimeout(2500);
  console.log(`### ${label} ${url} -> ${res.status()}`);
  const u = [...new Set(hits)];
  console.log(u.length ? '   '+u.join('\n   ') : '   (clean)');
  await c.close();
}
await probe({viewport:{width:1440,height:900}}, '/ar', 'desktop-ar');
await probe({viewport:{width:1440,height:900}}, '/ar#solutions', 'desktop-ar-solutions');
await probe({viewport:{width:390,height:844},reducedMotion:'reduce'}, '/ar', 'mobile-ar-reduced');
await probe({viewport:{width:390,height:844}}, '/ar', 'mobile-ar-normal');
await probe({viewport:{width:1440,height:900}}, '/ar/does-not-exist', 'ar-404');
await probe({viewport:{width:1440,height:900}}, '/en', 'desktop-en');
await b.close();

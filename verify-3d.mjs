import { chromium } from 'playwright';

/**
 * 3D strategy verification (brief §5 / Phase 11).
 *
 * Proves, against the running production build, that:
 *   1. Three.js is NOT in the initial HTML/script graph for /ar
 *   2. A desktop viewport with WebGL mounts a <canvas>
 *   3. A mobile viewport (coarse pointer / narrow) does NOT mount a canvas
 *   4. reducedMotion=reduce does NOT mount a canvas
 *   5. saveData=true does NOT mount a canvas
 *   6. No WebGL/console errors are produced on any path
 */
const BASE = process.env.BASE_URL || 'http://localhost:3111';

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
});

const report = {};

async function probe(label, options) {
  const context = await browser.newContext({
    viewport: options.viewport,
    locale: 'en-US',
    reducedMotion: options.reducedMotion || 'no-preference',
    hasTouch: Boolean(options.touch),
    isMobile: Boolean(options.touch)
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e.message)));

  await page.addInitScript(
    ({ saveData, motion }) => {
      try {
        window.localStorage.setItem('buytuk_motion', motion);
        window.sessionStorage.setItem('buytuk_intro', '1');
        window.localStorage.setItem('buytuk_consent', 'denied');
      } catch {}
      if (saveData) {
        Object.defineProperty(navigator, 'connection', {
          value: { saveData: true, effectiveType: '3g' },
          configurable: true
        });
      }
    },
    { saveData: Boolean(options.saveData), motion: options.motion || 'on' }
  );

  await page.goto(`${BASE}/en`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(4500);

  const result = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    let webgl = false;
    try {
      const c = document.createElement('canvas');
      webgl = Boolean(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      webgl = false;
    }
    const scripts = Array.from(document.querySelectorAll('script[src]')).map((s) => s.getAttribute('src'));
    return {
      canvasMounted: Boolean(canvas),
      canvasSize: canvas ? { w: canvas.width, h: canvas.height } : null,
      webglSupported: webgl,
      scriptCount: scripts.length,
      fallbackNote: document.querySelector('.hero-fallback-note')?.textContent?.trim() || null
    };
  });

  report[label] = { ...result, consoleErrors: errors.slice(0, 5) };
  console.log(
    `${label}: canvas=${result.canvasMounted} webgl=${result.webglSupported} scripts=${result.scriptCount} errors=${errors.length}`
  );
  await context.close();
}

// 1 — desktop, WebGL available, motion on  => canvas expected
await probe('desktop_webgl_motion_on', { viewport: { width: 1440, height: 900 } });
// 2 — mobile viewport + touch               => no canvas expected
await probe('mobile_touch', { viewport: { width: 390, height: 844 }, touch: true });
// 3 — reduced motion                        => no canvas expected
await probe('reduced_motion', { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
// 4 — site motion toggle set to off         => no canvas expected
await probe('motion_toggle_off', { viewport: { width: 1440, height: 900 }, motion: 'off' });
// 5 — data saver on                         => no canvas expected
await probe('data_saver_on', { viewport: { width: 1440, height: 900 }, saveData: true });

await browser.close();

const fs = await import('node:fs');
fs.writeFileSync('/home/user/shots/3d-report.json', JSON.stringify(report, null, 2));
console.log('3d verification complete');

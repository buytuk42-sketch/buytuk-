'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

/**
 * Hero shell (brief §4, §5).
 *
 * The 3D scene is a *separate chunk*, loaded only when all of these hold:
 *   1. the viewport is at least 900px wide (mobile gets the static composition),
 *   2. the device is not reporting a low-end GPU / saving data,
 *   3. the visitor has not reduced motion (OS preference or site toggle),
 *   4. the browser is idle enough to spend main-thread time on WebGL.
 * Until then — and if the chunk fails — the static gradient composition is
 * shown. Both paths are visually intentional; neither is a broken state.
 */
const HeroScene = dynamic(() => import('@/components/three/HeroScene'), {
  ssr: false,
  loading: () => null
});

export default function Hero({ locale, hero }) {
  const [enable3D, setEnable3D] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const canvasHost = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motionOff = document.documentElement.dataset.motion === 'off';
    const wide = window.matchMedia('(min-width: 900px)').matches;

    // Coarse pointer + small screen => phone/tablet: static is the better trade.
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const saveData = navigator.connection?.saveData === true;
    // Probe for WebGL rather than guessing by user agent.
    let webgl = false;
    try {
      const probe = document.createElement('canvas');
      webgl = Boolean(
        probe.getContext('webgl2') || probe.getContext('webgl') || probe.getContext('experimental-webgl')
      );
    } catch {
      webgl = false;
    }

    const shouldLoad = wide && webgl && !reduced && !motionOff && !(coarse && window.innerWidth < 1024) && !saveData;

    if (!shouldLoad) {
      setEnable3D(false);
      return undefined;
    }

    // Defer until the browser is idle so the hero text paints first.
    const start = () => setEnable3D(true);
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(start, { timeout: 2200 });
      return () => window.cancelIdleCallback?.(idleId);
    }
    const timeoutId = window.setTimeout(start, 600);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const isAr = locale === 'ar';

  return (
    <section className="hero" id="hero">
      {/* Static composition: always rendered, and the only layer on light devices. */}
      <div className="hero__static" aria-hidden="true" />
      {enable3D && !sceneFailed && (
        <div className="hero__canvas" ref={canvasHost} aria-hidden="true">
          <HeroScene onError={() => setSceneFailed(true)} />
        </div>
      )}
      <div className="hero__grid-overlay" aria-hidden="true" />
      <div className="hero__vignette" aria-hidden="true" />

      <div className="shell hero__content">
        {/* Logo reveal (brief §3.2) */}
        <div className="logo-reveal row" style={{ gap: 'var(--sp-3)' }}>
          <svg width="46" height="46" viewBox="0 0 40 40" aria-hidden="true">
            <defs>
              <linearGradient id="hero-arc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4ce0ff" />
                <stop offset="50%" stopColor="#6f7bff" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <path d="M6 30 A14 14 0 0 1 34 30" fill="none" stroke="url(#hero-arc)" strokeWidth="3.4" strokeLinecap="round" />
            <circle cx="20" cy="30" r="3.2" fill="url(#hero-arc)" />
          </svg>
          <span className="eyebrow">{hero.eyebrow}</span>
        </div>

        {/* h1 carries the brand statement — the page's single H1 */}
        <h1 className="display hero__title">{hero.statement}</h1>
        <p className="lede hero__sub">{hero.subtitle}</p>

        <div className="row hero__actions">
          <a className="btn btn--primary" href={hero.primaryCta.href}>
            {hero.primaryCta.label}
          </a>
          <a className="btn btn--ghost" href={hero.secondaryCta.href}>
            {hero.secondaryCta.label}
          </a>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>{isAr ? 'مرّر' : 'Scroll'}</span>
        <svg width="14" height="26" viewBox="0 0 14 26" aria-hidden="true">
          <rect x="1" y="1" width="12" height="20" rx="6" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="7" cy="7" r="1.6" fill="currentColor" />
        </svg>
      </div>

      {!enable3D && (
        <p className="hero-fallback-note">
          {isAr
            ? 'عرض ثابت — تم تعطيل المجسّم ثلاثي الأبعاد لهذا الجهاز أو التزامًا بتقليل الحركة.'
            : 'Static rendering — 3D disabled for this device or motion preference.'}
        </p>
      )}
      <span className="sr-only">{hero.statement}</span>
    </section>
  );
}

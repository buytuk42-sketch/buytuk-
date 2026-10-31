'use client';

import { useEffect, useState } from 'react';

/**
 * Cinematic opening (brief §3.1 + §3.2).
 *
 * A single, skippable brand beat that plays once per session: the BuyTuk arc
 * draws, the wordmark resolves, the veil lifts. It is entirely skipped for
 * reduced-motion visitors and for anyone who has the site's motion toggle off,
 * and it can be dismissed with any key, click or tap.
 */
export default function CinematicOpening({ locale = 'ar' }) {
  const [state, setState] = useState('idle');

  useEffect(() => {
    const reduce =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'off';
    let played = null;
    try {
      played = window.sessionStorage.getItem('buytuk_intro');
    } catch {
      played = null;
    }

    if (reduce || played === '1') {
      setState('done');
      return undefined;
    }

    setState('playing');
    try {
      window.sessionStorage.setItem('buytuk_intro', '1');
    } catch {
      /* ignore */
    }

    const finish = () => setState('out');
    const timer = window.setTimeout(finish, 2100);
    const skip = () => setState('out');
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('pointerdown', skip, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, []);

  useEffect(() => {
    if (state !== 'out') return undefined;
    const timer = window.setTimeout(() => setState('done'), 700);
    return () => window.clearTimeout(timer);
  }, [state]);

  if (state === 'idle' || state === 'done') return null;

  const isAr = locale === 'ar';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'grid',
        placeItems: 'center',
        background: 'radial-gradient(80% 60% at 50% 45%, #0b1120 0%, #04070f 70%)',
        opacity: state === 'out' ? 0 : 1,
        transition: 'opacity 620ms cubic-bezier(0.22,1,0.36,1)',
        pointerEvents: state === 'out' ? 'none' : 'auto'
      }}
    >
      <div className="logo-reveal" style={{ display: 'grid', justifyItems: 'center', gap: 18 }}>
        <svg width="108" height="108" viewBox="0 0 40 40">
          <defs>
            <linearGradient id="intro-arc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4ce0ff" />
              <stop offset="50%" stopColor="#6f7bff" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <path
            className="arc"
            d="M6 30 A14 14 0 0 1 34 30"
            fill="none"
            stroke="url(#intro-arc)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray="260"
          />
          <circle cx="20" cy="30" r="2.6" fill="url(#intro-arc)" />
        </svg>
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '1.6rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#f2f6ff'
          }}
        >
          BuyTuk
        </span>
        <span className="eyebrow" style={{ marginTop: 4 }}>
          {isAr ? 'نبني ما يأتي بعد ذلك' : 'We Build What Comes Next'}
        </span>
      </div>
    </div>
  );
}

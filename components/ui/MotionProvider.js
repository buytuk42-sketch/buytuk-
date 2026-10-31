'use client';

import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';

/**
 * Exposes a user-controlled motion toggle (brief §7: "with Reduced Motion
 * available"). It respects the OS preference on first load and then lets the
 * visitor override it. The choice is stored in localStorage and reflected on
 * <html data-motion>, which the CSS keys off.
 */
export default function MotionProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (() => {
      try {
        return window.localStorage.getItem('buytuk_motion');
      } catch {
        return null;
      }
    })();
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mode = stored || (prefersReduced ? 'off' : 'on');
    document.documentElement.dataset.motion = mode;
    setMounted(true);

    const onToggle = (event) => {
      const next = event.detail;
      document.documentElement.dataset.motion = next;
      try {
        window.localStorage.setItem('buytuk_motion', next);
      } catch {
        /* ignore */
      }
      track('motion_preference', { mode: next });
    };

    window.addEventListener('buytuk:motion', onToggle);
    return () => window.removeEventListener('buytuk:motion', onToggle);
  }, []);

  useEffect(() => {
    if (mounted) track('motion_preference', { mode: document.documentElement.dataset.motion });
  }, [mounted]);

  return null;
}

export function toggleMotion() {
  const current = document.documentElement.dataset.motion;
  const next = current === 'off' ? 'on' : 'off';
  window.dispatchEvent(new CustomEvent('buytuk:motion', { detail: next }));
  return next;
}

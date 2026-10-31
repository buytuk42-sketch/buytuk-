'use client';

import { useEffect } from 'react';
import { initAnalytics, track } from '@/lib/analytics';

/**
 * Emits page_view and scroll_depth, consent-gated (brief §18).
 * Scroll depth is reported at 25/50/75/100 % thresholds, once each.
 */
export default function AnalyticsProvider() {
  useEffect(() => {
    initAnalytics();
    track('page_view', { path: window.location.pathname });

    const fired = new Set();
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = Math.round((window.scrollY / max) * 100);
      [25, 50, 75, 100].forEach((mark) => {
        if (pct >= mark && !fired.has(mark)) {
          fired.add(mark);
          track('scroll_depth', { depth: mark });
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return null;
}

'use client';

import { useEffect, useState } from 'react';
import { toggleMotion } from '@/components/ui/MotionProvider';

/**
 * Motion toggle (brief §7). Renders a stable label on the server and syncs to
 * the stored preference after mount, so there is no hydration mismatch.
 */
export default function MotionToggle({ locale = 'ar' }) {
  const [mode, setMode] = useState('on');

  useEffect(() => {
    setMode(document.documentElement.dataset.motion || 'on');
    const onSync = (event) => setMode(event.detail);
    window.addEventListener('buytuk:motion', onSync);
    return () => window.removeEventListener('buytuk:motion', onSync);
  }, []);

  const isAr = locale === 'ar';
  const label = mode === 'off' ? (isAr ? 'الحركة مُقلّلة' : 'Motion reduced') : isAr ? 'الحركة مُفعّلة' : 'Motion on';

  return (
    <button
      type="button"
      className="btn btn--quiet"
      onClick={() => setMode(toggleMotion())}
      aria-pressed={mode === 'off'}
      title={isAr ? 'تبديل الحركة' : 'Toggle motion'}
    >
      <span aria-hidden="true">{mode === 'off' ? '◌' : '◉'}</span>
      <span>{label}</span>
    </button>
  );
}

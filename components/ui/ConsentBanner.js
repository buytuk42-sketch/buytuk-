'use client';

import { useEffect, useState } from 'react';
import { getConsent, setConsent } from '@/lib/analytics';

/**
 * Privacy-first consent gate (brief §18). No analytics request is made until
 * the visitor chooses. On load it replays the stored decision.
 */
export default function ConsentBanner({ locale = 'ar' }) {
  const [state, setState] = useState('hidden');

  useEffect(() => {
    const stored = getConsent();
    if (stored) {
      setConsent(stored);
      setState('hidden');
    } else {
      setState('open');
    }
  }, []);

  if (state !== 'open') return null;

  const copy =
    locale === 'ar'
      ? {
          title: 'الموافقة على التحليلات',
          body: 'نرغب في قياس مشاهدات الصفحات والمنتجات ونقرات الإجراءات وعمق التمرير لتحسين هذا الموقع. لا يُجمع أي شيء قبل موافقتك.',
          accept: 'السماح بالتحليلات',
          decline: 'رفض',
          policy: 'خصوصية أولًا: معرّف جلسة عشوائي، بلا بيانات شخصية، وبلا تتبّع بين المواقع.'
        }
      : {
          title: 'Analytics consent',
          body: 'We would like to measure page views, product views, CTA clicks and scroll depth to improve this site. Nothing is collected before you agree.',
          accept: 'Allow analytics',
          decline: 'Decline',
          policy: 'Privacy-first: a random session id, no personal data, no cross-site tracking.'
        };

  const decide = (value) => {
    setConsent(value);
    setState('hidden');
  };

  return (
    <div className="consent" role="region" aria-label={copy.title}>
      <div style={{ flex: '1 1 320px' }}>
        <strong style={{ color: 'var(--text-hi)', display: 'block', marginBottom: 4 }}>{copy.title}</strong>
        <span>{copy.body}</span>
        <div className="hint" style={{ marginTop: 6 }}>{copy.policy}</div>
      </div>
      <div className="row">
        <button type="button" className="btn btn--primary" onClick={() => decide('granted')}>
          {copy.accept}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => decide('denied')}>
          {copy.decline}
        </button>
      </div>
    </div>
  );
}

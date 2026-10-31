import { PRODUCT_STATUSES } from '@/lib/site';

const AR = {
  live: 'مباشر',
  'in-development': 'قيد التطوير',
  research: 'بحثي',
  'coming-soon': 'قريبًا'
};

const EN = {
  live: 'Live',
  'in-development': 'In Development',
  research: 'Research',
  'coming-soon': 'Coming Soon'
};

/** Status chip — the visual record of a product's real lifecycle state (§8). */
export default function StatusChip({ status, locale = 'ar', verified = false }) {
  const safe = PRODUCT_STATUSES.includes(status) ? status : 'coming-soon';
  const label = (locale === 'ar' ? AR : EN)[safe];
  return (
    <span className={`chip chip--${safe}`}>
      <span className="chip__dot" aria-hidden="true" />
      <span>{label}</span>
      {!verified && <span aria-hidden="true">·</span>}
      {!verified && <span title={locale === 'ar' ? 'بانتظار التوثيق' : 'Pending documentation'}>
        {locale === 'ar' ? 'معلّق' : 'pending'}
      </span>}
    </span>
  );
}

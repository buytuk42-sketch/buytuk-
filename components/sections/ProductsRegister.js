import Reveal from '@/components/ui/Reveal';
import StatusChip from '@/components/ui/StatusChip';
import { LocalizedLink } from '@/components/ui/LocalizedLink';

/**
 * Product register (brief §8). Used by both the homepage section and /products
 * so the two can never drift. Every field the brief requires is present, and
 * any record without `verified: true` is visibly marked as pending.
 */
const claimLabelAr = { product: 'منتج', platform: 'منصة', capability: 'قدرة', solution: 'حل' };
const claimLabelEn = { product: 'Product', platform: 'Platform', capability: 'Capability', solution: 'Solution' };
const claimChip = {
  product: 'chip--live',
  platform: 'chip--live',
  capability: 'chip--research',
  solution: 'chip--coming-soon'
};

export default function ProductsRegister({ locale, t, products, limit, headingLevel = 3 }) {
  const isAr = locale === 'ar';
  // Heading level is a prop so /products gets h1->h2->h3 while the homepage
  // section keeps h2->h3->h4. Never a fixed tag that breaks the outline.
  const H = `h${Math.min(6, Math.max(2, headingLevel))}`;
  const Sub = `h${Math.min(6, Math.max(2, headingLevel) + 1)}`;
  const rows = typeof limit === 'number' ? products.slice(0, limit) : products;
  const isCapability = (claim) => claim === 'capability' || claim === 'solution';

  if (!rows.length) {
    return (
      <div className="notice">
        {t('products.empty')}
      </div>
    );
  }

  return (
    <div className="grid grid--2">
      {rows.map((product, index) => (
        <Reveal key={product.slug} className="card card--feature" delay={index * 60}>
          <div className="row row--between" style={{ marginBottom: 'var(--sp-4)' }}>
            {isCapability ? (
              <span className="chip chip--research">
                <span className="chip__dot" aria-hidden="true" />
                {isAr ? 'قدرة رقمية' : 'Digital capability'}
              </span>
            ) : (
              <StatusChip status={product.status} locale={locale} verified={product.verified} />
            )}
            <span className="row" style={{ gap: 6 }}>
              <span className={`chip ${claimChip[product.claim] || 'chip--soon'}`}>
                {isAr ? claimLabelAr[product.claim] : claimLabelEn[product.claim]}
              </span>
              {product.category && <span className="chip">{product.category}</span>}
            </span>
          </div>

          <H className="h3" style={{ marginBottom: 'var(--sp-2)' }}>{product.name}</H>
          {product.tagline && (
            <p className="mono" style={{ fontSize: 'var(--fs-sm)', color: 'var(--arc-1)', marginBottom: 'var(--sp-3)' }}>
              {product.tagline}
            </p>
          )}
          <p style={{ fontSize: 'var(--fs-sm)' }}>{product.description}</p>

          {product.problem && (
            <div style={{ marginTop: 'var(--sp-4)' }}>
              <Sub style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-lo)' }}>
                {t('products.problem')}
              </Sub>
              <p style={{ fontSize: 'var(--fs-sm)', marginTop: 6 }}>{product.problem}</p>
            </div>
          )}

          {product.features?.length > 0 && (
            <div style={{ marginTop: 'var(--sp-4)' }}>
              <Sub style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-lo)' }}>
                {t('products.features')}
              </Sub>
              <ul className="stack stack--sm" style={{ marginTop: 8 }}>
                {product.features.map((feature) => (
                  <li key={feature} style={{ fontSize: 'var(--fs-sm)', display: 'flex', gap: 8 }}>
                    <span aria-hidden="true" style={{ color: 'var(--arc-1)' }}>—</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.technology?.length > 0 && (
            <div style={{ marginTop: 'var(--sp-4)' }}>
              <Sub style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-lo)' }}>
                {t('products.technology')}
              </Sub>
              <div className="row" style={{ marginTop: 8 }}>
                {product.technology.map((tech) => (
                  <span className="chip" key={tech}>{tech}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 'var(--sp-4)' }}>
            <Sub style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-lo)' }}>
              {t('products.screenshots')}
            </Sub>
            {product.screenshots?.length > 0 ? (
              <div className="grid grid--3" style={{ marginTop: 8 }}>
                {product.screenshots.map((shot) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={shot} src={shot} alt="" width="320" height="200" loading="lazy" style={{ borderRadius: 'var(--r-sm)' }} />
                ))}
              </div>
            ) : (
              <p className="hint" style={{ marginTop: 6 }}>{t('products.noScreenshots')}</p>
            )}
          </div>

          <div style={{ marginTop: 'var(--sp-4)' }}>
            <h3 style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-lo)' }}>
              {t('products.caseStudy')}
            </h3>
            {product.caseStudy ? (
              <p style={{ fontSize: 'var(--fs-sm)', marginTop: 6 }}>{product.caseStudy.summary}</p>
            ) : (
              <p className="hint" style={{ marginTop: 6 }}>{t('products.noCaseStudy')}</p>
            )}
          </div>

          <div className="row" style={{ marginTop: 'var(--sp-5)' }}>
            {/* The specific offer is the primary action; detail is secondary.
                Never a generic "Learn More" (brief §7). */}
            {product.cta && (
              <LocalizedLink locale={locale} className="btn btn--primary" href={product.cta.href}>
                {product.cta.label}
              </LocalizedLink>
            )}
            <LocalizedLink locale={locale} href={`/products/${product.slug}`} className="btn btn--ghost">
              {t('labels.viewProduct')}
            </LocalizedLink>
          </div>

          <p className="hint" style={{ marginTop: 'var(--sp-4)', color: product.verified ? 'var(--text-lo)' : 'var(--signal)' }}>
            {isCapability(product.claim)
              ? (isAr
                  ? 'قدرة/حل رقمي — ليس مشروعًا منفّذًا ولا مرجع عميل.'
                  : 'Digital capability/solution — not a delivered project or client reference.')
              : product.verified
                ? (isAr ? 'مُوثّق' : 'Verified')
                : (isAr ? 'محتوى مؤقت — بانتظار توثيق العميل' : 'Placeholder content — awaiting client documentation')}
          </p>
        </Reveal>
      ))}
    </div>
  );
}

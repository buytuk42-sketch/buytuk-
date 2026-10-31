import Reveal from '@/components/ui/Reveal';
import { LocalizedLink } from '@/components/ui/LocalizedLink';

/* ---------------------------------------------------------------------------
   Identity layers added for the identity pass (brief §2, §3, §7).
   These read the SAME product register as the Products section, so the counts
   shown are real published rows and cannot be inflated by copy alone.
   --------------------------------------------------------------------------- */

/**
 * "What does BuyTuk build?" — the four classes the brief requires to stay
 * separate: Products, Platforms, Solutions, Capabilities.
 */
export function CapabilitiesSection({ locale, t, products }) {
  const groups = t('capabilities.groups') || [];
  const register = Array.isArray(products) ? products : [];
  const count = (claim) => register.filter((p) => p.claim === claim).length;
  const counts = {
    products: count('product') + count('platform'),
    platforms: count('platform') + count('product'),
    solutions: count('solution'),
    capabilities: count('capability'),
    // Services are requestable offers rather than register rows, so their count
    // comes from the published service list itself.
    services: (Array.isArray(groups) ? groups.find((g) => g.key === 'services')?.items?.length : 0) || 0
  };

  return (
    <section className="section section--veil" id="capabilities">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('capabilities.eyebrow')}</span>
          <h2 className="h2">{t('capabilities.title')}</h2>
          <p className="lede">{t('capabilities.body')}</p>
        </Reveal>

        <div className="grid grid--2">
          {Array.isArray(groups) &&
            groups.map((group, index) => (
              <Reveal key={group.key} className="card card--feature" delay={index * 50}>
                <div className="row row--between" style={{ marginBottom: 'var(--sp-3)' }}>
                  <h3 className="h3" style={{ margin: 0 }}>{group.title}</h3>
                  <span className="chip mono">{counts[group.key] ?? 0}</span>
                </div>
                <p style={{ fontSize: 'var(--fs-sm)' }}>{group.body}</p>
                <ul className="stack stack--sm">
                  {Array.isArray(group.items) &&
                    group.items.map((item) => (
                      <li key={item} style={{ fontSize: 'var(--fs-sm)', display: 'flex', gap: 8 }}>
                        <span aria-hidden="true" style={{ color: 'var(--arc-1)' }}>—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                </ul>
              </Reveal>
            ))}
        </div>

        <Reveal className="notice" style={{ marginTop: 'var(--sp-6)' }}>
          <strong style={{ color: 'var(--text-hi)' }}>{t('capabilities.registerTitle')}</strong>
          <br />
          {t('capabilities.registerNote')}
        </Reveal>

        <Reveal style={{ marginTop: 'var(--sp-6)' }}>
          <LocalizedLink locale={locale} href="/products" className="btn btn--ghost">
            {t('nav.products')}
          </LocalizedLink>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Digital solutions & capabilities (brief §7): what BuyTuk can build.
 * Wording is capability wording ("we build…"), never "we built for X".
 */
export function SolutionsSection({ locale, t }) {
  const items = t('solutions.items') || [];
  return (
    <section className="section" id="solutions">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('solutions.eyebrow')}</span>
          <h2 className="h2">{t('solutions.title')}</h2>
          <p className="lede">{t('solutions.body')}</p>
        </Reveal>

        <div className="grid grid--4">
          {Array.isArray(items) &&
            items.map((item, index) => (
              <Reveal key={item.title} className="card" delay={index * 30}>
                <h3 className="h3 mono" style={{ fontSize: 'var(--fs-md)', marginBottom: 'var(--sp-2)' }}>{item.title}</h3>
                <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>{item.body}</p>
              </Reveal>
            ))}
        </div>

        <Reveal className="notice" style={{ marginTop: 'var(--sp-6)' }}>{t('solutions.note')}</Reveal>

        <Reveal style={{ marginTop: 'var(--sp-6)' }}>
          <LocalizedLink locale={locale} href="#contact" className="btn btn--primary">
            {t('solutions.cta')}
          </LocalizedLink>
        </Reveal>
      </div>
    </section>
  );
}

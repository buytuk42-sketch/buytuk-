import Reveal from '@/components/ui/Reveal';
import { LocalizedLink } from '@/components/ui/LocalizedLink';

function LegalPreview({ item }) {
  return (
    <div className="showcase-preview showcase-preview--legal">
      <div className="preview-legal__nav">
        <span className="preview-legal__seal">{item.mark}</span>
        <strong>{item.title}</strong>
        <span>{item.services[0]}　{item.services[1]}　{item.services[2]}</span>
      </div>
      <div className="preview-legal__body">
        <span className="preview-legal__overline">{item.category}</span>
        <div className="preview-legal__title">{item.heading}</div>
        <p>{item.body}</p>
        <span className="preview-legal__action">{item.action} <b>↗</b></span>
      </div>
      <div className="preview-legal__rule" />
    </div>
  );
}

function ClinicPreview({ item }) {
  return (
    <div className="showcase-preview showcase-preview--clinic">
      <div className="preview-clinic__nav">
        <span className="preview-clinic__logo">+</span>
        <strong>{item.title}</strong>
        <span>{item.services[0]}　{item.services[1]}　{item.services[2]}</span>
      </div>
      <div className="preview-clinic__body">
        <div className="preview-clinic__copy">
          <span className="preview-clinic__overline">{item.category}</span>
          <div className="preview-clinic__title">{item.heading}</div>
          <p>{item.body}</p>
          <span className="preview-clinic__action">{item.action} <b>←</b></span>
        </div>
        <div className="preview-clinic__card">
          <span className="preview-clinic__avatar">+</span>
          <strong>{item.services[1]}</strong>
          <span>{item.services[0]}</span>
          <span className="preview-clinic__slots"><i /><i /><i /></span>
        </div>
      </div>
    </div>
  );
}

function MarketPreview({ item }) {
  return (
    <div className="showcase-preview showcase-preview--market">
      <div className="preview-market__top">
        <strong>{item.title}</strong>
        <span>{item.action}　⌕　▱</span>
      </div>
      <div className="preview-market__search">⌕　{item.body}</div>
      <div className="preview-market__categories">
        {item.services.map((service, index) => <span className={index === 0 ? 'is-selected' : ''} key={service}>{service}</span>)}
      </div>
      <div className="preview-market__banner">
        <div><small>{item.category}</small><strong className="preview-market__title">{item.heading}</strong></div>
        <span className="preview-market__basket">▤</span>
      </div>
      <div className="preview-market__products">
        {item.services.map((service, index) => <span key={service}><i className={`preview-market__produce preview-market__produce--${index + 1}`} />{service}</span>)}
      </div>
    </div>
  );
}

function StorePreview({ item }) {
  return (
    <div className="showcase-preview showcase-preview--store">
      <div className="preview-store__nav">
        <span>{item.services[0]}　{item.services[1]}</span>
        <strong>{item.title}</strong>
        <span>⌕　♡　▱</span>
      </div>
      <div className="preview-store__body">
        <div className="preview-store__copy">
          <small>{item.category}</small>
          <div className="preview-store__title">{item.heading}</div>
          <p>{item.body}</p>
          <span>{item.action}　→</span>
        </div>
        <div className="preview-store__art"><i /><b /><span>BT / STUDIO</span></div>
      </div>
    </div>
  );
}

function CafePreview({ item }) {
  return (
    <div className="showcase-preview showcase-preview--cafe">
      <div className="preview-cafe__nav">
        <span className="preview-cafe__stamp">C</span>
        <strong>{item.title}</strong>
        <span>{item.services[0]}　{item.services[1]}　{item.services[2]}</span>
      </div>
      <div className="preview-cafe__body">
        <div>
          <small>{item.category}</small>
          <div className="preview-cafe__title">{item.heading}</div>
          <p>{item.body}</p>
          <span className="preview-cafe__action">{item.action}　↗</span>
        </div>
        <div className="preview-cafe__cup"><i /><b /></div>
      </div>
      <div className="preview-cafe__footer">{item.services.join('　·　')}</div>
    </div>
  );
}

function PropertyPreview({ item }) {
  return (
    <div className="showcase-preview showcase-preview--property">
      <div className="preview-property__nav">
        <strong>{item.title}</strong>
        <span>{item.services[0]}　{item.services[1]}　{item.services[2]}</span>
        <span className="preview-property__contact">{item.action}</span>
      </div>
      <div className="preview-property__body">
        <div className="preview-property__copy">
          <small>{item.category}</small>
          <div className="preview-property__title">{item.heading}</div>
          <p>{item.body}</p>
          <span>⌕　{item.services[0]}　⌄</span>
        </div>
        <div className="preview-property__building">
          <div className="preview-property__skyline"><i /><i /><i /></div>
          <div className="preview-property__house"><i /><i /><i /><i /><b /></div>
          <div className="preview-property__ground" />
        </div>
      </div>
    </div>
  );
}

const previews = {
  legal: LegalPreview,
  clinic: ClinicPreview,
  market: MarketPreview,
  store: StorePreview,
  cafe: CafePreview,
  property: PropertyPreview
};

export default function ServiceShowcase({ locale, t }) {
  const items = t('showcase.examples') || [];

  return (
    <main id="main">
      <section className="section showcase-page">
        <div className="shell">
          <Reveal className="showcase-intro">
            <span className="eyebrow">{t('showcase.eyebrow')}</span>
            <h1 className="display showcase-intro__title">{t('showcase.title')}</h1>
            <p className="lede">{t('showcase.body')}</p>
            <div className="showcase-note">
              <span className="showcase-note__mark">i</span>
              <p>{t('showcase.note')}</p>
            </div>
          </Reveal>

          <div className="showcase-grid">
            {items.map((item, index) => {
              const Preview = previews[item.type];
              return (
                <Reveal key={item.type} className={`showcase-card showcase-card--${item.type}`} delay={index * 35}>
                  <div className="showcase-card__meta">
                    <span className="showcase-card__category">{item.category}</span>
                    <span className="showcase-card__concept">{t('showcase.concept')}</span>
                  </div>
                  <div className={`showcase-card__screen showcase-card__screen--${item.type}`} aria-hidden="true">
                    <Preview item={item} />
                  </div>
                  <div className="showcase-card__content">
                    <span className="showcase-card__number">{String(index + 1).padStart(2, '0')}</span>
                    <h2>{item.title}</h2>
                    <p>{item.summary}</p>
                    <LocalizedLink locale={locale} href="/#contact" className="showcase-card__link">
                      {t('showcase.discuss')} <span aria-hidden="true">↗</span>
                    </LocalizedLink>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="showcase-bottom">
            <div>
              <span className="eyebrow">{t('showcase.bottomEyebrow')}</span>
              <h2>{t('showcase.bottomTitle')}</h2>
              <p>{t('showcase.bottomBody')}</p>
            </div>
            <LocalizedLink locale={locale} href="/#contact" className="btn btn--primary">
              {t('showcase.bottomCta')}
            </LocalizedLink>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

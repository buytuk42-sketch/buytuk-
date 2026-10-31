import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import StatusChip from '@/components/ui/StatusChip';
import { LocalizedLink } from '@/components/ui/LocalizedLink';
import { getProduct, getProducts } from '@/lib/cms';
import { getTranslator } from '@/lib/i18n';
import { buildMetadata, breadcrumbJsonLd, softwareJsonLd } from '@/lib/seo';
import { LOCAL_CONTENT } from '@/lib/cms';

export async function generateStaticParams() {
  const products = LOCAL_CONTENT.products || [];
  return products.flatMap((product) =>
    ['ar', 'en'].map((locale) => ({ locale, slug: product.slug }))
  );
}

export async function generateMetadata({ params }) {
  const { locale, slug } = params;
  const product = await getProduct(slug, locale);
  if (!product) return buildMetadata({ locale, path: `/products/${slug}`, title: 'BuyTuk', description: '' });
  return buildMetadata({
    locale,
    path: `/products/${slug}`,
    title: `${product.name} — BuyTuk`,
    description: product.tagline || product.description
  });
}

export default async function ProductDetail({ params }) {
  const { locale, slug } = params;
  const t = getTranslator(locale);
  const product = await getProduct(slug, locale);

  if (!product) {
    return (
      <>
        <Header locale={locale} path={`/products/${slug}`} />
        <main id="main" className="section" style={{ minHeight: '60svh' }}>
          <div className="shell stack">
            <span className="eyebrow mono">404</span>
            <h1 className="h1">{t('labels.notFound')}</h1>
            <p className="lede">{t('labels.notFoundBody')}</p>
            <LocalizedLink locale={locale} href="/products" className="btn btn--primary">
              {t('nav.products')}
            </LocalizedLink>
          </div>
        </main>
        <Footer locale={locale} />
      </>
    );
  }

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: 'BuyTuk', path: '/' },
    { name: t('nav.products'), path: '/products' },
    { name: product.name, path: `/products/${product.slug}` }
  ]);
  const software = softwareJsonLd(locale, product);

  return (
    <>
      <Header locale={locale} path={`/products/${slug}`} />
      <main id="main">
        <section className="section" style={{ paddingTop: 'var(--sp-8)' }}>
          <div className="shell">
            <nav aria-label="Breadcrumb" className="hint" style={{ marginBottom: 'var(--sp-4)' }}>
              <LocalizedLink locale={locale} href="/">BuyTuk</LocalizedLink>
              <span aria-hidden="true"> / </span>
              <LocalizedLink locale={locale} href="/products">{t('nav.products')}</LocalizedLink>
              <span aria-hidden="true"> / </span>
              <span>{product.name}</span>
            </nav>

            <Reveal className="stack">
              <div className="row">
                <StatusChip status={product.status} locale={locale} verified={product.verified} />
                {product.category && <span className="chip">{product.category}</span>}
                {product.updatedAt && (
                  <span className="chip">{t('labels.updated')}: {product.updatedAt}</span>
                )}
              </div>
              <h1 className="h1">{product.name}</h1>
              {product.tagline && <p className="mono" style={{ color: 'var(--arc-1)', margin: 0 }}>{product.tagline}</p>}
              <p className="lede">{product.description}</p>
            </Reveal>

            {!product.verified && (
              <Reveal className="notice" style={{ marginTop: 'var(--sp-6)' }}>
                {t('labels.pendingNotice')}
              </Reveal>
            )}

            <div className="grid grid--2" style={{ marginTop: 'var(--sp-7)', alignItems: 'start' }}>
              <Reveal className="stack">
                <div className="card">
                  <h2 className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{t('products.problem')}</h2>
                  <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>{product.problem}</p>
                </div>
                <div className="card">
                  <h2 className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{t('products.features')}</h2>
                  {product.features?.length ? (
                    <ul className="stack stack--sm">
                      {product.features.map((feature) => (
                        <li key={feature} style={{ fontSize: 'var(--fs-sm)', display: 'flex', gap: 8 }}>
                          <span aria-hidden="true" style={{ color: 'var(--arc-1)' }}>—</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="hint" style={{ margin: 0 }}>{t('labels.comingSoonBody')}</p>
                  )}
                </div>
              </Reveal>

              <Reveal className="stack" delay={60}>
                <div className="card">
                  <h2 className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{t('products.technology')}</h2>
                  <div className="row">
                    {product.technology?.length ? (
                      product.technology.map((tech) => <span className="chip" key={tech}>{tech}</span>)
                    ) : (
                      <span className="hint">{t('labels.comingSoonBody')}</span>
                    )}
                  </div>
                </div>
                <div className="card">
                  <h2 className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{t('products.caseStudy')}</h2>
                  <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>
                    {product.caseStudy?.summary || t('products.noCaseStudy')}
                  </p>
                </div>
                <div className="card">
                  <h2 className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{t('products.screenshots')}</h2>
                  {product.screenshots?.length ? (
                    <div className="grid grid--2">
                      {product.screenshots.map((shot) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img key={shot} src={shot} alt="" width="320" height="200" loading="lazy" style={{ borderRadius: 'var(--r-sm)' }} />
                      ))}
                    </div>
                  ) : (
                    <p className="hint" style={{ margin: 0 }}>{t('products.noScreenshots')}</p>
                  )}
                </div>
                {product.evidence?.length > 0 && (
                  <div className="card">
                    <h2 className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{t('labels.evidence')}</h2>
                    <ul className="stack stack--sm">
                      {product.evidence.map((item) => (
                        <li key={item.url} style={{ fontSize: 'var(--fs-sm)' }}>
                          <a href={item.url} rel="noopener noreferrer nofollow" target="_blank" style={{ color: 'var(--arc-1)' }}>
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {product.cta && (
                  <LocalizedLink locale={locale} className="btn btn--primary" href={product.cta.href}>
                    {product.cta.label}
                  </LocalizedLink>
                )}
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }} />
    </>
  );
}

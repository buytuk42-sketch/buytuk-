import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductsRegister from '@/components/sections/ProductsRegister';
import Reveal from '@/components/ui/Reveal';
import { getProducts } from '@/lib/cms';
import { getTranslator } from '@/lib/i18n';
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = params;
  const t = getTranslator(locale);
  return buildMetadata({
    locale,
    path: '/products',
    title: `${t('products.title')} — BuyTuk`,
    description: t('products.body')
  });
}

export default async function ProductsIndex({ params }) {
  const { locale } = params;
  const t = getTranslator(locale);
  const products = await getProducts(locale);

  const jsonLd = breadcrumbJsonLd(locale, [
    { name: 'BuyTuk', path: '/' },
    { name: t('nav.products'), path: '/products' }
  ]);

  return (
    <>
      <Header locale={locale} path="/products" />
      <main id="main">
        <section className="section" style={{ paddingTop: 'var(--sp-8)' }}>
          <div className="shell">
            <Reveal className="section-head">
              <span className="eyebrow">{t('products.eyebrow')}</span>
              <h1 className="h2">{t('products.title')}</h1>
              <p className="lede">{t('products.body')}</p>
            </Reveal>
            <ProductsRegister locale={locale} t={t} products={products} headingLevel={2} />
          </div>
        </section>
      </main>
      <Footer locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServiceShowcase from '@/components/sections/ServiceShowcase';
import { getTranslator } from '@/lib/i18n';
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = getTranslator(locale);
  return buildMetadata({
    locale,
    path: '/services',
    title: `${t('showcase.title')} — BuyTuk`,
    description: t('showcase.metaDescription')
  });
}

export default async function ServicesPage({ params }) {
  const { locale } = await params;
  const t = getTranslator(locale);

  const jsonLd = breadcrumbJsonLd(locale, [
    { name: 'BuyTuk', path: '/' },
    { name: t('nav.services'), path: '/services' }
  ]);

  return (
    <>
      <Header locale={locale} path="/services" />
      <ServiceShowcase locale={locale} t={t} />
      <Footer locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

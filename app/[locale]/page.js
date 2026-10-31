import { getTranslator } from '@/lib/i18n';
import { getHeroContent } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo';
import AllSections from '@/components/sections/AllSections';

/**
 * Homepage metadata. This is what emits canonical, hreflang alternates and the
 * Open Graph/Twitter tags for /ar and /en — without it the locale roots ship
 * with no canonical at all.
 */
export async function generateMetadata({ params }) {
  const { locale } = params;
  const t = getTranslator(locale);
  return buildMetadata({
    locale,
    path: '',
    title: t('meta.title'),
    description: t('meta.description')
  });
}

export default async function Home({ params }) {
  const { locale } = params;
  const t = getTranslator(locale);
  const hero = await getHeroContent(locale);

  return <AllSections locale={locale} t={t} hero={hero} />;
}

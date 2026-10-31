import { SITE_URL, LOCALES, ROUTES } from '@/lib/site';
import { getProducts } from '@/lib/cms';

export const revalidate = 300;

/**
 * Sitemap with hreflang alternates for every route and locale (brief §15).
 * Product detail pages are included from the content layer so newly published
 * products are discoverable without touching this file.
 */
export default async function sitemap() {
  const now = new Date();

  const staticEntries = LOCALES.flatMap((locale) =>
    ROUTES.map((route) => {
      const path = `/${locale}${route}`;
      return {
        url: `${SITE_URL}${path}`,
        lastModified: now,
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${route}`]))
        }
      };
    })
  );

  const products = await getProducts();
  const productSlugs = [...new Set(products.map((product) => product.slug).filter(Boolean))];
  const productEntries = LOCALES.flatMap((locale) =>
    productSlugs.map((slug) => ({
      url: `${SITE_URL}/${locale}/products/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/products/${slug}`]))
      }
    }))
  );

  return [...staticEntries, ...productEntries];
}

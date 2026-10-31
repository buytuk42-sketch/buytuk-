import { SITE_URL, absoluteUrl, alternateLanguages } from '@/lib/site';

// ---------------------------------------------------------------------------
// SEO helpers (brief §15). Canonical + hreflang + Open Graph + JSON-LD are all
// produced here so every page inherits exactly one consistent implementation.
// ---------------------------------------------------------------------------

// Real PNG social card rendered from the brand tokens by `node og.mjs`.
const DEFAULT_OG_IMAGE = '/og/buytuk-og.png';

export function buildMetadata({ locale, path = '', title, description, image = DEFAULT_OG_IMAGE }) {
  return {
    title,
    description,
    manifest: '/manifest.webmanifest',
    alternates: {
      canonical: absoluteUrl(locale, path),
      languages: alternateLanguages(path)
    },
    openGraph: {
      type: 'website',
      siteName: 'BuyTuk',
      title,
      description,
      url: absoluteUrl(locale, path),
      images: [{ url: `${SITE_URL}${image}`, width: 1200, height: 630, alt: 'BuyTuk' }]
    },
    twitter: { card: 'summary_large_image', title, description }
  };
}

export function organizationJsonLd(locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BuyTuk',
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description:
      locale === 'ar'
        ? 'BuyTuk شركة تقنية تبني منظومة منتجات وتقنيات وتجارب رقمية.'
        : 'BuyTuk is a technology company building a portfolio of digital products, platforms and experiences.',
    // Deliberately no address/telephone/socials until the client confirms them.
    sameAs: []
  };
}

export function webSiteJsonLd(locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BuyTuk',
    url: SITE_URL,
    inLanguage: locale === 'ar' ? 'ar' : 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/${locale}/search?q={query}`,
      'query-input': 'required name=query'
    }
  };
}

export function breadcrumbJsonLd(locale, trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(locale, item.path)
    }))
  };
}

export function softwareJsonLd(locale, product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.description,
    applicationCategory: product.category || 'BusinessApplication',
    operatingSystem: 'Web',
    url: absoluteUrl(locale, `/products/${product.slug}`),
    // Only assert a positive release state when the record is actually verified.
    ...(product.verified && product.status === 'live'
      ? { releaseNotes: product.caseStudy?.summary || undefined }
      : {})
  };
}

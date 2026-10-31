import { getDirection, isLocale } from '@/lib/i18n';
import { LOCALES, SITE_URL, alternateLanguages } from '@/lib/site';
import { organizationJsonLd, webSiteJsonLd } from '@/lib/seo';
import '@/app/globals.css';
import ConsentBanner from '@/components/ui/ConsentBanner';
import AnalyticsProvider from '@/components/ui/AnalyticsProvider';
import MotionProvider from '@/components/ui/MotionProvider';
import ServiceWorkerRegister from '@/components/ui/ServiceWorkerRegister';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * Locale-level metadata defaults. Per-page `generateMetadata` (buildMetadata)
 * overrides title/description/canonical/hreflang; these values are the floor so
 * that no route can ever ship without a canonical, an OG card or a robots hint.
 */
export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isAr = locale === 'ar';

  const title = isAr ? 'BuyTuk — نبني ما يأتي بعد ذلك' : 'BuyTuk — We Build What Comes Next';
  const description = isAr
    ? 'BuyTuk شركة تقنية تبني منظومة منتجات ومنصات وتجارب رقمية — الذكاء الاصطناعي والسحابة والأتمتة والبيانات والويب والموبايل.'
    : 'BuyTuk is a technology company building a portfolio of digital products, platforms and experiences — AI, cloud, automation, data, web and mobile.';

  return {
    metadataBase: new URL(SITE_URL),
    appleWebApp: { capable: true, title: 'BuyTuk', statusBarStyle: 'black-translucent' },
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }, { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      shortcut: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/icons/apple-touch-icon-180.png', sizes: '180x180', type: 'image/png' }]
    },
    title: { default: title, template: '%s' },
    description,
    applicationName: 'BuyTuk',
    authors: [{ name: 'BuyTuk' }],
    creator: 'BuyTuk',
    publisher: 'BuyTuk',
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: alternateLanguages('')
    },
    openGraph: {
      type: 'website',
      siteName: 'BuyTuk',
      locale: isAr ? 'ar_AR' : 'en_US',
      alternateLocale: isAr ? 'en_US' : 'ar_AR',
      title,
      description,
      url: `${SITE_URL}/${locale}`,
      images: [
        {
          url: `${SITE_URL}/og/buytuk-og.png`,
          width: 1200,
          height: 630,
          alt: isAr ? 'BuyTuk — واجهة تقنية عالمية' : 'BuyTuk — global technology flagship'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/og/buytuk-og.png`]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 }
    },
    formatDetection: { telephone: false, address: false, email: false }
  };
}

const APPLE = { capable: true, title: 'BuyTuk', statusBarStyle: 'black-translucent' };
export const viewport = {
  themeColor: '#04070f',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark'
};

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir} data-motion="auto">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Loaded as a stylesheet so a font CDN outage degrades to the system stack */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(locale)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd(locale)) }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          {locale === 'ar' ? 'تخطَّ إلى المحتوى الرئيسي' : 'Skip to main content'}
        </a>
        <MotionProvider />
        <AnalyticsProvider />
        {children}
        <ConsentBanner locale={locale} />
              <ServiceWorkerRegister />
      </body>
    </html>
  );
}

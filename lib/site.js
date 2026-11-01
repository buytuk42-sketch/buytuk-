// ---------------------------------------------------------------------------
// BuyTuk — site-level constants shared by metadata, navigation, sitemap.
// Single source of truth so SEO and routing never drift apart.
// ---------------------------------------------------------------------------

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buytuk.com';

export const LOCALES = ['ar', 'en'];
export const DEFAULT_LOCALE = 'ar';
export const LOCALE_LABELS = { ar: 'العربية', en: 'English' };
export const LOCALE_DIR = { ar: 'rtl', en: 'ltr' };
export const LOCALE_HREFLANG = { ar: 'ar', en: 'en' };

// Section anchors — the exact order required by the homepage brief (items 1-19).
export const HOME_SECTIONS = [
  { id: 'hero', key: 'nav.home' },
  { id: 'statement', key: 'nav.statement' },
  { id: 'what-is', key: 'nav.whatIs' },
  { id: 'ecosystem', key: 'nav.ecosystem' },
  { id: 'technology', key: 'nav.technology' },
  { id: 'ai', key: 'nav.ai' },
  { id: 'products', key: 'nav.products' },
  { id: 'projects', key: 'nav.projects' },
  { id: 'journey', key: 'nav.journey' },
  { id: 'metrics', key: 'nav.metrics' },
  { id: 'industries', key: 'nav.industries' },
  { id: 'academy', key: 'nav.academy' },
  { id: 'lab', key: 'nav.lab' },
  { id: 'infrastructure', key: 'nav.infrastructure' },
  { id: 'insights', key: 'nav.insights' },
  { id: 'contact', key: 'nav.contact' }
];

// Primary navigation (kept short — anchors + standalone routes).
export const PRIMARY_NAV = [
  { href: '/#ecosystem', key: 'nav.ecosystem' },
  { href: '/#technology', key: 'nav.technology' },
  { href: '/products', key: 'nav.products' },
  { href: '/services', key: 'nav.services' },
  { href: '/ai-lab', key: 'nav.aiLab' },
  { href: '/#insights', key: 'nav.insights' }
];

export const ROUTES = ['', '/products', '/services', '/academy', '/ai-lab', '/legal'];

export const PRODUCT_STATUSES = ['live', 'in-development', 'research', 'coming-soon'];

export function localizedPath(locale, path = '') {
  const clean = path === '/' ? '' : path;
  return `/${locale}${clean === '/' ? '' : clean}`.replace(/\/$/, '') || `/${locale}`;
}

export function absoluteUrl(locale, path = '') {
  return `${SITE_URL}${localizedPath(locale, path)}`;
}

export function alternateLanguages(path = '') {
  return {
    ar: localizedPath('ar', path),
    en: localizedPath('en', path),
    'x-default': localizedPath('ar', path)
  };
}

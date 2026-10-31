import NotFoundView from '@/components/layout/NotFoundView';
import { isLocale } from '@/lib/i18n';

/**
 * Locale-scoped 404 boundary. Renders inside app/[locale]/layout.js, so the
 * correct lang/dir, fonts and JSON-LD are already in place.
 */
export default async function LocaleNotFound({ params }) {
  const { locale: requestedLocale } = (await params) || {};
  const locale = requestedLocale && isLocale(requestedLocale) ? requestedLocale : 'ar';
  return <NotFoundView locale={locale} />;
}

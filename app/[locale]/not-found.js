import NotFoundView from '@/components/layout/NotFoundView';
import { isLocale } from '@/lib/i18n';

/**
 * Locale-scoped 404 boundary. Renders inside app/[locale]/layout.js, so the
 * correct lang/dir, fonts and JSON-LD are already in place.
 */
export default function LocaleNotFound({ params }) {
  const locale = params?.locale && isLocale(params.locale) ? params.locale : 'ar';
  return <NotFoundView locale={locale} />;
}

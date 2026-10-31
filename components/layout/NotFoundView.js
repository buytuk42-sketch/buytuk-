import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { LocalizedLink } from '@/components/ui/LocalizedLink';
import { getTranslator } from '@/lib/i18n';

/** Bilingual 404 view, shared by the locale boundary and the root boundary. */
export default function NotFoundView({ locale = 'ar' }) {
  const t = getTranslator(locale);
  return (
    <>
      <Header locale={locale} path="" />
      <main id="main" className="section" style={{ minHeight: '62svh' }}>
        <div className="shell stack">
          <span className="eyebrow mono">404</span>
          <h1 className="h1">{t('labels.notFound')}</h1>
          <p className="lede">{t('labels.notFoundBody')}</p>
          <div className="row">
            <LocalizedLink locale={locale} href="/" className="btn btn--primary">
              {t('labels.backHome')}
            </LocalizedLink>
            <LocalizedLink locale={locale} href="/products" className="btn btn--ghost">
              {t('nav.products')}
            </LocalizedLink>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}

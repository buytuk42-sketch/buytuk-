import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import { LocalizedLink } from '@/components/ui/LocalizedLink';
import { getLegal } from '@/lib/cms';
import { getTranslator } from '@/lib/i18n';
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = params;
  const isAr = locale === 'ar';
  return buildMetadata({
    locale,
    path: '/legal',
    title: isAr ? 'الصفحات القانونية — BuyTuk' : 'Legal — BuyTuk',
    description: isAr
      ? 'الصفحات القانونية الرسمية لـ BuyTuk.'
      : 'Official BuyTuk legal documents.'
  });
}

/**
 * Legal index. Lists ONLY documents that are actually published — while every
 * document is unpublished this page states that plainly instead of linking to
 * placeholder text (brief §6 / Phase 6).
 */
export default async function LegalIndex({ params }) {
  const { locale } = params;
  const t = getTranslator(locale);
  const legal = await getLegal();
  const isAr = locale === 'ar';

  const docs = Object.values(legal).filter(
    (doc) => doc && typeof doc === 'object' && doc.slug && doc.published === true
  );

  const jsonLd = breadcrumbJsonLd(locale, [
    { name: 'BuyTuk', path: '/' },
    { name: isAr ? 'قانوني' : 'Legal', path: '/legal' }
  ]);

  return (
    <>
      <Header locale={locale} path="/legal" />
      <main id="main">
        <section className="section" style={{ paddingTop: 'var(--sp-8)' }}>
          <div className="shell">
            <Reveal className="section-head">
              <span className="eyebrow">{isAr ? 'قانوني' : 'Legal'}</span>
              <h1 className="h2">{isAr ? 'الصفحات القانونية' : 'Legal documents'}</h1>
              <p className="lede">
                {isAr
                  ? 'تظهر هنا الوثائق القانونية المعتمدة فقط. وأي وثيقة لم تُعتمد بعد لا تُنشر ولا يُوضع لها نص مؤقت.'
                  : 'Only approved legal documents appear here. A document that has not been approved is not published, and no placeholder text is substituted for it.'}
              </p>
            </Reveal>

            {docs.length ? (
              <div className="grid grid--2">
                {docs.map((doc, index) => (
                  <Reveal key={doc.slug} className="card card--feature" delay={index * 50}>
                    <h2 className="h3" style={{ marginBottom: 'var(--sp-2)' }}>
                      {doc.title?.[locale] || doc.title?.en || doc.slug}
                    </h2>
                    <p style={{ fontSize: 'var(--fs-sm)' }}>
                      {doc.summary?.[locale] || doc.summary?.en}
                    </p>
                    {doc.lastUpdated && (
                      <p className="hint" style={{ margin: 0 }}>
                        {t('labels.updated')}: {doc.lastUpdated}
                      </p>
                    )}
                    <div className="row" style={{ marginTop: 'var(--sp-4)' }}>
                      <LocalizedLink locale={locale} href={`/legal/${doc.slug}`} className="btn btn--ghost">
                        {t('labels.readMore')}
                      </LocalizedLink>
                    </div>
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal className="notice">
                {isAr
                  ? 'لم تُعتمد أي وثيقة قانونية للنشر حتى الآن. البنية جاهزة، والنصوص بانتظار الاعتماد الرسمي من BuyTuk.'
                  : 'No legal document has been approved for publication yet. The structure is ready; the texts await official approval from BuyTuk.'}
              </Reveal>
            )}
          </div>
        </section>
      </main>
      <Footer locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

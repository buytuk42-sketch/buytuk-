import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import { getLegalDoc, getLegal } from '@/lib/cms';
import { getTranslator } from '@/lib/i18n';
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo';

export async function generateStaticParams() {
  const legal = await getLegal();
  const slugs = Object.values(legal)
    .filter((doc) => doc && typeof doc === 'object' && doc.slug && doc.published === true)
    .map((doc) => doc.slug);

  // No published documents yet => no legal routes are generated at all, and the
  // middleware/404 handles any direct hit. This is the correct current state.
  return ['ar', 'en'].flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }) {
  const { locale, slug } = params;
  const doc = await getLegalDoc(slug);
  if (!doc) return buildMetadata({ locale, path: `/legal/${slug}`, title: 'BuyTuk', description: '' });
  return buildMetadata({
    locale,
    path: `/legal/${slug}`,
    title: `${doc.title?.[locale] || doc.title?.en} — BuyTuk`,
    description: doc.summary?.[locale] || doc.summary?.en || ''
  });
}

/**
 * Legal document renderer. Returns 404 unless the document is explicitly
 * published — never a placeholder legal text (brief §6 / Phase 6).
 */
export default async function LegalDocument({ params }) {
  const { locale, slug } = params;
  const doc = await getLegalDoc(slug);
  if (!doc) notFound();

  const t = getTranslator(locale);
  const isAr = locale === 'ar';
  const title = doc.title?.[locale] || doc.title?.en || slug;

  const jsonLd = breadcrumbJsonLd(locale, [
    { name: 'BuyTuk', path: '/' },
    { name: isAr ? 'قانوني' : 'Legal', path: '/legal' },
    { name: title, path: `/legal/${slug}` }
  ]);

  return (
    <>
      <Header locale={locale} path={`/legal/${slug}`} />
      <main id="main">
        <section className="section" style={{ paddingTop: 'var(--sp-8)' }}>
          <div className="shell">
            <Reveal className="section-head">
              <span className="eyebrow">{isAr ? 'قانوني' : 'Legal'}</span>
              <h1 className="h2">{title}</h1>
              {(doc.lastUpdated || doc.effectiveDate) && (
                <p className="hint">
                  {doc.effectiveDate ? `${isAr ? 'سارٍ من' : 'Effective'} ${doc.effectiveDate}` : ''}
                  {doc.lastUpdated ? ` · ${t('labels.updated')} ${doc.lastUpdated}` : ''}
                </p>
              )}
            </Reveal>

            {/* Body is authored as plain paragraphs in the CMS to keep rendering
                predictable and XSS-safe — no raw HTML is ever injected. */}
            <Reveal className="stack" style={{ maxWidth: '72ch' }}>
              {(Array.isArray(doc.body) ? doc.body : []).map((block, index) => (
                <section key={index}>
                  {block.heading && <h2 className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{block.heading}</h2>}
                  {(block.paragraphs || []).map((paragraph, pIndex) => (
                    <p key={pIndex} style={{ fontSize: 'var(--fs-sm)' }}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </Reveal>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

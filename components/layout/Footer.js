import { LocalizedLink } from '@/components/ui/LocalizedLink';
import { getCompany, getLegal, getSocialAccounts } from '@/lib/cms';

/**
 * Global footer (brief §3.19, §6, §7 / Phases 6-7).
 *
 * Reads official company data, social accounts and legal documents from the
 * CMS. Anything not approved for publication is simply absent — there are no
 * placeholder phone numbers, no guessed social URLs, and no links to legal
 * pages that do not exist yet.
 */
export default async function Footer({ locale }) {
  const isAr = locale === 'ar';
  const year = new Date().getFullYear();

  const [company, socials, legal] = await Promise.all([
    getCompany(),
    getSocialAccounts(),
    getLegal()
  ]);

  const publishedDocs = Object.values(legal || {}).filter(
    (doc) => doc && typeof doc === 'object' && doc.slug && doc.published === true
  );

  const channels = [];
  if (company?.published === true) {
    if (company.email?.general) channels.push({ label: company.email.general, href: `mailto:${company.email.general}` });
    if (company.phone?.main) channels.push({ label: company.phone.main, href: `tel:${company.phone.main.replace(/\s+/g, '')}` });
    if (company.registeredAddress) channels.push({ label: company.registeredAddress, href: null });
  }

  const columns = [
    {
      title: isAr ? 'الشركة' : 'Company',
      links: [
        { href: '/#what-is', label: isAr ? 'ما هي BuyTuk' : 'What is BuyTuk' },
        { href: '/#journey', label: isAr ? 'مسار الشركة' : 'Company journey' },
        { href: '/#insights', label: isAr ? 'رؤى ومقالات' : 'Insights' },
        { href: '/#contact', label: isAr ? 'تواصل' : 'Contact' }
      ]
    },
    {
      title: isAr ? 'المنصة' : 'Platform',
      links: [
        { href: '/products', label: isAr ? 'المنتجات' : 'Products' },
        { href: '/services', label: isAr ? 'معرض الحلول' : 'Solution showcase' },
        { href: '/#technology', label: isAr ? 'التقنية' : 'Technology' },
        { href: '/academy', label: 'BuyTuk Academy' },
        { href: '/ai-lab', label: isAr ? 'مختبر الذكاء الاصطناعي' : 'AI Lab' }
      ]
    },
    {
      title: isAr ? 'قانوني' : 'Legal',
      links: publishedDocs.length
        ? publishedDocs.map((doc) => ({
            href: `/legal/${doc.slug}`,
            label: doc.title?.[locale] || doc.title?.en || doc.slug
          }))
        : [{ href: '/#infrastructure', label: isAr ? 'الأمان' : 'Security' }]
    }
  ];

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="brand" style={{ marginBottom: 'var(--sp-3)' }}>
              <svg className="brand__mark" viewBox="0 0 40 40" aria-hidden="true">
                <defs>
                  <linearGradient id="footer-arc" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4ce0ff" />
                    <stop offset="50%" stopColor="#6f7bff" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <path d="M6 30 A14 14 0 0 1 34 30" fill="none" stroke="url(#footer-arc)" strokeWidth="3.4" strokeLinecap="round" />
                <circle cx="20" cy="30" r="3.2" fill="#6f7bff" />
              </svg>
              <span className="brand__name">BuyTuk</span>
            </div>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-lo)', maxWidth: '38ch' }}>
              {isAr
                ? 'تبني BuyTuk ما يأتي بعد ذلك: منتجات مملوكة، وتقنية تطبيقية، ومنهج قائم على الدليل.'
                : 'BuyTuk builds what comes next: owned products, applied technology and an evidence-based approach to digital systems.'}
            </p>

            {/* Official channels — rendered only when approved and published. */}
            {channels.length > 0 ? (
              <ul className="stack stack--sm" style={{ marginTop: 'var(--sp-4)' }}>
                {channels.map((channel) => (
                  <li key={channel.label} style={{ fontSize: 'var(--fs-sm)' }}>
                    {channel.href ? (
                      <a href={channel.href} style={{ color: 'var(--arc-1)' }}>{channel.label}</a>
                    ) : (
                      <span style={{ color: 'var(--text-lo)' }}>{channel.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="hint" style={{ marginTop: 'var(--sp-3)' }}>
                {company?.pendingNote?.[locale] || company?.pendingNote?.en ||
                  (isAr
                    ? 'بيانات الكيان القانوني وقنوات التواصل الرسمية بانتظار الاعتماد.'
                    : 'Legal entity details and official channels await approval.')}
              </div>
            )}

            {/* Social icons — only accounts a human verified. */}
            {socials.length > 0 && (
              <div className="row" style={{ marginTop: 'var(--sp-4)', gap: 'var(--sp-3)' }}>
                {socials.map((account) => (
                  <a
                    key={account.url}
                    href={account.url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={`BuyTuk on ${account.platform}`}
                    title={account.handle || account.platform}
                    style={{ color: 'var(--text-lo)' }}
                  >
                    <span className="chip">{account.platform}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {columns.map((col) => (
            <div className="footer-col" key={col.title}>
              <h3>{col.title}</h3>
              {col.links.map((link) => (
                <LocalizedLink key={`${col.title}-${link.label}`} locale={locale} href={link.href}>
                  {link.label}
                </LocalizedLink>
              ))}
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© {year} BuyTuk. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</span>
          <span>
            {isAr
              ? 'مبنيّ كواجهة عالمية ثنائية اللغة، ميسّرة، ومُصدَّرة من الخادم.'
              : 'Built as a bilingual, accessible, server-rendered flagship.'}
          </span>
        </div>
      </div>
    </footer>
  );
}

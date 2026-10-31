import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import { AcademySection, LabSection } from '@/components/sections/SectionsB';
import { getTranslator } from '@/lib/i18n';
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = getTranslator(locale);
  return buildMetadata({
    locale,
    path: '/academy',
    title: `${t('academy.eyebrow')} — BuyTuk`,
    description: t('academy.body')
  });
}

export default async function AcademyPage({ params }) {
  const { locale } = await params;
  const t = getTranslator(locale);
  const isAr = locale === 'ar';

  const jsonLd = breadcrumbJsonLd(locale, [
    { name: 'BuyTuk', path: '/' },
    { name: 'BuyTuk Academy', path: '/academy' }
  ]);

  const detail = isAr
    ? [
        {
          title: 'سلسلة الدليل',
          body: 'من نشاط الطالب في الصف إلى تقرير المؤسسة: سلسلة واحدة قابلة للتتبّع، بلا فجوات ولا انتقالات غير موثّقة بين الأنظمة.'
        },
        {
          title: 'الأدوار والصلاحيات',
          body: 'لكل دور — الطالب والمعلم والمدرسة والإدارة — نطاق وصول محدود بما يحتاجه فقط، لا أكثر.'
        },
        {
          title: 'الذكاء الاصطناعي المساند',
          body: 'يُهيّئ الذكاء الاصطناعي الملخّصات والمؤشرات ويُنبّه على الأنماط، ويظل كل ناتج قابلًا للنسبة والمراجعة من إنسان.'
        },
        {
          title: 'التقارير للقرار',
          body: 'التقارير مُعدّة ليقرّر إنسان، لا لتحلّ محلّ حكمه. ولهذا يُعرض سياق كل رقم بجانبه.'
        }
      ]
    : [
        {
          title: 'The evidence chain',
          body: 'From classroom activity to institutional report: a single traceable chain, with no gaps and no undocumented hand-offs between systems.'
        },
        {
          title: 'Roles and permissions',
          body: 'Each role — student, teacher, school, administration — receives the narrowest access that lets it do its job.'
        },
        {
          title: 'Assistive AI',
          body: 'AI prepares summaries and indicators and flags patterns, while every output stays attributable and human-reviewable.'
        },
        {
          title: 'Reporting for decisions',
          body: 'Reports are built for a human to decide with, not to decide for one — which is why every figure keeps its context beside it.'
        }
      ];

  return (
    <>
      <Header locale={locale} path="/academy" />
      <main id="main">
        <section className="section" style={{ paddingTop: 'var(--sp-8)' }}>
          <div className="shell">
            <Reveal className="section-head">
              <span className="eyebrow">{t('academy.eyebrow')}</span>
              <h1 className="h2">{t('academy.title')}</h1>
              <p className="lede">{t('academy.body')}</p>
            </Reveal>
            <Reveal className="notice">
              {isAr
                ? 'BuyTuk Academy اتجاه قيد التعريف وموسوم كـ «قريبًا». البنية والمحتوى جاهزان، والبيانات التنفيذية بانتظار توثيق العميل.'
                : 'BuyTuk Academy is a defined direction marked “Coming Soon”. The structure and content are ready; operational data awaits client documentation.'}
            </Reveal>
          </div>
        </section>

        <section className="section section--tight">
          <div className="shell">
            <div className="grid grid--2">
              {detail.map((item, index) => (
                <Reveal key={item.title} className="card card--feature" delay={index * 50}>
                  <h2 className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{item.title}</h2>
                  <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>{item.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <AcademySection locale={locale} t={t} />
        <LabSection locale={locale} t={t} />
      </main>
      <Footer locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

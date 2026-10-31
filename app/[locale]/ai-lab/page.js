import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import { getTranslator } from '@/lib/i18n';
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = getTranslator(locale);
  return buildMetadata({
    locale,
    path: '/ai-lab',
    title: `${t('ai.eyebrow')} — BuyTuk`,
    description: t('ai.body')
  });
}

export default async function AiLabPage({ params }) {
  const { locale } = await params;
  const t = getTranslator(locale);
  const isAr = locale === 'ar';
  const stages = t('ai.stages') || [];

  const tone = {
    production: 'chip--live',
    prototype: 'chip--in-development',
    research: 'chip--research',
    future: 'chip--coming-soon'
  };

  const topics = isAr
    ? [
        { title: 'تمثيل المعرفة التعليمية', body: 'كيف تُبنى فهارس مفهومية تُغذّي المساعدة والتقارير دون تشويه سياق المنهج.' },
        { title: 'التقييم والمقارنة', body: 'أدوات قياس أداء النماذج على مهام تعليمية واقعية، بأحكام بشرية مرجعية.' },
        { title: 'التفسير والقابلية للمساءلة', body: 'جعل كل مخرج نموذج قابلًا للتتبّع إلى مدخلاته، بشرط أساسي قبل أي استخدام مؤسسي.' },
        { title: 'تقليل البيانات', body: 'الحد من حجم البيانات الشخصية التي يراها أي نموذج، من التصميم لا بعده.' },
        { title: 'الأتمتة الموثوقة', body: 'مسارات عمل محدّدة قابلة للتحقق، بلا مفاجآت وبلا قرارات غير مراقبة.' },
        { title: 'الجدوى التقنية', body: 'قياس الكلفة والزمن والدقة قبل أن يتحوّل أي مفهوم إلى التزام منتج.' }
      ]
    : [
        { title: 'Educational knowledge representation', body: 'How concept maps are built to feed assistance and reporting without distorting curriculum context.' },
        { title: 'Evaluation and benchmarking', body: 'Instruments for measuring model behaviour on realistic educational tasks against human reference judgements.' },
        { title: 'Explainability and accountability', body: 'Making every model output traceable to its inputs — a precondition for any institutional deployment.' },
        { title: 'Data minimisation', body: 'Limiting the personal data any model can see, by design rather than by policy afterwards.' },
        { title: 'Trustworthy automation', body: 'Deterministic, verifiable workflows with no unsupervised decisions and no surprises.' },
        { title: 'Technical feasibility', body: 'Cost, latency and accuracy measured before any concept becomes a product commitment.' }
      ];

  const jsonLd = breadcrumbJsonLd(locale, [
    { name: 'BuyTuk', path: '/' },
    { name: t('ai.eyebrow'), path: '/ai-lab' }
  ]);

  return (
    <>
      <Header locale={locale} path="/ai-lab" />
      <main id="main">
        <section className="section" style={{ paddingTop: 'var(--sp-8)' }}>
          <div className="shell">
            <Reveal className="section-head">
              <span className="eyebrow">{t('ai.eyebrow')}</span>
              <h1 className="h2">{t('ai.title')}</h1>
              <p className="lede">{t('ai.body')}</p>
            </Reveal>

            <Reveal className="card card--feature">
              <h2 className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{t('ai.principleTitle')}</h2>
              <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>{t('ai.principleBody')}</p>
            </Reveal>

            <Reveal style={{ marginTop: 'var(--sp-7)' }}>
              <span className="eyebrow" style={{ marginBottom: 'var(--sp-4)' }}>
                {isAr ? 'أطوار العمل' : 'Maturity stages'}
              </span>
            </Reveal>
            <div className="grid grid--4" style={{ marginTop: 'var(--sp-4)' }}>
              {Array.isArray(stages) &&
                stages.map((stage, index) => (
                  <Reveal key={stage.key} className="card" delay={index * 40}>
                    <span className={`chip ${tone[stage.key] || 'chip--soon'}`} style={{ marginBottom: 'var(--sp-3)' }}>
                      <span className="chip__dot" aria-hidden="true" />
                      {stage.title}
                    </span>
                    <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>{stage.body}</p>
                  </Reveal>
                ))}
            </div>
          </div>
        </section>

        <section className="section section--veil">
          <div className="shell">
            <Reveal className="section-head">
              <span className="eyebrow">{isAr ? 'مجالات البحث' : 'Research tracks'}</span>
              <h2 className="h2">
                {isAr ? 'أسئلة نعمل عليها الآن' : 'Questions currently under investigation'}
              </h2>
              <p className="lede">
                {isAr
                  ? 'هذه مجالات بحثية معلنة بوضوح؛ ولا يُقدَّم أي منها كمنتج جاهز.'
                  : 'These are explicitly declared research tracks. None of them is presented as a shipped product.'}
              </p>
            </Reveal>
            <div className="grid grid--3">
              {topics.map((topic, index) => (
                <Reveal key={topic.title} className="card" delay={index * 40}>
                  <h3 className="h3" style={{ marginBottom: 'var(--sp-2)' }}>{topic.title}</h3>
                  <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>{topic.body}</p>
                  <div className="row" style={{ marginTop: 'var(--sp-4)' }}>
                    <span className="chip chip--research">
                      <span className="chip__dot" aria-hidden="true" />
                      {isAr ? 'بحثي' : 'Research'}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

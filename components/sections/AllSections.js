import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import CinematicOpening from '@/components/sections/CinematicOpening';
import ProductsRegister from '@/components/sections/ProductsRegister';
import Reveal from '@/components/ui/Reveal';
import { LocalizedLink } from '@/components/ui/LocalizedLink';
import { CapabilitiesSection, SolutionsSection } from '@/components/sections/CapabilityLayers';
import {
  ProjectsSection,
  JourneySection,
  MetricsSection,
  IndustriesSection,
  AcademySection,
  LabSection,
  InfrastructureSection,
  InsightsSection,
  ContactSection
} from '@/components/sections/SectionsB';
import { getProducts, getProjects, getInsights, getJourney, getMetrics } from '@/lib/cms';

/* ---------------------------------------------------------------------------
   Homepage composition.

   The same 19 brief-required blocks as before — no block was removed and no
   subsystem was rebuilt — re-ordered to follow the 14-step visitor journey:

     Journey step                              -> block
     1  Who is BuyTuk?                         -> Cinematic Opening, Hero, Statement, What is BuyTuk?, Company Journey
     2  What does it build?                    -> Capabilities (Products/Platforms/Solutions/Capabilities)
     3  What is the ecosystem?                 -> Ecosystem map
     4  Which sectors does it serve?           -> Sectors (Industries)
     5  Products and platforms                 -> Products register
     6  Solutions and digital capabilities      -> Solutions
     7  Technology                             -> Technology
     8  How AI is used inside the ecosystem     -> AI layer
     9  Verified projects and numbers           -> Projects (four classes) + Verified Metrics
     10 BuyTuk Academy                          -> Academy (positioned under Education)
     11 Innovation / AI Lab                     -> Innovation Lab
     12 Infrastructure and security             -> Infrastructure & Security
     13 Content and knowledge                   -> Insights
     14 Contact                                 -> Contact + Global Footer

   Academy and AI Lab keep their content but no longer lead the identity.
   --------------------------------------------------------------------------- */

function Statement({ t }) {
  return (
    <section className="section section--veil" id="statement">
      <div className="shell">
        <Reveal className="stack" style={{ maxWidth: '58ch' }}>
          <span className="eyebrow">{t('statement.identity')}</span>
          <p className="display" style={{ margin: 0 }}>{t('statement.line')}</p>
          <p className="lede">{t('statement.identityBody')}</p>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-mid)', margin: 0 }}>{t('statement.body')}</p>
        </Reveal>
      </div>
    </section>
  );
}

function WhatIs({ t }) {
  const pillars = t('whatIs.pillars') || [];
  return (
    <section className="section" id="what-is">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('whatIs.eyebrow')}</span>
          <h2 className="h2">{t('whatIs.title')}</h2>
          <p className="lede">{t('whatIs.body')}</p>
        </Reveal>
        <div className="grid grid--4">
          {Array.isArray(pillars) &&
            pillars.map((pillar, index) => (
              <Reveal key={pillar.title} className="card" delay={index * 50}>
                <h3 className="h3" style={{ marginBottom: 'var(--sp-2)' }}>{pillar.title}</h3>
                <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>{pillar.body}</p>
              </Reveal>
            ))}
        </div>
        <Reveal className="notice" style={{ marginTop: 'var(--sp-6)' }}>
          <strong style={{ color: 'var(--text-hi)' }}>{t('whatIs.readme.title')}</strong>
          <br />
          {t('whatIs.readme.body')}
        </Reveal>
      </div>
    </section>
  );
}

function Ecosystem({ t }) {
  const nodes = t('ecosystem.nodes') || [];
  const sectors = t('ecosystem.sectors') || [];
  return (
    <section className="section section--veil" id="ecosystem">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('ecosystem.eyebrow')}</span>
          <h2 className="h2">{t('ecosystem.title')}</h2>
          <p className="lede">{t('ecosystem.body')}</p>
        </Reveal>

        <Reveal className="eyebrow" style={{ marginBottom: 'var(--sp-4)' }}>{t('ecosystem.layerLabel')}</Reveal>
        <div className="node-grid">
          {Array.isArray(nodes) &&
            nodes.map((node, index) => (
              <Reveal key={node.title} className="node" delay={index * 50}>
                <span className="node__index">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="node__title">{node.title}</h3>
                <p className="node__body">{node.body}</p>
              </Reveal>
            ))}
        </div>

        {/* Sector map: coverage, explicitly not a client list. */}
        <Reveal className="card" style={{ marginTop: 'var(--sp-6)' }}>
          <span className="eyebrow" style={{ display: 'block', marginBottom: 'var(--sp-4)' }}>{t('ecosystem.sectorLabel')}</span>
          <div className="row">
            {Array.isArray(sectors) && sectors.map((sector) => (
              <span className="chip" key={sector}>{sector}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Technology({ t }) {
  const disciplines = t('technology.disciplines') || [];
  const stack = t('technology.stack') || [];
  const pending = t('technology.pending') || [];
  return (
    <section className="section" id="technology">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('technology.eyebrow')}</span>
          <h2 className="h2">{t('technology.title')}</h2>
          <p className="lede">{t('technology.body')}</p>
        </Reveal>

        <Reveal className="eyebrow" style={{ marginBottom: 'var(--sp-4)' }}>{t('technology.disciplineLabel')}</Reveal>
        <div className="grid grid--auto" style={{ marginBottom: 'var(--sp-7)' }}>
          {Array.isArray(disciplines) &&
            disciplines.map((item, index) => (
              <Reveal key={item.key} className="card" delay={index * 30}>
                <h3 className="h3" style={{ marginBottom: 'var(--sp-2)' }}>{item.title}</h3>
                <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>{item.body}</p>
              </Reveal>
            ))}
        </div>

        <div className="grid grid--2">
          <Reveal className="card card--feature">
            <span className="chip chip--live" style={{ marginBottom: 'var(--sp-3)' }}>
              <span className="chip__dot" aria-hidden="true" />
              {t('technology.stackLabel')}
            </span>
            <ul className="stack stack--sm">
              {Array.isArray(stack) &&
                stack.map((entry) => (
                  <li key={entry} className="mono" style={{ fontSize: 'var(--fs-sm)' }}>{entry}</li>
                ))}
            </ul>
          </Reveal>
          <Reveal className="card card--feature" delay={60}>
            <span className="chip chip--unverified" style={{ marginBottom: 'var(--sp-3)' }}>
              <span className="chip__dot" aria-hidden="true" />
              {t('technology.internalLabel')}
            </span>
            <ul className="stack stack--sm">
              {Array.isArray(pending) &&
                pending.map((entry) => (
                  <li key={entry} style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-lo)' }}>{entry}</li>
                ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * AI is framed as a capability layer inside the ecosystem (brief §6) — it no
 * longer stands in for the company identity.
 */
function AiSection({ locale, t }) {
  const stages = t('ai.stages') || [];
  const tone = { production: 'chip--live', prototype: 'chip--in-development', research: 'chip--research', future: 'chip--coming-soon' };
  return (
    <section className="section section--veil" id="ai">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('ai.eyebrow')}</span>
          <h2 className="h2">{t('ai.title')}</h2>
          <p className="lede">{t('ai.body')}</p>
        </Reveal>

        <Reveal className="notice" style={{ marginBottom: 'var(--sp-6)' }}>
          <strong style={{ color: 'var(--text-hi)' }}>{t('ai.positioning')}</strong>
        </Reveal>

        <Reveal className="card card--feature" style={{ marginBottom: 'var(--sp-6)' }}>
          <h3 className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{t('ai.principleTitle')}</h3>
          <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>{t('ai.principleBody')}</p>
        </Reveal>

        <div className="grid grid--4">
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

        <Reveal style={{ marginTop: 'var(--sp-6)' }}>
          <LocalizedLink locale={locale} href="/ai-lab" className="btn btn--ghost">
            {t('ai.cta')}
          </LocalizedLink>
        </Reveal>
      </div>
    </section>
  );
}

function ProductsSection({ locale, t, products }) {
  return (
    <section className="section" id="products">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('products.eyebrow')}</span>
          <h2 className="h2">{t('products.title')}</h2>
          <p className="lede">{t('products.body')}</p>
        </Reveal>
        <ProductsRegister locale={locale} t={t} products={products} limit={4} />
        <Reveal style={{ marginTop: 'var(--sp-6)' }}>
          <LocalizedLink locale={locale} href="/products" className="btn btn--ghost">
            {t('nav.products')}
          </LocalizedLink>
        </Reveal>
      </div>
    </section>
  );
}

export default async function AllSections({ locale, t, hero }) {
  const [products, projects, insights, journey, metrics] = await Promise.all([
    getProducts(locale),
    getProjects(),
    getInsights(),
    getJourney(),
    getMetrics()
  ]);

  return (
    <>
      <CinematicOpening locale={locale} />
      <Header locale={locale} path="/" />
      <main id="main">
        {/* 1 — who is BuyTuk */}
        <Hero locale={locale} hero={hero} />
        <Statement t={t} />
        <WhatIs t={t} />
        <JourneySection locale={locale} t={t} journey={journey} />
        {/* 2 — what it builds */}
        <CapabilitiesSection locale={locale} t={t} products={products} />
        {/* 3 — the ecosystem */}
        <Ecosystem t={t} />
        {/* 4 — sectors */}
        <IndustriesSection locale={locale} t={t} />
        {/* 5 — products and platforms */}
        <ProductsSection locale={locale} t={t} products={products} />
        {/* 6 — solutions and digital capabilities */}
        <SolutionsSection locale={locale} t={t} />
        {/* 7 — technology */}
        <Technology t={t} />
        {/* 8 — AI inside the ecosystem */}
        <AiSection locale={locale} t={t} />
        {/* 9 — verified projects and verified numbers */}
        <ProjectsSection locale={locale} t={t} projects={projects} products={products} />
        <MetricsSection locale={locale} t={t} metrics={metrics} />
        {/* 10 — BuyTuk Academy (positioned under Education) */}
        <AcademySection locale={locale} t={t} />
        {/* 11 — Innovation / AI Lab as a capability layer */}
        <LabSection locale={locale} t={t} />
        {/* 12 — infrastructure and security */}
        <InfrastructureSection locale={locale} t={t} />
        {/* 13 — content and knowledge */}
        <InsightsSection locale={locale} t={t} insights={insights} />
        {/* 14 — contact */}
        <ContactSection locale={locale} t={t} />
      </main>
      <Footer locale={locale} />
    </>
  );
}

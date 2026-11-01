import Reveal from '@/components/ui/Reveal';
import ContactForm from '@/components/sections/ContactForm';
import { LocalizedLink } from '@/components/ui/LocalizedLink';
import formCopy from '@/content/cms/contact-form.json';

/* ---------------------------------------------------------------------------
   Homepage sections 10-19 (brief §3): Projects, Journey, Metrics, Industries,
   Academy, Innovation Lab, Infrastructure & Security, Insights, Contact.
   Sections 1-9 live in AllSections.js; the two files compose in order.
   --------------------------------------------------------------------------- */

/**
 * Four explicit classes (brief §9). Products / capabilities / concepts are all
 * derived from the SAME published register the Products section renders, so the
 * two can never drift and nothing here can be read as a delivered project.
 * `projects.verified` stays empty until BuyTuk supplies attribution + evidence.
 */
export function ProjectsSection({ locale, t, projects, products }) {
  const rows = projects?.items?.length ? projects.items : Array.isArray(projects) ? projects : [];
  const register = Array.isArray(products) ? products : [];
  const verified = projects?.verified?.length ? projects.verified : rows;
  const owned = register.filter((p) => p.claim === 'product' || p.claim === 'platform');
  const capabilities = register.filter((p) => p.claim === 'capability' || p.claim === 'solution');
  const concepts = register.filter((p) => p.status === 'coming-soon' || p.status === 'research');

  const Bucket = ({ label, note, items, tone, delay, children }) => (
    <Reveal className="card card--feature" delay={delay}>
      <span className={`chip ${tone}`} style={{ marginBottom: 'var(--sp-3)' }}>
        <span className="chip__dot" aria-hidden="true" />
        {label}
      </span>
      {children}
      {items?.length > 0 && (
        <ul className="stack stack--sm" style={{ marginTop: 'var(--sp-3)' }}>
          {items.map((item) => (
            <li key={item.slug} style={{ fontSize: 'var(--fs-sm)' }}>{item.name}</li>
          ))}
        </ul>
      )}
      {note && <p className="hint" style={{ marginTop: 'var(--sp-3)', marginBottom: 0 }}>{note}</p>}
    </Reveal>
  );

  return (
    <section className="section section--veil" id="projects">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('projects.eyebrow')}</span>
          <h2 className="h2">{t('projects.title')}</h2>
          <p className="lede">{t('projects.body')}</p>
        </Reveal>

        <div className="grid grid--2">
          <Bucket label={t('projects.verifiedLabel')} note={t('projects.verifiedEmpty')} tone="chip--unverified">
            <p style={{ fontSize: 'var(--fs-sm)', margin: 0, color: 'var(--text-lo)' }}>—</p>
          </Bucket>
          <Bucket label={t('projects.productsLabel')} note={t('projects.productsNote')} items={owned} tone="chip--live" delay={50} />
          <Bucket label={t('projects.capabilitiesLabel')} note={t('projects.capabilitiesNote')} items={capabilities} tone="chip--research" delay={100} />
          <Bucket label={t('projects.conceptsLabel')} note={t('projects.conceptsNote')} items={concepts} tone="chip--coming-soon" delay={150} />
        </div>
      </div>
    </section>
  );
}

export function JourneySection({ locale, t, journey }) {
  const rows = journey?.items || [];
  return (
    <section className="section" id="journey">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('journey.eyebrow')}</span>
          <h2 className="h2">{t('journey.title')}</h2>
          <p className="lede">{t('journey.body')}</p>
        </Reveal>
        <Reveal className="notice" style={{ marginBottom: 'var(--sp-6)' }}>
          {t('journey.disclaimer')}
        </Reveal>
        <div className="timeline">
          {rows.map((item, index) => (
            <Reveal key={item.phase || index} className="timeline__item">
              <span className="timeline__year">{item.date || t('metrics.pendingShort')}</span>
              <h3 className="h3" style={{ marginBlock: 'var(--sp-2)' }}>{item.label}</h3>
              <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>{item.detail}</p>
              <div className="row" style={{ marginTop: 'var(--sp-3)' }}>
                <span className="chip chip--unverified">
                  <span className="chip__dot" aria-hidden="true" />
                  {item.phase} · {t('labels.unverified')}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MetricsSection({ locale, t, metrics }) {
  const rows = Array.isArray(metrics) ? metrics : [];
  return (
    <section className="section section--veil" id="metrics">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('metrics.eyebrow')}</span>
          <h2 className="h2">{t('metrics.title')}</h2>
          <p className="lede">{t('metrics.body')}</p>
        </Reveal>
        <Reveal className="notice" style={{ marginBottom: 'var(--sp-6)' }}>
          {t('metrics.rule')}
        </Reveal>
        <div className="grid grid--3">
          {rows.map((metric, index) => (
            <Reveal key={metric.id} className="metric" delay={index * 40}>
              <div className="metric__value" data-verified={metric.verified ? 'true' : 'false'}>
                {metric.value ?? '—'}
              </div>
              <div className="metric__label">{metric.label}</div>
              {!metric.verified && <div className="metric__note">{t('metrics.pending')}</div>}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IndustriesSection({ locale, t }) {
  const segments = t('industries.segments') || [];
  return (
    <section className="section" id="industries">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('industries.eyebrow')}</span>
          <h2 className="h2">{t('industries.title')}</h2>
          <p className="lede">{t('industries.body')}</p>
        </Reveal>
        <div className="grid grid--3">
          {Array.isArray(segments) &&
            segments.map((segment, index) => (
              <Reveal key={segment.title} className="card" delay={index * 40}>
                <h3 className="h3">{segment.title}</h3>
                <span className="chip chip--research" style={{ marginTop: 'var(--sp-3)' }}>
                  <span className="chip__dot" aria-hidden="true" />
                  {t('labels.capability')}
                </span>
                <p style={{ fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-3)', marginBottom: 0, color: 'var(--text-lo)' }}>
                  {segment.note}
                </p>

                {/* Sector -> internal capability/product linkage (brief §14).
                    Anchors are internal (#academy, #ai, #technology, #solutions,
                    #products) or plain capability labels. Never a client name. */}
                {Array.isArray(segment.links) && segment.links.length > 0 && (
                  <div style={{ marginTop: 'var(--sp-4)', borderTop: '1px solid var(--line)', paddingTop: 'var(--sp-3)' }}>
                    <span className="hint" style={{ display: 'block', marginBottom: 6 }}>
                      {t('industries.linksLabel')}
                    </span>
                    <div className="row" style={{ gap: 6 }}>
                      {segment.links.map((link) =>
                        link.startsWith('#') ? (
                          <a key={link} className="chip" href={link}>{link.replace('#', '')}</a>
                        ) : (
                          <span key={link} className="chip chip--quiet">{link}</span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </Reveal>
            ))}
        </div>
        <Reveal className="card" style={{ marginTop: 'var(--sp-6)' }}>
          <h3 className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{t('industries.customersLabel')}</h3>
          <p className="hint" style={{ margin: 0 }}>{t('industries.customersEmpty')}</p>
        </Reveal>
      </div>
    </section>
  );
}

export function AcademySection({ locale, t }) {
  const flow = t('academy.flow') || [];
  const principles = t('academy.principles') || [];
  return (
    <section className="section section--veil" id="academy">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('academy.eyebrow')}</span>
          <h2 className="h2">{t('academy.title')}</h2>
          <p className="lede">{t('academy.body')}</p>
        </Reveal>

        {/* Positioned inside the ecosystem, not as the company identity (brief §5). */}
        <Reveal className="notice" style={{ marginBottom: 'var(--sp-6)' }}>
          <strong style={{ color: 'var(--text-hi)' }}>{t('academy.positioning')}</strong>
          <br />
          {t('academy.positioningNote')}
        </Reveal>

        <Reveal className="flow" style={{ marginBottom: 'var(--sp-7)' }}>
          {Array.isArray(flow) &&
            flow.map((step, index) => (
              <div key={step.title} style={{ display: 'contents' }}>
                <div className="flow__step">
                  {step.title}
                  <small>{step.note}</small>
                </div>
                {index < flow.length - 1 && (
                  <span className="flow__arrow" aria-hidden="true">→</span>
                )}
              </div>
            ))}
        </Reveal>

        <div className="grid grid--2">
          <Reveal className="card card--feature">
            <h3 className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{t('academy.roleTitle')}</h3>
            <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>{t('academy.roleBody')}</p>
          </Reveal>
          <Reveal className="card card--feature" delay={60}>
            <h3 className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{t('academy.principlesTitle')}</h3>
            <ul className="stack stack--sm">
              {Array.isArray(principles) &&
                principles.map((principle) => (
                  <li key={principle} style={{ fontSize: 'var(--fs-sm)', display: 'flex', gap: 8 }}>
                    <span aria-hidden="true" style={{ color: 'var(--arc-1)' }}>—</span>
                    <span>{principle}</span>
                  </li>
                ))}
            </ul>
          </Reveal>
        </div>

        <Reveal style={{ marginTop: 'var(--sp-6)' }}>
          <LocalizedLink locale={locale} href="/academy" className="btn btn--ghost">
            {t('academy.cta')}
          </LocalizedLink>
        </Reveal>
      </div>
    </section>
  );
}

export function LabSection({ locale, t }) {
  const phases = t('lab.phases') || [];
  return (
    <section className="section" id="lab">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('lab.eyebrow')}</span>
          <h2 className="h2">{t('lab.title')}</h2>
          <p className="lede">{t('lab.body')}</p>
        </Reveal>

        {/* AI Lab / Innovation Lab = capability layer, not the company (brief §6). */}
        <Reveal className="notice" style={{ marginBottom: 'var(--sp-6)' }}>
          <strong style={{ color: 'var(--text-hi)' }}>{t('lab.positioning')}</strong>
          <br />
          {t('lab.positioningNote')}
        </Reveal>
        <div className="node-grid">
          {Array.isArray(phases) &&
            phases.map((phase, index) => (
              <Reveal key={phase.title} className="node" delay={index * 50}>
                <span className="node__index">0{index + 1}</span>
                <h3 className="node__title">{phase.title}</h3>
                <p className="node__body">{phase.body}</p>
              </Reveal>
            ))}
        </div>
      </div>
    </section>
  );
}

export function InfrastructureSection({ locale, t }) {
  const measures = t('infrastructure.measures') || [];
  return (
    <section className="section section--veil" id="infrastructure">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('infrastructure.eyebrow')}</span>
          <h2 className="h2">{t('infrastructure.title')}</h2>
          <p className="lede">{t('infrastructure.body')}</p>
        </Reveal>
        <div className="grid grid--3">
          {Array.isArray(measures) &&
            measures.map((measure, index) => (
              <Reveal key={measure.title} className="card" delay={index * 40}>
                <h3 className="h3" style={{ marginBottom: 'var(--sp-2)' }}>{measure.title}</h3>
                <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>{measure.body}</p>
              </Reveal>
            ))}
        </div>
      </div>
    </section>
  );
}

export function InsightsSection({ locale, t, insights }) {
  const rows = insights?.items?.length ? insights.items : Array.isArray(insights) ? insights : [];
  return (
    <section className="section" id="insights">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('insights.eyebrow')}</span>
          <h2 className="h2">{t('insights.title')}</h2>
          <p className="lede">{t('insights.body')}</p>
        </Reveal>
        {rows.length ? (
          <div className="grid grid--3">
            {rows.map((post, index) => (
              <Reveal key={post.slug || index} className="card" delay={index * 50}>
                <h3 className="h3">{post.title}</h3>
                <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>{post.summary}</p>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="notice">{t('insights.empty')}</div>
        )}
      </div>
    </section>
  );
}

export function ContactSection({ locale, t }) {
  // Server -> client: plain strings only (a function cannot cross the boundary).
  const contactCopy = {
    name: t('contact.name'),
    email: t('contact.email'),
    organisation: t('contact.organisation'),
    topic: t('contact.topic'),
    topics: t('contact.topics'),
    message: t('contact.message'),
    consentLabel: t('contact.consentLabel'),
    submit: t('contact.submit'),
    submitting: t('contact.submitting'),
    success: t('contact.success'),
    body: t('contact.body'),
    errorGeneric: t('contact.errorGeneric'),
    errorDeliveryUnavailable: t('contact.errorDeliveryUnavailable'),
    errorValidation: t('contact.errorValidation'),
    errors: t('contact.errors'),
    fallbackPrompt: t('contact.fallbackPrompt'),
    whatsappButton: t('contact.whatsappButton'),
    emailButton: t('contact.emailButton'),
    directWhatsappButton: t('contact.directWhatsappButton'),
    directEmailButton: t('contact.directEmailButton'),
    externalSendNote: t('contact.externalSendNote')
  };

  return (
    <section className="section section--veil" id="contact">
      <div className="shell">
        <Reveal className="section-head">
          <span className="eyebrow">{t('contact.eyebrow')}</span>
          <h2 className="h2">{t('contact.title')}</h2>
          <p className="lede">{t('contact.body')}</p>
        </Reveal>
        <div className="grid grid--2" style={{ alignItems: 'start' }}>
          <Reveal>
            <ContactForm locale={locale} copy={contactCopy} />
          </Reveal>
          <Reveal delay={80} className="stack">
            <div className="card">
              <h3 className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{t('contact.channelsLabel')}</h3>
              <p className="hint" style={{ margin: 0 }}>{t('contact.channelsPending')}</p>
              <div className="stack stack--sm" style={{ marginTop: 'var(--sp-4)' }}>
                <a className="btn btn--ghost" href={`mailto:${formCopy.contactChannels.email}`}>
                  {t('contact.directEmailButton')} · {formCopy.contactChannels.email}
                </a>
                <a
                  className="btn btn--ghost"
                  href={`https://wa.me/${formCopy.contactChannels.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('contact.directWhatsappButton')} · {formCopy.contactChannels.phoneDisplay}
                </a>
              </div>
            </div>
            <div className="card">
              <h3 className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{t('infrastructure.title')}</h3>
              <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>
                {locale === 'ar'
                  ? 'يُعاد التحقق من كل طلب على الخادم، ويُخضع لتحديد معدّل، ولا تُرسل أي أسرار إلى المتصفح.'
                  : 'Every submission is re-validated on the server, rate limited, and no secrets are ever sent to the browser.'}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

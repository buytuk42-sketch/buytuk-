'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';
import formCopy from '@/content/cms/contact-form.json';

/* ---------------------------------------------------------------------------
   Request-oriented contact form (brief §8).

   This is a client component, so it receives a *plain copy object* from the
   server rather than a translator function. The extra request fields live in
   content/cms/contact-form.json and are merged in here, so the form is fully
   specified without the server having to forward every string.

   Validation here is a courtesy; /api/contact re-checks every field server-side.
   A hidden honeypot catches naive bots, and submission requires explicit consent.
   --------------------------------------------------------------------------- */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()0-9\s\-.]{6,24}$/;

const EMPTY = {
  name: '', email: '', phone: '', organisation: '',
  clientType: '', industry: '', solution: '', budget: '',
  message: '', consent: false, trap: ''
};

export default function ContactForm({ locale, copy }) {
  const isAr = locale === 'ar';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[locale] ?? v.en : v);
  const list = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[locale] ?? v.en : v) || [];

  const f = formCopy.fields;
  const OPTIONAL = pick(formCopy.optionalHint);
  const PH = pick(f.selectPlaceholder);

  const topicOrder = ['product', 'partnership', 'education', 'ai', 'press', 'other'];
  const topics = topicOrder
    .filter((key) => copy.topics && copy.topics[key])
    .map((key) => ({ value: key, label: copy.topics[key] }));

  const [values, setValues] = useState({ ...EMPTY, topic: topics[0]?.value || 'other' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  const set = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  function validate() {
    const next = {};
    if (!values.name.trim()) next.name = copy.errors.name;
    if (!EMAIL.test(values.email.trim())) next.email = copy.errors.email;
    if (values.phone.trim() && !PHONE.test(values.phone.trim())) {
      next.phone = isAr ? 'يُرجى إدخال رقم هاتف صحيح.' : 'Please enter a valid phone number.';
    }
    if (values.message.trim().length < 20) next.message = copy.errors.message;
    if (!values.consent) next.consent = copy.errors.consent;
    return next;
  }

  async function onSubmit(event) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      setStatus('invalid');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, locale })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429) setErrors({ form: copy.errors.rate });
        else if (data.error === 'delivery_unavailable') setErrors({ form: copy.errorDeliveryUnavailable });
        else if (res.status === 413) setErrors({ form: copy.errorGeneric });
        else if (data.errors) setErrors(data.errors);
        else setErrors({ form: copy.errorGeneric });
        setStatus('error');
        return;
      }
      track('contact_submit', { topic: values.topic, solution: values.solution, clientType: values.clientType });
      setStatus('sent');
      setValues({ ...EMPTY, topic: topics[0]?.value || 'other' });
    } catch {
      setErrors({ form: copy.errorGeneric });
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="card card--feature" role="status" aria-live="polite">
        <p className="h3" style={{ marginBottom: 'var(--sp-3)' }}>{copy.success}</p>
        <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>{copy.body}</p>
      </div>
    );
  }

  const Select = ({ id, label, field, options, optional }) => (
    <div className="field">
      <label htmlFor={id}>
        {label}{optional && <span className="hint" style={{ marginInlineStart: 6 }}>({OPTIONAL})</span>}
      </label>
      <select id={id} name={field} value={values[field]} onChange={set(field)}>
        <option value="">{PH}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <form className="card card--feature stack" onSubmit={onSubmit} noValidate>
      <div className="grid grid--2">
        <div className="field">
          <label htmlFor="cf-name">{copy.name}</label>
          <input
            id="cf-name" name="name" value={values.name} onChange={set('name')}
            autoComplete="name" required maxLength={120}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'cf-name-err' : undefined}
          />
          {errors.name && <span className="field__error" id="cf-name-err">{errors.name}</span>}
        </div>

        <div className="field">
          <label htmlFor="cf-email">{copy.email}</label>
          <input
            id="cf-email" name="email" type="email" value={values.email} onChange={set('email')}
            autoComplete="email" required maxLength={200}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'cf-email-err' : undefined}
          />
          {errors.email && <span className="field__error" id="cf-email-err">{errors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="cf-phone">
            {pick(f.phone)} <span className="hint">({OPTIONAL})</span>
          </label>
          <input
            id="cf-phone" name="phone" type="tel" value={values.phone} onChange={set('phone')}
            autoComplete="tel" maxLength={24} inputMode="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'cf-phone-err' : undefined}
          />
          {errors.phone && <span className="field__error" id="cf-phone-err">{errors.phone}</span>}
        </div>

        <div className="field">
          <label htmlFor="cf-org">
            {pick(f.organisation)} <span className="hint">({OPTIONAL})</span>
          </label>
          <input id="cf-org" name="organisation" value={values.organisation} onChange={set('organisation')} maxLength={160} autoComplete="organization" />
        </div>

        <Select id="cf-client-type" label={pick(f.clientType)} field="clientType" options={list(formCopy.clientTypes)} />
        <Select id="cf-industry" label={pick(f.industry)} field="industry" options={list(formCopy.industries)} />
        <Select id="cf-solution" label={pick(f.solution)} field="solution" options={list(formCopy.solutions)} />
        <Select id="cf-budget" label={pick(f.budget)} field="budget" options={list(formCopy.budgets)} optional />

        <div className="field">
          <label htmlFor="cf-topic">{copy.topic}</label>
          <select id="cf-topic" name="topic" value={values.topic} onChange={set('topic')}>
            {topics.map((topic) => (
              <option key={topic.value} value={topic.value}>{topic.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="cf-message">{pick(f.message)}</label>
        <textarea
          id="cf-message" name="message" rows={6} value={values.message} onChange={set('message')}
          required minLength={20} maxLength={4000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'cf-message-err' : 'cf-message-hint'}
        />
        {errors.message ? (
          <span className="field__error" id="cf-message-err">{errors.message}</span>
        ) : (
          <span className="hint" id="cf-message-hint">{values.message.trim().length}/4000</span>
        )}
      </div>

      {/* Honeypot: invisible to users and assistive tech, tempting to bots. */}
      <div aria-hidden="true" style={{ position: 'absolute', insetInlineStart: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" value={values.trap} onChange={set('trap')} />
      </div>

      <label className="row" style={{ gap: 10, alignItems: 'flex-start', fontSize: 'var(--fs-sm)' }}>
        <input
          type="checkbox" checked={values.consent} onChange={set('consent')}
          aria-invalid={Boolean(errors.consent)}
          style={{ marginTop: 6, width: 16, height: 16 }}
        />
        <span>{copy.consentLabel}</span>
      </label>
      {errors.consent && <span className="field__error">{errors.consent}</span>}
      {errors.form && <span className="field__error" role="alert">{errors.form}</span>}

      <p className="hint" style={{ margin: 0 }}>{pick(formCopy.privacyNote)}</p>

      <div className="row">
        <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
          {status === 'sending' ? copy.submitting : copy.submit}
        </button>
        {status === 'invalid' && <span className="hint" role="alert">{copy.errorValidation}</span>}
      </div>
    </form>
  );
}

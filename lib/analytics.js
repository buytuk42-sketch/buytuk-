// ---------------------------------------------------------------------------
// Privacy-first analytics wrapper (brief §18).
//
// Nothing is sent until the visitor grants consent. The event vocabulary is
// fixed and small: page_view, product_view, cta_click, contact_submit,
// scroll_depth, section_view. No personal data, no cross-site identifiers —
// a per-session random id only, stored in sessionStorage.
// ---------------------------------------------------------------------------

export const ANALYTICS_EVENTS = [
  'page_view',
  'section_view',
  'product_view',
  'cta_click',
  'contact_submit',
  'scroll_depth',
  'language_switch',
  'motion_preference'
];

const CONSENT_KEY = 'buytuk_consent';
const SESSION_KEY = 'buytuk_sid';

let enabled = false;
let queue = [];

function sessionId() {
  if (typeof window === 'undefined') return 'server';
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2, 11);
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

export function getConsent() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export function setConsent(value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* storage blocked — stay opt-out */
  }
  enabled = value === 'granted';
  if (enabled) {
    queue.forEach(send);
    queue = [];
  } else {
    queue = [];
  }
  window.dispatchEvent(new CustomEvent('buytuk:consent', { detail: value }));
}

export function initAnalytics() {
  const consent = getConsent();
  enabled = consent === 'granted';
  if (typeof window !== 'undefined' && !consent) {
    window.addEventListener('buytuk:consent', (e) => {
      if (e.detail === 'granted') {
        enabled = true;
        queue.forEach(send);
        queue = [];
      }
    });
  }
  return enabled;
}

function send(event) {
  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
  if (!endpoint) return; // no endpoint configured: drop silently
  const body = JSON.stringify({
    event: event.name,
    props: event.props || {},
    sid: sessionId(),
    path: typeof window !== 'undefined' ? window.location.pathname : '',
    ts: Date.now()
  });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon(endpoint, body);
    else fetch(endpoint, { method: 'POST', body, keepalive: true });
  } catch {
    /* analytics must never break the page */
  }
}

export function track(name, props = {}) {
  if (!ANALYTICS_EVENTS.includes(name)) return;
  const event = { name, props };
  if (!enabled) {
    queue.push(event);
    if (queue.length > 32) queue.shift();
    return;
  }
  send(event);
}

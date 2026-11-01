import { NextResponse } from 'next/server';

/* ---------------------------------------------------------------------------
   Contact endpoint (brief §16).

   Server-side guarantees, independent of the browser:
     - method locked to POST
     - size guard on the raw body
     - full re-validation of every field (never trust the client)
     - bounded in-memory fixed-window rate limit per IP
     - honeypot field rejection
     - recipient address read from the server environment only (no secrets in
       the frontend bundle)
     - generic error surface: internal details are logged, never returned
   --------------------------------------------------------------------------- */

export const runtime = 'nodejs';

const positiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const WINDOW_MS = positiveInteger(process.env.CONTACT_RATE_WINDOW_MS, 60_000);
const MAX_PER_WINDOW = positiveInteger(process.env.CONTACT_RATE_MAX, 5);
const MAX_BODY_BYTES = 12_000;
const MAX_BUCKETS = 10_000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOPICS = ['product', 'partnership', 'education', 'ai', 'press', 'other'];
// Request fields (brief §8). Enum-ish free text is length-capped and sanitised.
const MAX_SHORT = 120;

// Module-scope store. On serverless this is per-instance; pair it with a
// platform-level limiter (e.g. WAF / KV) for multi-instance deployments.
const buckets = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || now - bucket.start >= WINDOW_MS) {
    if (buckets.size >= MAX_BUCKETS) {
      for (const [key, value] of buckets) {
        if (now - value.start >= WINDOW_MS) buckets.delete(key);
      }
      if (buckets.size >= MAX_BUCKETS) return true;
    }
    buckets.set(ip, { start: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_PER_WINDOW;
}

async function readBodyWithinLimit(request) {
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new RangeError('payload_too_large');
  }
  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => {});
        throw new RangeError('payload_too_large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new TypeError('invalid_encoding');
  }
}

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

// Strips control characters that could be used for header/log injection.
function sanitize(value) {
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim();
}

function getClientIp(request) {
  const candidates = [
    request.ip,
    request.headers.get('x-real-ip'),
    request.headers.get('x-forwarded-for')?.split(',')[0]
  ];
  return candidates
    .map((value) => value?.trim())
    .find((value) => value && value.length <= 64) || 'unknown';
}

export async function POST(request) {
  const ip = getClientIp(request);
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let raw;
  try {
    raw = await readBodyWithinLimit(request);
  } catch (error) {
    if (error instanceof RangeError && error.message === 'payload_too_large') {
      return NextResponse.json({ error: 'payload_too_large' }, { status: 413 });
    }
    if (error instanceof TypeError && error.message === 'invalid_encoding') {
      return NextResponse.json({ error: 'invalid_encoding' }, { status: 400 });
    }
    throw error;
  }

  let body;
  try {
    body = JSON.parse(raw || '{}');
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const locale = body.locale === 'en' ? 'en' : 'ar';

  // Honeypot: a filled hidden field means an automated submission.
  if (clean(body.trap || body.website, 200)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const name = sanitize(clean(body.name, 120));
  const email = sanitize(clean(body.email, 200));
  const phone = sanitize(clean(body.phone, 24));
  const organisation = sanitize(clean(body.organisation, 160));
  const clientType = sanitize(clean(body.clientType, MAX_SHORT));
  const industry = sanitize(clean(body.industry, MAX_SHORT));
  const solution = sanitize(clean(body.solution, MAX_SHORT));
  const budget = sanitize(clean(body.budget, MAX_SHORT));
  const topic = TOPICS.includes(body.topic) ? body.topic : 'other';
  const message = sanitize(clean(body.message, 4000));
  const consent = body.consent === true;

  const errors = {};
  if (!name) errors.name = locale === 'ar' ? 'يُرجى إدخال الاسم.' : 'Please enter your name.';
  if (!EMAIL.test(email)) {
    errors.email = locale === 'ar' ? 'يُرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.';
  }
  if (message.length < 20) {
    errors.message = locale === 'ar' ? 'يُرجى كتابة ٢٠ حرفًا على الأقل.' : 'Please write at least 20 characters.';
  }
  if (phone && !/^[+()0-9\s\-.]{6,24}$/.test(phone)) {
    errors.phone = locale === 'ar' ? 'يُرجى إدخال رقم هاتف صحيح.' : 'Please enter a valid phone number.';
  }
  if (!consent) {
    errors.consent = locale === 'ar' ? 'الموافقة مطلوبة.' : 'Consent is required.';
  }

  if (Object.keys(errors).length) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const payload = {
    name, email, phone, organisation, clientType, industry, solution, budget,
    topic, message, locale, receivedAt: new Date().toISOString()
  };

  // Delivery ---------------------------------------------------------------
  // Never report success unless a delivery provider accepted the enquiry.
  const provider = process.env.CONTACT_PROVIDER;
  const recipient = process.env.CONTACT_INBOX || 'Buytuk1@gmail.com';

  try {
    if (provider === 'resend' && process.env.RESEND_API_KEY && recipient) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM || 'BuyTuk <no-reply@buytuk.com>',
          to: [recipient],
          reply_to: email,
          subject: `[BuyTuk] ${topic} — ${name}`,
          text: [
            `Name: ${name}`,
            `Email: ${email}`,
            `Phone: ${phone || '-'}`,
            `Organisation: ${organisation || '-'}`,
            `Client type: ${clientType || '-'}`,
            `Sector: ${industry || '-'}`,
            `Solution requested: ${solution || '-'}`,
            `Budget: ${budget || '-'}`,
            `Topic: ${topic}`,
            `Locale: ${locale}`,
            `Received: ${payload.receivedAt}`,
            '',
            message
          ].join('\n')
        })
      });
      if (!res.ok) {
        console.error('[contact] provider rejected the message', res.status);
        return NextResponse.json({ error: 'delivery_failed' }, { status: 502 });
      }
    } else {
      console.error('[contact] delivery is not configured');
      return NextResponse.json({ error: 'delivery_unavailable' }, { status: 503 });
    }
  } catch (error) {
    console.error('[contact] delivery error', error?.message);
    return NextResponse.json({ error: 'delivery_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export function GET() {
  // The endpoint is write-only; a GET is an explicit method error.
  return NextResponse.json({ error: 'method_not_allowed' }, { status: 405, headers: { Allow: 'POST' } });
}

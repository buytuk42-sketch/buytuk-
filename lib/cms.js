// ---------------------------------------------------------------------------
// Headless-CMS content layer (brief §17).
//
// Content that changes without a code deploy — products, projects, insights,
// team, milestones, announcements — is read through this module only.
//
// Modes
//   1. CMS_ENDPOINT set   -> fetch from the headless CMS (ISR, tagged revalidate)
//   2. no endpoint        -> read the committed JSON in /content/cms
//
// Every record carries `verified`. Rows with verified:false are rendered with a
// visible "pending documentation" marker, so nothing unproven is ever presented
// as a shipped BuyTuk fact (brief §8 / §20).
// ---------------------------------------------------------------------------

import products from '@/content/cms/products.json';
import projects from '@/content/cms/projects.json';
import insights from '@/content/cms/insights.json';
import journey from '@/content/cms/journey.json';
import metrics from '@/content/cms/metrics.json';
import site from '@/content/cms/site.json';
import hero from '@/content/cms/hero.json';
import company from '@/content/cms/company.json';
import legal from '@/content/cms/legal.json';
import social from '@/content/cms/social.json';

const LOCAL = { products, projects, insights, journey, metrics, site, hero, company, legal, social };

const ENDPOINT = process.env.CMS_ENDPOINT || '';
const TOKEN = process.env.CMS_READ_TOKEN || '';
const REVALIDATE = Number(process.env.CMS_REVALIDATE_SECONDS || 300);

async function remote(collection) {
  const res = await fetch(`${ENDPOINT}/content/${collection}`, {
    headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
    next: { revalidate: REVALIDATE, tags: [`buytuk:${collection}`] }
  });
  if (!res.ok) throw new Error(`CMS ${collection} failed: ${res.status}`);
  return res.json();
}

async function read(collection) {
  if (ENDPOINT) {
    try {
      return await remote(collection);
    } catch (error) {
      // Never break the page because the CMS is down: degrade to committed copy.
      console.error(`[cms] ${collection}: ${error.message}`);
    }
  }
  return LOCAL[collection];
}

export async function getProducts(locale = 'en') {
  const rows = await read('products');
  return (rows || []).map((row) => normalizeProduct(row, locale));
}

export async function getProduct(slug, locale = 'en') {
  const all = await getProducts(locale);
  return all.find((item) => item.slug === slug) || null;
}

/**
 * Product copy is stored bilingual as { ar, en } (brief §11). Localisation
 * happens here, at the CMS boundary, so every consumer keeps receiving plain
 * strings for the locale it asked for and can never leak one language into the
 * other. The untouched bilingual record is preserved on `i18n` for schema use.
 */
function localise(value, locale) {
  if (value && typeof value === 'object' && !Array.isArray(value) && ('ar' in value || 'en' in value)) {
    return value[locale] ?? value.en ?? value.ar ?? '';
  }
  return value;
}

export async function getProjects() {
  return (await read('projects')) || [];
}

export async function getInsights() {
  return (await read('insights')) || [];
}

export async function getJourney() {
  return (await read('journey')) || [];
}

export async function getMetrics() {
  return (await read('metrics')) || [];
}

export async function getSiteContent() {
  return site;
}

/**
 * Hero copy is content, not markup (brief §4: "must be editable from CMS").
 * Falls back to the committed JSON when no CMS endpoint is configured.
 */
export async function getHeroContent(locale = 'en') {
  const data = (await read('hero')) || hero;
  const pick = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value[locale] ?? value.en : value);
  return {
    eyebrow: pick(data.eyebrow),
    statement: pick(data.statement),
    subtitle: pick(data.subtitle),
    primaryCta: { label: pick(data.primaryCta?.label), href: data.primaryCta?.href || '#ecosystem' },
    secondaryCta: { label: pick(data.secondaryCta?.label), href: data.secondaryCta?.href || '#contact' }
  };
}

function normalizeProduct(row, locale = 'en') {
  // claim: product | platform | capability | solution (brief §3, §9).
  const claim = row.claim || 'product';
  const caseStudy = row.caseStudy
    ? { ...row.caseStudy, summary: localise(row.caseStudy.summary, locale) }
    : null;
  const cta = row.cta
    ? { href: row.cta.href, label: localise(row.cta.label, locale) || '' }
    : null;
  return {
    slug: row.slug,
    claim,
    name: localise(row.name, locale),
    tagline: localise(row.tagline, locale) || '',
    description: localise(row.description, locale) || '',
    status: row.status || 'coming-soon',
    category: row.category || '',
    problem: localise(row.problem, locale) || '',
    features: localise(row.features, locale) || [],
    technology: localise(row.technology, locale) || [],
    screenshots: row.screenshots || [],
    caseStudy,
    cta,
    // Preserved bilingual source so a schema export never loses a language.
    i18n: {
      name: row.name, tagline: row.tagline, description: row.description,
      problem: row.problem, features: row.features, technology: row.technology
    },
    verified: Boolean(row.verified),
    // Where the claim can actually be checked (repo, app store, press, doc).
    evidence: row.evidence || [],
    updatedAt: row.updatedAt || null
  };
}

export { LOCAL as LOCAL_CONTENT };

/* ---------------------------------------------------------------------------
   Official company data, social accounts and legal documents (Phases 6, 7).
   These are deliberately "closed by default": a field renders only when it has
   a real value AND its container is published. Nothing is ever guessed.
   --------------------------------------------------------------------------- */

export async function getCompany() {
  return (await read('company')) || company;
}

/** Only accounts a human opened and confirmed, and only ones marked published. */
export async function getSocialAccounts() {
  const data = (await read('social')) || social;
  const list = Array.isArray(data?.accounts) ? data.accounts : [];
  return list.filter((account) => account && account.published === true && account.verified === true && account.url);
}

export async function getLegal() {
  return (await read('legal')) || legal;
}

/** Returns a document only when it is explicitly published, else null (=> 404). */
export async function getLegalDoc(slug) {
  const all = await getLegal();
  const doc = all?.[slug];
  if (!doc || doc.published !== true) return null;
  return { ...doc, slug: doc.slug || slug };
}

/** Contact channels that are actually approved for publication. */
export async function getPublishedChannels() {
  const data = await getCompany();
  if (data.published !== true) return { emails: [], phones: [], address: null, pendingNote: data.pendingNote || null };
  const emails = Object.entries(data.email || {})
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => ({ key, value }));
  const phones = Object.entries(data.phone || {})
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => ({ key, value }));
  return { emails, phones, address: data.registeredAddress || null, pendingNote: null };
}

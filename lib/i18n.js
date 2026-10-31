import en from '@/content/dictionaries/en.json';
import ar from '@/content/dictionaries/ar.json';
import { DEFAULT_LOCALE, LOCALES, LOCALE_DIR } from '@/lib/site';

const DICTIONARIES = { en, ar };

export function isLocale(value) {
  return LOCALES.includes(value);
}

export function getDirection(locale) {
  return LOCALE_DIR[locale] || LOCALE_DIR[DEFAULT_LOCALE];
}

/**
 * Returns a `t` function bound to a locale.
 *   const t = getTranslator(locale);
 *   t('hero.statement')            -> string
 *   t('products.items.0.name')     -> string
 *   t('products.items')            -> array | object
 *   t('some.missing.key', 'fallback')
 *
 * A purpose-built, dependency-free dictionary layer. It mirrors the shape of
 * an ICU message catalogue, so migrating to next-intl later is a drop-in swap
 * (see README → "Swapping the i18n layer").
 */
export function getTranslator(locale) {
  const dict = DICTIONARIES[isLocale(locale) ? locale : DEFAULT_LOCALE];
  const fallback = DICTIONARIES[DEFAULT_LOCALE];

  return function t(path, fallbackValue = '') {
    const read = (source) =>
      path.split('.').reduce((acc, part) => {
        if (acc === undefined || acc === null) return undefined;
        return acc[part];
      }, source);

    const value = read(dict);
    if (value !== undefined) return value;
    const fb = read(fallback);
    return fb !== undefined ? fb : fallbackValue;
  };
}

export function getDictionary(locale) {
  return DICTIONARIES[isLocale(locale) ? locale : DEFAULT_LOCALE];
}

export function listAlternates(currentLocale, path = '') {
  return LOCALES.filter((l) => l !== currentLocale).map((l) => ({
    locale: l,
    href: `/${l}${path === '/' ? '' : path}`
  }));
}

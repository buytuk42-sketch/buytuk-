'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Locale-aware link. Every internal href is prefixed with the active locale so
 * navigation never leaks between /ar and /en (brief §14).
 *
 * Hash targets are treated as locale paths too: a CTA of `#contact` becomes
 * `/ar#contact` (or `/en#contact`). That way the same CTA works on the home
 * page *and* on a product page, where the contact section does not exist
 * locally — a bare `#contact` there would be a dead anchor, and a bare
 * `/contact` would 404.
 */
export function LocalizedLink({ locale, href, children, ...rest }) {
  const pathname = usePathname();
  const raw = typeof href === 'string' ? href : '';

  const hashAt = raw.indexOf('#');
  const path = hashAt === -1 ? raw : raw.slice(0, hashAt);
  const hash = hashAt === -1 ? '' : raw.slice(hashAt);

  if (!raw) return <a href={raw} {...rest}>{children}</a>;

  const clean = path === '/' || path === '' ? '' : path;
  const target = `/${locale}${clean}${hash}`;

  const isSamePage = hashAt === 0 && typeof pathname === 'string' && pathname === `/${locale}`;

  if (isSamePage) {
    return <a href={hash} {...rest}>{children}</a>;
  }

  return <Link href={target} {...rest}>{children}</Link>;
}

export default LocalizedLink;

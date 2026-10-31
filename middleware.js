import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Locale routing (brief §14): Arabic RTL is the default, English LTR secondary.
// Every public route lives under /ar or /en so that SSG, RTL and hreflang stay
// deterministic. API routes and static assets are excluded by the matcher.
// ---------------------------------------------------------------------------
export const LOCALES = ['ar', 'en'];
export const DEFAULT_LOCALE = 'ar';

function detectLocale(request) {
  const cookie = request.cookies.get('BUYTUK_LOCALE')?.value;
  if (cookie && LOCALES.includes(cookie)) return cookie;

  const accept = request.headers.get('accept-language') || '';
  for (const part of accept.split(',')) {
    const tag = part.split(';')[0].trim().toLowerCase();
    if (tag.startsWith('ar')) return 'ar';
    if (tag.startsWith('en')) return 'en';
  }
  return DEFAULT_LOCALE;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const pathLocale = LOCALES.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );

  if (pathLocale) {
    const response = NextResponse.next();
    response.headers.set('x-buytuk-locale', pathLocale);
    // Persist the visitor's locale so the next root/unknown-path request is
    // routed back to the same language instead of re-sniffing Accept-Language.
    response.cookies.set('BUYTUK_LOCALE', pathLocale, {
      path: '/',
      maxAge: 31_536_000,
      sameSite: 'lax'
    });
    return response;
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  const redirect = NextResponse.redirect(url);
  redirect.cookies.set('BUYTUK_LOCALE', locale, {
    path: '/',
    maxAge: 31_536_000,
    sameSite: 'lax'
  });
  return redirect;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|.*\\..*).*)']
};

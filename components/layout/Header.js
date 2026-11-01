'use client';

import { useState } from 'react';
import { LocalizedLink } from '@/components/ui/LocalizedLink';
import MotionToggle from '@/components/ui/MotionToggle';

/**
 * Sticky header. Collapses to a disclosure menu below 1024px, swaps the
 * language switch, and carries the motion toggle (brief §6, §7, §14).
 */
export default function Header({ locale, path = '' }) {
  const [open, setOpen] = useState(false);
  const isAr = locale === 'ar';
  const other = isAr ? 'en' : 'ar';

  const nav = isAr
    ? [
        { href: '/#ecosystem', label: 'المنظومة' },
        { href: '/#technology', label: 'التقنية' },
        { href: '/products', label: 'المنتجات' },
        { href: '/services', label: 'الحلول' },
        { href: '/ai-lab', label: 'مختبر الذكاء الاصطناعي' },
        { href: '/#contact', label: 'تواصل' }
      ]
    : [
        { href: '/#ecosystem', label: 'Ecosystem' },
        { href: '/#technology', label: 'Technology' },
        { href: '/products', label: 'Products' },
        { href: '/services', label: 'Solutions' },
        { href: '/ai-lab', label: 'AI Lab' },
        { href: '/#contact', label: 'Contact' }
      ];

  return (
    <header className="site-header" data-scrolled="false" id="site-header">
      <div className="shell site-header__inner">
        <LocalizedLink locale={locale} href="/" className="brand" aria-label="BuyTuk">
          <svg className="brand__mark" viewBox="0 0 40 40" role="img" aria-hidden="true">
            <defs>
              <linearGradient id="buytuk-arc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4ce0ff" />
                <stop offset="50%" stopColor="#6f7bff" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <path
              className="arc"
              d="M6 30 A14 14 0 0 1 34 30"
              fill="none"
              stroke="url(#buytuk-arc)"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeDasharray="260"
            />
            <circle cx="20" cy="30" r="3.2" fill="url(#buytuk-arc)" />
          </svg>
          <span className="brand__name">BuyTuk</span>
          <span className="brand__tag">{isAr ? 'نبني ما يأتي بعد ذلك' : 'We Build What Comes Next'}</span>
        </LocalizedLink>

        <nav className="nav" data-open={open ? 'true' : 'false'} aria-label={isAr ? 'التنقل الرئيسي' : 'Primary'}>
          {nav.map((item) => (
            <LocalizedLink
              key={item.href}
              locale={locale}
              href={item.href}
              className="nav__link"
              aria-current={path === item.href ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </LocalizedLink>
          ))}
        </nav>

        <div className="header-actions">
          <MotionToggle locale={locale} />
          <span className="lang-switch" role="group" aria-label={isAr ? 'اللغة' : 'Language'}>
            <LocalizedLink locale={locale} href={path || '/'} data-active="true" aria-current="true">
              {isAr ? 'ع' : 'EN'}
            </LocalizedLink>
            <LocalizedLink locale={other} href={path || '/'}>
              {other === 'ar' ? 'ع' : 'EN'}
            </LocalizedLink>
          </span>
          <LocalizedLink locale={locale} href="/#contact" className="btn btn--primary">
            {isAr ? 'تواصل معنا' : 'Talk to us'}
          </LocalizedLink>
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? (isAr ? 'إغلاق' : 'Close') : isAr ? 'القائمة' : 'Menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true">{open ? '×' : '≡'}</span>
        </button>
      </div>
    </header>
  );
}

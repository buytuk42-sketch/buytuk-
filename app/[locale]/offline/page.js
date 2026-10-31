import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

export const metadata = { title: 'غير متصل — BuyTuk' };

export default function OfflinePage({ params }) {
  if (!isLocale(params.locale)) notFound();
  const ar = params.locale === 'ar';
  return (
    <main id="main" dir={ar ? 'rtl' : 'ltr'} className="container section" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <div className="card" style={{ maxWidth: 620, padding: 'var(--sp-6)', textAlign: 'center' }}>
        <h1 className="h2">{ar ? 'لا يوجد اتصال بالإنترنت' : 'You are offline'}</h1>
        <p className="lead">
          {ar
            ? 'تعذّر الوصول إلى الشبكة الآن. المحتوى الذي زرته سابقًا قد يظل متاحًا، ويمكنك إعادة المحاولة بعد عودة الاتصال.'
            : 'The network is unreachable right now. Previously visited content may still be available; try again once your connection returns.'}
        </p>
        <p style={{ opacity: .8 }}>
          {ar ? 'BuyTuk — منظومة منتجات ومنصات وحلول رقمية.' : 'BuyTuk — products, platforms and digital solutions.'}
        </p>
        <a className="btn btn--primary" href={ar ? '/ar' : '/en'}>{ar ? 'إعادة المحاولة' : 'Try again'}</a>
      </div>
    </main>
  );
}

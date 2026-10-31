// PWA manifest — served by Next.js at /manifest.webmanifest
export default function manifest() {
  return {
    name: 'BuyTuk — شركة تقنية ومنظومة منتجات رقمية',
    short_name: 'BuyTuk',
    description: 'BuyTuk تبني منظومة منتجات ومنصات وحلول رقمية، مع أكاديمية ومختبر ذكاء اصطناعي.',
    lang: 'ar',
    dir: 'rtl',
    start_url: '/ar',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#04070f',
    background_color: '#04070f',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ],
    shortcuts: [
      { name: 'English', short_name: 'EN', url: '/en' },
      { name: 'المنتجات', short_name: 'المنتجات', url: '/ar/products' }
    ]
  };
}

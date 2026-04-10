import localFont from 'next/font/local';

export const manrope = localFont({
  src: [
    {
      path: '../public/fonts/manrope-cyrillic.woff2',
      weight: '200 800',
      style: 'normal',
    },
    {
      path: '../public/fonts/manrope-cyrillic-ext.woff2',
      weight: '200 800',
      style: 'normal',
    },
    {
      path: '../public/fonts/manrope-latin.woff2',
      weight: '200 800',
      style: 'normal',
    },
    {
      path: '../public/fonts/manrope-latin-ext.woff2',
      weight: '200 800',
      style: 'normal',
    },
  ],
  variable: '--font-manrope',
  display: 'swap',
});


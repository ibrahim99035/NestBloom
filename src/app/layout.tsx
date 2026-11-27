import type { Metadata } from 'next';
import Head from 'next/head';
import { AuthProvider } from '@/components/AuthProvider';
import { Amiri, Cairo } from 'next/font/google';
import './globals.css';

const amiri = Amiri({
  variable: '--font-amiri',
  subsets: ['arabic'],
  weight: '400',
});

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic'],
  weight: ['400', '600'],
});

export const metadata: Metadata = {
  title: 'نِست بلوم | NestBloom',
  description: 'رحلتك في الحمل… يوم بيوم بجمال واهتمام',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable} h-full antialiased`}>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="نست بلوم" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>
      <body className="min-h-full flex flex-col bg-[#fdfbf7] text-[#453a32]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

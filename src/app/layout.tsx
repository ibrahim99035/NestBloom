import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/components/AuthProvider';
import PwaRegister from '@/components/PwaRegister';
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
  manifest: '/manifest.json',
  applicationName: 'نست بلوم',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'نست بلوم',
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fdfbf7] text-[#453a32]">
        <AuthProvider>{children}</AuthProvider>
        <PwaRegister />
      </body>
    </html>
  );
}

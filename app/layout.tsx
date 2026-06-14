import type { Metadata } from 'next';
import { Cormorant_Garamond, Noto_Serif_JP } from 'next/font/google';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/ui/CustomCursor';
import DeferredPageLoader from '@/components/scroll/DeferredPageLoader';
import SmoothScrollProvider from '@/components/scroll/SmoothScrollProvider';
import './globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  preload: true,
});

const notoSerifJp = Noto_Serif_JP({
  variable: '--font-serif-jp',
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
  preload: true,
});

/** Latin serif fallback — Cormorant covers display; alias for token compatibility */
const serifLatin = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'SHAPE∞D - AIで効率化し、本来の創造に集中する環境を作る',
  description:
    '最新のAIスタックによる、安全かつ圧倒的な開発速度の実現。AIエンジニア / 事業家としての提供価値',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${cormorant.variable} ${notoSerifJp.variable} ${serifLatin.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScrollProvider>
          <CustomCursor />
          <DeferredPageLoader />
          {children}
        </SmoothScrollProvider>
        <Footer />
      </body>
    </html>
  );
}

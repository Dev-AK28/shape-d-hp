import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Noto_Serif_JP } from 'next/font/google';
import SubPageEffects from '@/components/scroll/SubPageEffects';
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

export const viewport: Viewport = {
  viewportFit: 'cover',
};

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
      className={`${cormorant.variable} ${notoSerifJp.variable} h-full antialiased`}
    >
      {/* Navigation / Footer は app/(site)/layout.tsx（下層ページ）へ移設 — Issue #303。
          トップページのシェルは components/top/TopShell。
          CustomCursor / PageLoader / MicroInteraction はトップで無効化（#312・SubPageEffects）。
          SmoothScrollProvider はトップ 1.8/skewなし・下層 1.4/skewあり を内部で切替（#312）。 */}
      <body className="min-h-full flex flex-col">
        <SmoothScrollProvider>
          <SubPageEffects />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

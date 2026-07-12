import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond } from 'next/font/google';
import SubPageEffects from '@/components/scroll/SubPageEffects';
import SmoothScrollProvider from '@/components/scroll/SmoothScrollProvider';
import LazyMotionProvider from '@/components/ui/LazyMotionProvider';
import './globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  viewportFit: 'cover',
};

const SITE_TITLE = 'SHAPE∞D — 想いを、動くかたちに。自己一致 × AIエンジニアリング';
const SITE_DESCRIPTION =
  '機能だけなら、誰でもつくれる。私たちは、想いまで実装する。SHAPE∞Dは、会社の「らしさ」を最大限反映したシステムをつくる、自己一致 × AIエンジニアリングのスタジオです。';

export const metadata: Metadata = {
  // #313: 参照HTMLのタイトルへ更新 + OGP / Twitter カード整備
  metadataBase: new URL('https://www.shape-d.com'),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/',
    siteName: 'SHAPE∞D',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${cormorant.variable} h-full antialiased`}>
      {/* Navigation / Footer は app/(site)/layout.tsx（下層ページ）へ移設 — Issue #303。
          Noto Serif JP（--font-serif-jp）の next/font 読み込みは削除 — Issue #401
          （japanese サブセットが存在せず、日本語本文は元々 globals.css のフォールバックで描画されていたため）。
          トップページのシェルは components/top/TopShell。
          CustomCursor / PageLoader / MicroInteraction はトップで無効化（#312・SubPageEffects）。
          SmoothScrollProvider はトップ 1.8/skewなし・下層 1.4/skewあり を内部で切替（#312）。 */}
      <body className="min-h-full flex flex-col">
        <LazyMotionProvider>
          <SmoothScrollProvider>
            <SubPageEffects />
            {children}
          </SmoothScrollProvider>
        </LazyMotionProvider>
      </body>
    </html>
  );
}

import { Noto_Serif_JP } from 'next/font/google';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';

/**
 * 下層ページ共通シェル — Issue #303
 *
 * トップページ刷新（#302）に伴い、既存の Navigation / Footer を下層ページ
 * （/contact, /philosophy, /process, /services, /works）限定に移設。
 * トップページ（app/page.tsx）は components/top/TopShell を使う。
 * SmoothScrollProvider 等の演出インフラは当面ルートレイアウトに残す（#312 で制御方針を確定）。
 *
 * Noto Serif JP（--font-serif-jp）は下層専用のためここで宣言する — Issue #326。
 * next/font はフォント CSS を使用したレイアウト配下にのみ含めるため、トップページでは
 * ロードされない。ラッパーは display: contents（.contents）でボックスを生成せず、
 * body 直下の flex レイアウトを変えない。globals.css の body font-family は
 * var(--font-serif-jp) が未定義でも同じフォールバックへ落ちるよう、ここで
 * .type-font-serif-jp（同一のフォントスタック）を適用して下層全体へ継承させる。
 */
const notoSerifJp = Noto_Serif_JP({
  variable: '--font-serif-jp',
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
  preload: true,
});

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${notoSerifJp.variable} type-font-serif-jp contents`}>
      <Navigation />
      {children}
      <Footer />
    </div>
  );
}

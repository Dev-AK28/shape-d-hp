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
 * Noto Serif JP の next/font 読み込みは削除 — Issue #401。
 * next/font/google の Noto Serif JP には `japanese` サブセットが存在せず
 * （font-data.json 上は cyrillic/latin/latin-ext/vietnamese のみ）、この本文コピーは
 * ほぼ全て日本語のためダウンロードした本体は実質使われず、日本語は元々
 * globals.css のフォールバック（Hiragino Mincho ProN / Yu Mincho）で描画されていた。
 * --font-serif-jp はそのフォールバックスタックそのものを指す通常の CSS 変数として
 * globals.css の :root で直接定義する（.type-font-serif-jp と同じ値）。
 * ラッパーは display: contents（.contents）でボックスを生成せず、body 直下の
 * flex レイアウトを変えない。
 */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="type-font-serif-jp contents">
      <Navigation />
      {children}
      <Footer />
    </div>
  );
}

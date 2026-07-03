import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';

/**
 * 下層ページ共通シェル — Issue #303
 *
 * トップページ刷新（#302）に伴い、既存の Navigation / Footer を下層ページ
 * （/contact, /philosophy, /process, /services, /works）限定に移設。
 * トップページ（app/page.tsx）は components/top/TopShell を使う。
 * SmoothScrollProvider 等の演出インフラは当面ルートレイアウトに残す（#312 で制御方針を確定）。
 */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}

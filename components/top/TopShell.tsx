import type { ReactNode } from 'react';
import TopFooter from '@/components/top/TopFooter';
import TopNav from '@/components/top/TopNav';
import TopThread from '@/components/top/TopThread';
import { jetBrainsMono, shipporiMincho, zenKakuGothicNew } from '@/components/top/top-fonts';
import { topShell } from '@/lib/design/tokens';

/**
 * トップページ共通シェル — Issue #303
 *
 * .top-scope が新フォント（next/font 変数）と新カラートークンをトップページ限定で
 * 有効化する（#302 基本方針: 下層ページは既存トークン・既存フォント維持）。
 * 注意: この要素に transform / filter を追加しないこと — 配下の fixed 要素
 * （#thread / .top-nav / CosmicScene）の基準が viewport でなくなる。
 */
export default function TopShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${topShell.scopeClass} ${shipporiMincho.variable} ${zenKakuGothicNew.variable} ${jetBrainsMono.variable}`}
    >
      <TopThread />
      <TopNav />
      {children}
      <TopFooter />
    </div>
  );
}

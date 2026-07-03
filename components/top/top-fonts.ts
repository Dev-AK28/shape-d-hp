/**
 * トップページ刷新（#302）専用フォント — Issue #303
 *
 * このモジュールをトップページ（TopShell）以外から import しないこと。
 * next/font はフォント CSS を「使用したページ」にのみ含めるため、ここで宣言した
 * フォントはトップページ限定になる（#302 基本方針: 下層ページは既存フォント維持）。
 * Cormorant Garamond（--latin）は app/layout.tsx の既存 --font-display を流用する。
 *
 * 変数名は lib/design/tokens.ts の topNextFontCssVars と同期。
 * ウェイトは参照HTML L9 の Google Fonts クエリと同一。
 */
import { JetBrains_Mono, Shippori_Mincho, Zen_Kaku_Gothic_New } from 'next/font/google';

export const shipporiMincho = Shippori_Mincho({
  variable: '--font-shippori-mincho',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  preload: true,
});

export const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  variable: '--font-zen-kaku-gothic-new',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  preload: true,
});

export const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
  preload: true,
});

# Shape-D HP 仕様（Spec SSOT）

## 概要

Shape-D コーポレートサイト。Next.js App Router による静的・動的ページ構成。

## ページ一覧

| パス | 説明 |
|------|------|
| `/` | トップ（参照デザイン刷新・#302。`components/top/` の TopHero / TopPhilosophy / TopPain / TopTheory / TopServices / TopProcess / TopProfile / TopCta） |
| `/services` | サービス紹介 |
| `/works` | 実績 |
| `/process` | 制作の流れハブ |
| `/process/development` | システム開発プロセス |
| `/process/consulting` | 自己表現力向上プロセス |
| `/philosophy` | 哲学（SHAPE∞D アクロニム）— [philosophy-page.md](./philosophy-page.md)（#81） |
| `/contact` | お問い合わせフォーム |

## デザインシステム

- dark/minimal カラーパレット・タイポグラフィ・spacing・motion tokens
- 詳細: [design-system.md](./design-system.md)（#78）

## スクロールアニメーション

- Lenis によるスムーズスクロール（`shouldDisableSmoothScroll`: reduced-motion / mobile / coarse pointer 時は無効）
- `ScrollReveal` / `TextReveal` によるセクションリビール
- `getScrollRevealProps()` による easing / viewport / variant の SSOT 統一
- 初回訪問時の `PageLoader`（軽量ローディング体験・下層ページ）
- 詳細: [scroll-animation.md](./scroll-animation.md)（#16）

## トップページ パーティクルローダー

- トップ表示時に毎回、粒子が 6 フェーズ・約 10 秒で SHAPE∞D ロゴを板厚付きの立体として形成し、実ロゴへバトンタッチする three.js ローディング演出（背景は完全不透明・SSR）
- 詳細: [top-particle-loader.md](./top-particle-loader.md)（#412 / #414 / #416 / #418）

## ファビコン

- `app/icon.png`（32×32）/ `app/apple-icon.png`（180×180）静的 PNG
- 再生成: `node scripts/generate-favicon.mjs`（元画像 `public/shape-d-logo-transparent.png`）
- 詳細: [favicon.md](./favicon.md)（#50）

## セキュリティレスポンスヘッダー

- `next.config.ts` の `headers()` で全ルートに X-Frame-Options / X-Content-Type-Options / Referrer-Policy / Permissions-Policy / Strict-Transport-Security を付与（CSP は別途対応）
- 詳細: [security-headers.md](./security-headers.md)（#437）

## 完了条件

- 全ページがビルド成功する
- lint / typecheck / test が CI で通過する
- お問い合わせ API が入力検証・レート制限を持つ

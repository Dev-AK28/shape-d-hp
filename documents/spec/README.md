# Shape-D HP 仕様（Spec SSOT）

## 概要

Shape-D コーポレートサイト。Next.js App Router による静的・動的ページ構成。

## ページ一覧

| パス | 説明 |
|------|------|
| `/` | トップ（Hero, About, MissionVision） |
| `/services` | サービス紹介 |
| `/works` | 実績 |
| `/process` | 制作の流れハブ |
| `/process/development` | システム開発プロセス |
| `/process/consulting` | 自己表現力向上プロセス |
| `/philosophy` | 哲学（SHAPE∞D アクロニム） |
| `/contact` | お問い合わせフォーム |

## スクロールアニメーション

- Lenis によるスムーズスクロール（`prefers-reduced-motion` 時は無効）
- `ScrollReveal` / `TextReveal` / `ParallaxSection` によるセクションリビール
- `getScrollRevealProps()` による easing / viewport / variant の SSOT 統一
- 初回訪問時の `PageLoader`（軽量ローディング体験）
- 詳細: [scroll-animation.md](./scroll-animation.md)（#16）

## 完了条件

- 全ページがビルド成功する
- lint / typecheck / test が CI で通過する
- お問い合わせ API が入力検証・レート制限を持つ

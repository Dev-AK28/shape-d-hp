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

- Lenis によるスムーズスクロール（`prefers-reduced-motion`・モバイル・タッチ端末では無効）
- `ScrollReveal` / `TextReveal` によるセクションリビール
- 初回訪問時の `PageLoader`（軽量ローディング体験）

## モバイルパフォーマンス

- 仕様: [`mobile-performance.md`](./mobile-performance.md)
- 星背景・ネビュラ・Lenis・画像をモバイル向けに段階的縮小
- 画像 WebP 化: `npm run optimize:images`

## 星背景

Issue: #1

- 仕様: [`star-background.md`](./star-background.md)
- 共通コンポーネント `StarBackground` により ESLint `react-hooks/set-state-in-effect` を解消

## 依存関係セキュリティ

Issue: #2

- 仕様: [`dependencies.md`](./dependencies.md)
- `next` は `16.2.9` 以上を維持（CVE 対応）
- `postcss` は `package.json` の `overrides` で `^8.5.10` 以上に固定
- 更新後は `npm audit` が 0 vulnerabilities、`npm run build` が成功すること

## 完了条件

- 全ページがビルド成功する
- lint / typecheck / test が CI で通過する
- お問い合わせ API が入力検証・レート制限を持つ

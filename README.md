# Shape-D コーポレートサイト

Shape-D の公式コーポレートサイト（Next.js App Router）。

## 技術スタック

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4
- GSAP 3 + Framer Motion + Lenis（アニメーション・スクロール）
- Resend（お問い合わせメール送信）

## セットアップ

```bash
npm install
cp .env.example .env.local
npm run dev
```

http://localhost:3000 で確認できます。

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint |
| `npm run test` | Vitest 単体テスト |
| `npm run test:e2e` | Playwright E2E テスト |
| `npx tsc --noEmit` | 型チェック |

## 環境変数

| 変数 | 必須 | 説明 |
|------|------|------|
| `CONTACT_EMAIL` | 推奨 | お問い合わせ送信先（デフォルト: hello@shape-d.com） |
| `NEXT_PUBLIC_CONTACT_EMAIL` | 任意 | 画面表示用メールアドレス |
| `RESEND_API_KEY` | 本番必須 | Resend API キー |
| `RESEND_FROM_EMAIL` | 推奨 | 送信元メールアドレス |
| `RESEND_FROM_NAME` | 任意 | 送信者表示名（デフォルト: shape-d-hp） |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | 任意 | レート制限の共有ストア（Upstash Redis） |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | 任意 | レート制限の共有ストア（Vercel KV） |
| `CONTACT_TRUST_PROXY_IP_HEADERS` | 任意 | `true` で `x-forwarded-for` を信頼。Vercel では自動。非プロキシ環境では `false` 推奨 |
| `CONTACT_TRUST_CLOUDFLARE_IP` | 任意 | `true` で `cf-connecting-ip` を信頼（Cloudflare 経由時のみ設定） |

## デプロイ

Vercel へのデプロイを想定しています。環境変数を Vercel ダッシュボードで設定してください。

### 本番チェックリスト（shape-d-hp）

| 項目 | 状態 | 備考 |
|------|------|------|
| Upstash KV（レート制限共有） | 設定済み | リソース名 `shape-d-hp-rate-limit`（東京 `hnd1`）。`KV_REST_API_*` が Production / Preview / Development に注入 |
| Resend API キー | 設定済み | Production |
| 送信元メール | 設定済み | `RESEND_FROM_EMAIL=onboarding@resend.dev`（ドメイン検証前の暫定） |
| Resend ドメイン検証 | **要対応** | [resend.com/domains](https://resend.com/domains) で `shape-d.com` を追加し DNS レコードを設定後、`RESEND_FROM_EMAIL` を `hello@shape-d.com` 等に変更 |

> Resend の Send-only API キーではドメイン追加 API は利用不可。ダッシュボードからドメイン検証を行ってください。検証完了までは `hello@shape-d.com` 宛送信が 403 になります。

## ドキュメント

- 仕様: `documents/spec/`
- Issue 運用: GitHub Issues

## コントリビューション

### Issue 起票

変更・機能追加はすべて GitHub Issue からはじめます。Issue を作成してから作業を開始してください。

### ブランチ運用

```
feat/#<issue番号>-<概要>-<YYYYMMDD>
```

例: `feat/#42-add-contact-form-20260401`

### セルフ PR のマージ

1 人開発のため、`main` ブランチへは管理者権限（admin bypass）を用いてマージします。
手順は [`.github/BRANCH_PROTECTION.md`](.github/BRANCH_PROTECTION.md) を参照してください。

## ライセンス

Copyright (c) 2026 Kota Akashi. All rights reserved.（`LICENSE` 参照）

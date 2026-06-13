# Shape-D コーポレートサイト

Shape-D の公式コーポレートサイト（Next.js App Router）。

## 技術スタック

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4
- Framer Motion + Lenis（スクロールアニメーション）
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
| `npx tsc --noEmit` | 型チェック |

## 環境変数

| 変数 | 必須 | 説明 |
|------|------|------|
| `CONTACT_EMAIL` | 推奨 | お問い合わせ送信先（デフォルト: hello@shape-d.com） |
| `NEXT_PUBLIC_CONTACT_EMAIL` | 任意 | 画面表示用メールアドレス |
| `RESEND_API_KEY` | 本番必須 | Resend API キー |
| `RESEND_FROM_EMAIL` | 推奨 | 送信元メールアドレス |
| `RESEND_FROM_NAME` | 任意 | 送信者表示名（デフォルト: shape-d-hp） |

## デプロイ

Vercel へのデプロイを想定しています。環境変数を Vercel ダッシュボードで設定してください。

## ドキュメント

- 仕様: `documents/spec/`
- Issue 運用: GitHub Issues

## ライセンス

Copyright (c) 2026 Kota Akashi. All rights reserved.（`LICENSE` 参照）

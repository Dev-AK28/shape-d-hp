# Shape-D コーポレートサイト

Shape-D の公式コーポレートサイト（Next.js App Router）。

## 技術スタック

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4
- Framer Motion + Lenis（スクロールアニメーション）
- Resend（お問い合わせメール送信）

## セットアップ

Node.js 22 以上が必要です。

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
| `npm run generate:favicons` | ファビコン（`app/icon.png` 等）を再生成（Node.js 22+） |
| `npx tsc --noEmit` | 型チェック |

## 環境変数

| 変数 | 必須 | 説明 |
|------|------|------|
| `CONTACT_EMAIL` | 推奨 | お問い合わせ送信先（デフォルト: hello@shape-d.com） |
| `NEXT_PUBLIC_CONTACT_EMAIL` | 任意 | 画面表示用メールアドレス |
| `RESEND_API_KEY` | 本番必須 | Resend API キー |
| `RESEND_FROM_EMAIL` | 推奨 | 送信元メールアドレス |
| `RESEND_FROM_NAME` | 任意 | 送信者表示名（デフォルト: `shape-d-hp`） |

## デプロイ

Vercel プロジェクト `shape-d-hp` は GitHub リポジトリ `Dev-AK28/shape-d-hp` と連携済みです。

- `main` への push で Production デプロイが自動実行されます
- Pull Request 作成時に Preview デプロイが生成されます
- 環境変数は Vercel ダッシュボード（Production / Preview / Development）で設定してください

## ドキュメント

- 仕様: `documents/spec/`
- Issue 運用: GitHub Issues

## ライセンス

Copyright (c) 2026 Kota Akashi. All rights reserved.（`LICENSE` 参照）

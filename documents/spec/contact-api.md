# お問い合わせ API 仕様

## エンドポイント

`POST /api/contact`

## リクエスト

```json
{
  "name": "string (1-100)",
  "email": "string (email, max 254)",
  "company": "string (optional, max 200)",
  "message": "string (1-5000)"
}
```

クライアントからの `to` フィールドは**受け付けない**（サーバー側 `CONTACT_EMAIL` 固定）。

## レスポンス

### 成功 (200)

```json
{ "success": true }
```

### バリデーションエラー (400)

```json
{ "success": false, "error": "Invalid input", "details": {} }
```

### レート制限 (429)

```json
{ "success": false, "error": "Too many requests. Please try again later." }
```

### サーバーエラー (500)

```json
{ "success": false, "error": "Failed to process form" }
```

## メール送信

- Resend API を使用（`RESEND_API_KEY` 環境変数）
- 未設定時: 開発環境は成功レスポンス、本番は 500
- 送信者表示名: デフォルト `shape-d-hp`（`RESEND_FROM_NAME` で上書き可）
- `From` ヘッダー形式: `shape-d-hp <RESEND_FROM_EMAIL>`
- 件名形式: `[shape-d-hp] お問い合わせ: {name}`
- 本文先頭に `送信元: shape-d-hp (https://www.shape-d.com)` を記載

## セキュリティ

- Zod による入力検証
- IP ベースレート制限（60秒あたり5回）
- PII の console.log 出力なし

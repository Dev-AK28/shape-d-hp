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

- リクエストボディ上限: **32KB**（超過時 413）
- `Content-Length` ヘッダーが存在する場合はボディ読み込み前に拒否
- `Content-Length` が無い、または実サイズが上限を超える場合はストリーム読込で 32KB 超過時点で 413 を返す（`lib/contact/read-body.ts`）
- 定義外フィールド（例: `to`）は Zod により**無視**され、400 にはならない（宛先はサーバー側 `CONTACT_EMAIL` 固定）

## レスポンス

### 成功 (200)

```json
{ "success": true }
```

### バリデーションエラー (400)

```json
{ "success": false, "error": "Invalid input", "details": {} }
```

不正 JSON および空ボディも 400（`Invalid input`、details なし）を返す。

### ペイロード過大 (413)

```json
{ "success": false, "error": "Payload too large" }
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
- 外部 API タイムアウト: 10 秒（`AbortSignal.timeout`）
- Resend 失敗時: HTTP ステータスのみサーバーログに記録（PII なし）
- 送信者表示名: デフォルト `shape-d-hp`（`RESEND_FROM_NAME` で上書き可）
- `From` ヘッダー形式: `shape-d-hp <RESEND_FROM_EMAIL>`
- 件名形式: `[shape-d-hp] お問い合わせ: {name}`
- 本文先頭に `送信元: shape-d-hp (https://www.shape-d.com)` を記載
- 実装: `lib/contact/email-format.ts`

## セキュリティ

- Zod による入力検証
- IP ベースレート制限（60秒あたり5回）
  - 送信前に `tryAcquireRateLimitSlot` で枠を原子的に確保（並行リクエストの TOCTOU を防止）
  - メール送信失敗（500）時および未捕捉例外時は `releaseRateLimitSlot` で枠を返却
  - 400 / 413 は枠を消費しない
  - 429 判定は送信前に実施
  - IP は `cf-connecting-ip` → `x-forwarded-for`（先頭）→ `x-real-ip` の順で取得
  - `cf-connecting-ip` は Cloudflare 経由時に常に信頼
  - `x-forwarded-for` / `x-real-ip` は **信頼できるプロキシ背後でのみ** 使用（Vercel では `VERCEL=1` により自動信頼。それ以外は `CONTACT_TRUST_PROXY_IP_HEADERS=true` を明示設定）
  - 信頼しない環境では forwarded ヘッダーを無視し、IP 取得不可時と同様にレート制限を適用しない（クライアントによるヘッダー偽装を防止）
  - IP 取得不可時はレート制限を**適用しない**（共有 `'unknown'` バケットによる誤 429 を防止）
  - **共有ストア**: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`、または Vercel KV の `KV_REST_API_URL` + `KV_REST_API_TOKEN` が設定されている場合、Upstash Redis でインスタンス間共有。未設定時はインメモリ Map にフォールバック
- PII の console.log 出力なし
- `reply_to` 等のメールヘッダー値は `sanitizeEmailHeaderValue` で改行除去

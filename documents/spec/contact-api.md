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
- `RESEND_FROM_EMAIL` 未設定時は `onboarding@resend.dev`（Resend のテスト用送信元）にフォールバックする（`formatFromAddress()`）。これは開発/未設定時の暫定値であり、**本番では `shape-d.com` の Resend ドメイン検証完了後、必ず検証済みアドレス（例: `hello@shape-d.com`）を `RESEND_FROM_EMAIL` に設定すること**（[#69](https://github.com/Dev-AK28/shape-d-hp/issues/69) 参照。未検証ドメイン宛の送信は 403 になる）
- 実装: `lib/contact/email-format.ts`

## セキュリティ

- Zod による入力検証
- IP ベースレート制限（60秒あたり5回）
  - 送信前に `getRateLimitService().tryAcquire()` で枠を原子的に確保（並行リクエストの TOCTOU を防止）
  - メール送信失敗（500）時および未捕捉例外時は `await rateLimit.release()` で枠を返却（サーバーレス打ち切り防止）
  - 400 / 413 は枠を消費しない
  - 429 判定は送信前に実施
  - IP は `cf-connecting-ip`（`CONTACT_TRUST_CLOUDFLARE_IP=true` 時のみ）→ `x-forwarded-for`（先頭）→ `x-real-ip` の順で取得
  - `cf-connecting-ip` は **Cloudflare 経由と確認できる場合のみ** 信頼（`CONTACT_TRUST_CLOUDFLARE_IP=true` を明示設定）。未設定時はクライアント偽装を防止するため無視
  - `x-forwarded-for` / `x-real-ip` は **信頼できるプロキシ背後でのみ** 使用（Vercel では `VERCEL=1` により自動信頼。それ以外は `CONTACT_TRUST_PROXY_IP_HEADERS=true` を明示設定）
  - 信頼しない環境では forwarded ヘッダーを無視し、IP 取得不可時と同様にレート制限を適用しない（クライアントによるヘッダー偽装を防止）
  - IP 取得不可時はレート制限を**適用しない**（共有 `'unknown'` バケットによる誤 429 を防止）
  - **共有ストア**: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`、または Vercel KV の `KV_REST_API_URL` + `KV_REST_API_TOKEN` が設定されている場合、Upstash Redis でインスタンス間共有。未設定時はインメモリ Map にフォールバック
- PII の console.log 出力なし
- `reply_to` 等のメールヘッダー値は `sanitizeEmailHeaderValue` で改行除去

## 障害時の挙動（レート制限）

- **Redis（Upstash / Vercel KV）障害時はフェイルオープン**（[#382](https://github.com/Dev-AK28/shape-d-hp/issues/382)）
  - `rateLimit.tryAcquire()` の呼び出しは `route.ts` 内で個別に try/catch しており、Redis 側の例外（接続断・タイムアウト等）が送信処理全体（`sendContactEmail`）に伝播することはない
  - 例外発生時は `console.error('Rate limit acquire failed; failing open (allowing request)', ...)` でサーバーログに記録した上で、そのリクエストは**レート制限なしで通過**させる（`allowed = true` として扱う）
  - 設計判断: レート制限機構自体の障害によってお問い合わせフォーム全体（＝メール送信）を止めてしまうことは、レート制限が守ろうとしている被害より大きい。「保護機構の障害が保護対象より大きな障害になってはならない」という一般的な方針に基づき、フェイルクローズ（拒否）ではなくフェイルオープン（許可）を採用
  - 上記のフェイルオープン時は、実際には枠を確保できていないため `release()` は呼び出さない（Redis 障害時に無駄な追加呼び出し・追加エラーログを発生させないため）
- **クライアント IP が解決できずレート制限が適用されない場合は警告ログを出力**（[#383](https://github.com/Dev-AK28/shape-d-hp/issues/383)）
  - `extractClientIp()` が `null` を返す（プロキシヘッダー信頼が明示的に有効化されていない自己ホスト環境など）と、既存仕様どおりレート制限は適用されない（誤 429 防止のため意図的な挙動）
  - この状態が発生したことに気づけるよう、`route.ts` はリクエストごとに `console.warn('Rate limiting skipped: client IP could not be resolved', ...)` を出力する
  - リクエスト単位のログで十分と判断（この API に起動時フックのような仕組みは無く、既存のログ規約もリクエスト処理時点での `console.error` 記録に統一されているため、それに合わせた）

# お問い合わせ API

Issues: #4, #5

## エンドポイント

`POST /api/contact`

## リクエスト body（JSON）

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| `name` | string | ✓ | 1–100 文字 |
| `email` | string | ✓ | 有効なメール形式、最大 254 文字 |
| `company` | string | | 最大 200 文字（省略可） |
| `message` | string | ✓ | 1–5000 文字 |

クライアント送信の `to` フィールドは**無視**する。送信先はサーバー側 `CONTACT_RECIPIENTS` に固定（`CONTACT_EMAIL` + 追加宛先）。

## 送信先（#6）

| 種別 | 値 | 設定 |
|------|-----|------|
| 主宛先 | `hello@shape-d.com`（デフォルト） | 環境変数 `CONTACT_EMAIL` |
| 追加宛先 | `kota.akashi@autodevjapan.com` | `lib/contact/constants.ts` の `ADDITIONAL_CONTACT_EMAILS` |
| 画面表示 | 主宛先と同じ（デフォルト） | 環境変数 `NEXT_PUBLIC_CONTACT_EMAIL`（任意） |

## バリデーション（#4）

- スキーマ: `lib/contact/schema.ts`（Zod）
- 失敗時: HTTP 400 + `{ success: false, error: 'Invalid input', details }`
- 成功時（#4）: HTTP 200 + `{ success: true }`

## メール送信・レート制限（#5）

- Resend API 連携: `lib/contact/send-email.ts`
- 環境変数: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`（任意）, `CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_EMAIL`（任意）
- 開発環境で API キー未設定時は送信をスキップし 200 を返す
- IP ベースレート制限: 60 秒あたり 5 リクエスト、超過時 429
- PII を平文 `console.log` しない

## 受け入れ基準（Given-When-Then）

### #4

- **Given** 必須フィールドが空のリクエスト
- **When** POST `/api/contact` する
- **Then** HTTP 400 が返る

- **Given** 不正なメール形式のリクエスト
- **When** POST `/api/contact` する
- **Then** HTTP 400 が返る

- **Given** 正常なリクエスト
- **When** POST `/api/contact` する
- **Then** HTTP 200 が返る

### #5

- **Given** 本番環境
- **When** フォームが送信される
- **Then** PII が平文ログに出力されない

- **Given** `RESEND_API_KEY` が設定されている
- **When** 正常なフォーム送信が行われる
- **Then** `CONTACT_RECIPIENTS` の全アドレスにメールが届く

- **Given** 同一 IP から 60 秒以内に 6 回以上送信
- **When** POST `/api/contact` する
- **Then** HTTP 429 が返る

# セキュリティレスポンスヘッダー仕様

## 概要

全ルートに対して、基本的なクリックジャッキング/MIME スニッフィング対策となる HTTP レスポンスヘッダーを付与する。`next.config.ts` の `headers()` で一元管理する。

## 設定内容

`next.config.ts` の `SECURITY_HEADERS` で `/:path*`（全パス）に対して以下を付与する:

| ヘッダー | 値 | 目的 |
|---------|-----|------|
| `X-Frame-Options` | `DENY` | 他オリジンからの `iframe` 埋め込みを禁止（クリックジャッキング対策）。本サイトを他所に埋め込む用途はないため `DENY` を採用 |
| `X-Content-Type-Options` | `nosniff` | ブラウザによる Content-Type の推測（MIME スニッフィング）を防止 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | 同一オリジンには完全な URL、クロスオリジンにはオリジンのみを送信 |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` | 本サイトが使わないセンサー系 API と Topics API（トラッキング用途）を明示的に無効化 |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | HTTPS 強制（Vercel 本番は元々 HTTPS のみのため副作用なし） |

## 対象外（意図的な未実装）

- **Content-Security-Policy（CSP）**: three.js（WebGL）・Web フォント・インラインスタイルの許可元を洗い出す必要があり影響範囲が大きいため、今回は対象外。別途調査のうえ段階的に導入する（Issue #437 コメント参照）
- **X-Frame-Options の非推奨化**: Next.js のドキュメントでは CSP の `frame-ancestors` への移行が推奨されているが、CSP 未導入の現時点では `X-Frame-Options` を維持する

## 受け入れ基準

```gherkin
Given next.config.ts にセキュリティヘッダーが設定されている
When 任意のページ（例: "/"）にリクエストする
Then レスポンスに X-Frame-Options: DENY が含まれる
And レスポンスに X-Content-Type-Options: nosniff が含まれる
And レスポンスに Referrer-Policy: strict-origin-when-cross-origin が含まれる
And レスポンスに Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=() が含まれる
And レスポンスに Strict-Transport-Security: max-age=63072000; includeSubDomains; preload が含まれる
```

## 検証

```bash
npm run build
npm run test:e2e -- e2e/security-headers.spec.ts
```

- E2E: `e2e/security-headers.spec.ts`（ページ / API ルートの両方でヘッダー付与を検証）

## 関連 Issue

- #437 fix(security): next.config.ts にセキュリティヘッダー(X-Frame-Options等)が未設定

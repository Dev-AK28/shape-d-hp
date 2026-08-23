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
| `Content-Security-Policy` | 下記「CSP の内容」参照 | 許可元を明示し、外部スクリプト/フレーム埋め込み/フォーム送信/fetch 先を自オリジンに限定 |

## CSP の内容（#450、#437 のフォローアップ）

`next.config.ts` の `CSP_HEADER_VALUE` で以下のディレクティブを付与する:

| ディレクティブ | 値 | 根拠 |
|---------|-----|------|
| `default-src` | `'self'` | 明示していないリソース種別のデフォルトを自オリジンに限定 |
| `script-src` | `'self' 'unsafe-inline'`（開発時のみ `'unsafe-eval'` も追加） | Next.js App Router のインライン bootstrap/hydration スクリプトは per-request nonce 配線（proxy/middleware）が無く、本サイトは静的レンダリングに強く依存しているため（`components/top/top-fonts.ts` の `preload: false` 判断等）、今回は nonce 化を見送り `'unsafe-inline'` を許可。外部スクリプトの読み込みは引き続きブロックされる |
| `style-src` | `'self' 'unsafe-inline'` | React の `style={{ ... }}`（インラインスタイル）を使うコンポーネントが複数存在するため必要 |
| `img-src` | `'self' data: blob:` | 自オリジン画像に加え、`data:`/`blob:` を許容 |
| `font-src` | `'self'` | `next/font/google`（`components/top/top-fonts.ts`）はビルド時にダウンロードして `/_next/static` から自己ホストするため外部オリジン不要 |
| `connect-src` | `'self'` | クライアントからの fetch 先は自オリジンのみ（`/api/contact` からの Resend API 呼び出しはサーバーサイドのみで CSP の対象外） |
| `object-src` | `'none'` | `<object>`/`<embed>` は使用しない |
| `base-uri` | `'self'` | `<base>` タグによるベース URL 改ざんを防止 |
| `form-action` | `'self'` | フォーム送信先を自オリジンに限定 |
| `frame-ancestors` | `'none'` | `X-Frame-Options: DENY` と同等の効果を CSP でも明示（新しいブラウザ向け） |
| （末尾） | `upgrade-insecure-requests` | 混在コンテンツを HTTPS に自動アップグレード |

洗い出し済みの許可元監査（三行まとめ）:

- three.js（`lib/webgl/`）: 自オリジンの `<canvas>` に描画し、GLSL シェーダーは GPU ドライバでコンパイルされる（JS の `eval` ではない）。外部テクスチャ/スクリプトは読み込まない
- Web フォント: `next/font/google` により自己ホスト済み。外部 CDN なし
- `/api/contact`: Resend API 呼び出しはサーバーサイドのみ（`lib/contact/send-email.ts`）。ブラウザからの fetch 先ではないため `connect-src` に追加不要
- アナリティクス/CDN スクリプト、`images.remotePatterns`、Web Worker は本コードベースに存在しない

### 今後の検討事項（段階的強化）

- `script-src`/`style-src` の `'unsafe-inline'` は、per-request nonce（Next.js の proxy 経由）または Subresource Integrity（実験的機能）に置き換えることで強化できる。ただし nonce 化は全ページを動的レンダリングにする必要があり（ISR/静的キャッシュ不可）、本サイトのパフォーマンス方針と衝突するため、今回は見送り
- 上記の強化を検討する場合は別途 Issue を起票すること

## 受け入れ基準

```gherkin
Given next.config.ts にセキュリティヘッダーが設定されている
When 任意のページ（例: "/"）にリクエストする
Then レスポンスに X-Frame-Options: DENY が含まれる
And レスポンスに X-Content-Type-Options: nosniff が含まれる
And レスポンスに Referrer-Policy: strict-origin-when-cross-origin が含まれる
And レスポンスに Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=() が含まれる
And レスポンスに Strict-Transport-Security: max-age=63072000; includeSubDomains; preload が含まれる
And レスポンスに上記ディレクティブを含む Content-Security-Policy が含まれる
```

```gherkin
Given next.config.ts に Content-Security-Policy ヘッダーが設定されている
When 本番サイトの主要ページ（トップページ、お問い合わせページ等）にアクセスする
Then ページが正常に描画され、three.js の WebGL 描画やお問い合わせフォーム送信がブロックされない
And レスポンスヘッダーに適切な Content-Security-Policy が含まれる
```

## 検証

```bash
npm run build
npm run test:e2e -- e2e/security-headers.spec.ts
```

- E2E: `e2e/security-headers.spec.ts`（ページ / API ルートの両方でヘッダー付与を検証。CSP の主要ディレクティブの存在も確認）

## 関連 Issue

- #437 fix(security): next.config.ts にセキュリティヘッダー(X-Frame-Options等)が未設定
- #450 fix(security): Content-Security-Policy ヘッダーの段階的導入を検討する（#437 のフォローアップ）

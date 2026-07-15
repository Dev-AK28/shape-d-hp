# セキュリティレスポンスヘッダー仕様

## 概要

全ルートに対して、基本的なクリックジャッキング/MIME スニッフィング対策となる HTTP レスポンスヘッダーを付与する。`next.config.ts` の `headers()` で一元管理する。

## 設定内容

`next.config.ts` の `SECURITY_HEADERS` で `/:path*`（全パス）に対して以下を付与する:

| ヘッダー | 値 | 目的 |
|---------|-----|------|
| `Content-Security-Policy` | 下記「CSP の内容」を参照 | スクリプト/スタイル/画像/フォント等の許可元を制限し、XSS 等の注入攻撃の影響範囲を縮小する |
| `X-Frame-Options` | `DENY` | 他オリジンからの `iframe` 埋め込みを禁止（クリックジャッキング対策）。本サイトを他所に埋め込む用途はないため `DENY` を採用。CSP の `frame-ancestors 'none'` と併用し、未対応ブラウザ向けのフォールバックとして維持する |
| `X-Content-Type-Options` | `nosniff` | ブラウザによる Content-Type の推測（MIME スニッフィング）を防止 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | 同一オリジンには完全な URL、クロスオリジンにはオリジンのみを送信 |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` | 本サイトが使わないセンサー系 API と Topics API（トラッキング用途）を明示的に無効化 |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | HTTPS 強制（Vercel 本番は元々 HTTPS のみのため副作用なし） |

## CSP の内容（Issue #450）

`next.config.ts` の `CSP_DIRECTIVES` で以下を本番適用する（開発時は `'unsafe-eval'` / `ws:` を追加し、`upgrade-insecure-requests` を外している。詳細はコード中コメント参照）:

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

### 洗い出し結果と各ディレクティブの根拠

- **script-src / style-src に `'unsafe-inline'` が必要な理由**: 本サイトは GA/GTM 等のサードパーティスクリプトを一切使用していないが（`next/script` 未使用、外部スクリプト URL なし）、Next.js フレームワーク自身が RSC ペイロードのストリーミング用インラインスクリプト（`self.__next_f.push(...)`）を全ページに埋め込む（`next build && next start` の出力 HTML で確認済み）。また `framer-motion` / `gsap` によるアニメーションは DOM の `style` 属性を直接操作するため `style-src` にも同様の制約がかかる。全ページが静的プリレンダリングされているため、nonce ベースの CSP（Proxy でリクエスト毎に nonce を発行する方式）を採用すると全ページを動的レンダリングに切り替える必要があり、静的最適化を失うコストに見合わない。サードパーティの許可元を追加する必要がない本サイトでは `'unsafe-inline'` を許容する
- **img-src に `data:` が必要な理由**: `app/globals.css` の背景に インライン SVG の `data:image/svg+xml` URI を使用している
- **font-src は `'self'` のみで足りる理由**: `next/font/google`（`app/layout.tsx` の `Cormorant_Garamond`、`components/top/top-fonts.ts` の `JetBrains_Mono` / `Shippori_Mincho` / `Zen_Kaku_Gothic_New`）はビルド時にフォントファイルを自ホストするため、`fonts.gstatic.com` 等への実行時リクエストは発生しない
- **connect-src は `'self'` のみで足りる理由**: ブラウザ側から発生する fetch は `/api/contact`（同一オリジン）のみ。Resend API 呼び出し（`lib/contact/send-email.ts`）と Upstash Redis（`lib/contact/rate-limit-redis.ts`）はいずれもサーバーサイドのみで実行され、ブラウザの `connect-src` には影響しない
- **three.js（WebGL）について**: `lib/webgl/starfield-renderer.ts` は three.js を使わない自前実装の WebGL2 レンダラーで、GLSL シェーダーは `gl.shaderSource` / `gl.compileShader` によるインラインコンパイルであり、これはネットワークリクエストではなく JS API 呼び出しのため追加のディレクティブは不要。`components/top/TopParticleLoader.tsx` が動的 import する `three` パッケージ自体は同一オリジンの JS バンドルとして配信され、外部 CDN からのテクスチャ/モデル読み込みは行っていない
- **iframe / frame-src について**: `<iframe>` 使用箇所は存在しないため `frame-ancestors 'none'` を採用

## 対象外（意図的な未実装）

- なし（CSP は本 Issue #450 で導入済み）

## 受け入れ基準

```gherkin
Given next.config.ts にセキュリティヘッダーが設定されている
When 任意のページ（例: "/"）にリクエストする
Then レスポンスに Content-Security-Policy が含まれ、default-src 'self' を含む
And レスポンスに X-Frame-Options: DENY が含まれる
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
- #450 fix(security): Content-Security-Policy ヘッダーの段階的導入を検討する（#437 のフォローアップ）

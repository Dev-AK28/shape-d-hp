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
| `script-src` | `'self' 'unsafe-inline'`（開発時のみ `'unsafe-eval'` も追加） | Next.js App Router のインライン bootstrap/hydration スクリプトは per-request nonce 配線（proxy）が無く、本サイトは `revalidate` を使わない純粋な静的生成（SSG）構成のため、今回は nonce 化を見送り `'unsafe-inline'` を許可。外部スクリプトの読み込みは引き続きブロックされる。除去の実現可能性は #455 で実機検証済み（下記「`unsafe-inline` 除去の実現可能性調査」参照） |
| `style-src` | `'self' 'unsafe-inline'` | React の `style={{ ... }}`（インラインスタイル）を使うコンポーネントが複数存在するため必要 |
| `img-src` | `'self' data: blob:` | 自オリジン画像に加え、`data:`/`blob:` を許容 |
| `font-src` | `'self'` | `next/font/google`（`components/top/top-fonts.ts`）はビルド時にダウンロードして `/_next/static` から自己ホストするため外部オリジン不要 |
| `connect-src` | `'self'` | クライアントからの fetch 先は自オリジンのみ（`/api/contact` からの Resend API 呼び出しはサーバーサイドのみで CSP の対象外） |
| `object-src` | `'none'` | `<object>`/`<embed>` は使用しない |
| `base-uri` | `'self'` | `<base>` タグによるベース URL 改ざんを防止 |
| `form-action` | `'self'` | フォーム送信先を自オリジンに限定 |
| `frame-ancestors` | `'none'` | `X-Frame-Options: DENY` と同等の効果を CSP でも明示（新しいブラウザ向け） |
| （末尾） | `upgrade-insecure-requests` | 混在コンテンツを HTTPS に自動アップグレード |
| `report-to` | `csp-endpoint` | 下記「CSP 違反レポーティング」参照 |
| `report-uri` | `/api/csp-report` | 同上（フォールバック） |

洗い出し済みの許可元監査（三行まとめ）:

- three.js（`lib/webgl/`）: 自オリジンの `<canvas>` に描画し、GLSL シェーダーは GPU ドライバでコンパイルされる（JS の `eval` ではない）。外部テクスチャ/スクリプトは読み込まない
- Web フォント: `next/font/google` により自己ホスト済み。外部 CDN なし
- `/api/contact`: Resend API 呼び出しはサーバーサイドのみ（`lib/contact/send-email.ts`）。ブラウザからの fetch 先ではないため `connect-src` に追加不要
- アナリティクス/CDN スクリプト、`images.remotePatterns`、Web Worker は本コードベースに存在しない

### `unsafe-inline` 除去の実現可能性調査（#455、クローズ）

`script-src`/`style-src` から `'unsafe-inline'` を除去できないか、nonce 方式と SRI（実験的機能）の 2 案で実機検証した。結論として、本サイトの静的レンダリング構成では**どちらも採用不可**と判断し、Issue #455 はクローズした。

**nonce 方式（Next.js の proxy/middleware でリクエスト毎に nonce を発行）**

`next start` でビルド済みの本番相当サーバーを起動し、`proxy.ts`（Next.js 16 で `middleware.ts` から改称された正式な file convention。旧 `middleware.ts` は非推奨で使用するとビルド時に警告が出る）で per-request nonce を発行して `script-src 'nonce-xxx' 'strict-dynamic'` を返す構成を実際に組んで検証した。

- ビルド出力上はページが `○ (Static)` のまま変化しない（`middleware` 自体はビルド時の静的判定に影響しない）
- しかし実際のレスポンスを2回取得して比較すると、**HTML 側の `<script>` タグには nonce 属性が一切付与されない**（`grep -o 'nonce="[^"]*"'` が0件）一方、CSP ヘッダーの nonce はリクエスト毎に異なる値になる
  - 理由: 静的ページは *ビルド時に一度だけ* プリレンダリングされる。nonce 属性の注入は Next.js がレンダリング時に「リクエストの CSP ヘッダーから nonce を読む」処理（`getScriptNonceFromHeader`）に依存しており、ビルド時には実際のリクエストが存在しないため nonce を注入できない
  - さらに、各ページには App Router の RSC flight data を運ぶインライン `<script>`（`self.__next_f.push(...)`）が **1ページあたり約10個**存在し、内容はページ毎に異なる（固定ハッシュでの許可も非現実的）
- 結果として `'nonce-xxx' 'strict-dynamic'` を採用すると、静的ページのインラインスクリプト（RSC hydration に必須）が nonce 不一致で軒並みブロックされ、**サイトが機能しなくなる**ことを実機で確認した
- 回避するには全ページを動的レンダリング（`force-dynamic` 相当）にするほかない。本サイトは `revalidate` を一切使わない純粋な静的生成（SSG）構成（`grep -rn "revalidate" app/` は 0 件）であり、これを動的レンダリングへ切り替えることは全ページを毎リクエスト SSR に変えることを意味し、本サイトの静的配信によるパフォーマンス方針と正面から衝突する

**SRI（`experimental.sri`、実験的機能）**

Next.js のソース（`node_modules/next/dist/server/app-render/required-scripts.js`、`app-render.js`）を確認したところ、この機能は `/_next/static/chunks/*.js` を読み込む `<script src="...">` タグに `integrity="sha256-..."` 属性を付与するのみで、CSP の `script-src`/`style-src` ディレクティブ自体には一切関与しない。上記のインライン RSC flight data スクリプトや `style={{ ... }}` によるインラインスタイル属性の許可問題は解決しないため、`'unsafe-inline'` 除去には寄与しない。

**style-src について**

`components/PhilosophyContent.tsx` 等、複数コンポーネントが `style={{ ... }}`（動的に計算される値を含む）を使用している。CSP の nonce/hash はインラインスタイル**属性**（`style="..."`）には適用できず（`<style>` 要素のみ対象）、`'unsafe-hashes'`（CSP3）で属性値のハッシュを許可する手も値が動的なため事実上運用不可。全箇所を CSS クラス/CSS カスタムプロパティへ移行する大規模リファクタが前提になり、本 Issue のスコープ外。

**再検討する場合の条件**: 本サイトが動的レンダリング前提に移行する場合、または Next.js が RSC flight data を静的ページでも nonce/hash 整合させる仕組みを正式サポートした場合は、本調査を前提に再評価すること。

## CSP 違反レポーティング（#457、#450 のフォローアップ）

`'unsafe-inline'` を許可しているため CSP による XSS 防御効果は限定的（上記参照）だが、想定外のインラインスクリプト/スタイルやサードパーティ由来のリソース読み込みが発生した場合に検知できるよう、CSP 違反レポートを収集するエンドポイントを用意している。

### エンドポイント形式

ブラウザの実装状況が割れているため、2 つのレポート形式を同一エンドポイント（`/api/csp-report`）で両方受理する:

| 形式 | 発火条件 | Content-Type | ボディ形状 |
|------|---------|--------------|-----------|
| Reporting API v1（`report-to`） | `Reporting-Endpoints` ヘッダーで宣言したグループ名を CSP の `report-to` ディレクティブが参照 | `application/reports+json` | `Report` オブジェクトの JSON 配列（複数件がバッチ送信されうる） |
| 従来方式（`report-uri`） | CSP の `report-uri` ディレクティブ | `application/csp-report` | `{ "csp-report": {...} }` の単一オブジェクト |

`report-to` を優先しつつ `report-uri` も併記しているのは、Reporting API 未対応のブラウザ（代表例: Safari）を CSP 違反検知の対象外にしないため。`Report-To`（旧仕様の宣言ヘッダー）は、Chrome が新しい `Reporting-Endpoints` ヘッダーへの一本化を進めており非推奨のため採用せず、`Reporting-Endpoints` ヘッダーのみを宣言している。

エンドポイントの実装:

- ヘッダー宣言: `next.config.ts`（`Reporting-Endpoints` ヘッダー、CSP の `report-to`/`report-uri` ディレクティブ）
- 定数: `lib/csp-report/constants.ts`（エンドポイントのグループ名/パス、ボディサイズ上限など）
- パース: `lib/csp-report/parse-report.ts`（上記 2 形式を共通の形へ正規化。ボディ形状で判定し、`Content-Type` は参考情報として扱う）
- ルートハンドラー: `app/api/csp-report/route.ts`

### 保管/閲覧方法

外部ログ集約サービスは導入せず（新規課金要因を避けるため）、受信したレポートは `console.error('CSP violation report', ...)` でサーバーログに出力するのみとする。本番（Vercel）では Function Logs から確認できる。ボディは 64KB 上限・レポート件数は 1 リクエストあたり最大 20 件・文字列フィールドは 500 文字で切り詰めており、悪意あるリクエストによるログ肥大化/DoS を抑制している。

### 受け入れ基準（追加）

```gherkin
Given Content-Security-Policy に report-to（csp-endpoint）と report-uri のディレクティブが設定されている
And Reporting-Endpoints ヘッダーで csp-endpoint="/api/csp-report" が宣言されている
When ブラウザが CSP 違反を検知する
Then 違反レポートが /api/csp-report に送信される
And サーバーログに違反内容が出力される
```

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
npm run test -- tests/csp-report tests/http
npm run build
npm run test:e2e -- e2e/security-headers.spec.ts
```

- Unit: `tests/csp-report/parse-report.test.ts`（2 形式の正規化、上限/切り詰め）、`tests/csp-report/route.test.ts`（`/api/csp-report` の 204/400/413 応答）、`tests/http/read-body.test.ts`
- E2E: `e2e/security-headers.spec.ts`（ページ / API ルートの両方でヘッダー付与を検証。CSP の主要ディレクティブ・`Reporting-Endpoints` ヘッダーの存在、`/api/csp-report` への実際の POST も確認）

## 関連 Issue

- #437 fix(security): next.config.ts にセキュリティヘッダー(X-Frame-Options等)が未設定
- #450 fix(security): Content-Security-Policy ヘッダーの段階的導入を検討する（#437 のフォローアップ）
- #457 chore(security): CSP違反のレポーティング（report-to/report-uri）導入（#450 のフォローアップ、本ドキュメントの対応範囲）
- #455 chore(security): CSPのscript-src/style-srcからunsafe-inlineを除去（実現可能性を実機検証し、静的レンダリングと非互換と判断してクローズ。詳細は上記「`unsafe-inline` 除去の実現可能性調査」参照）

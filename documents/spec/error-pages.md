# 404 / エラーページ仕様

## 概要

Next.js App Router のファイル規約（`not-found.tsx` / `error.tsx` / `global-error.tsx`）を使い、404 到達時や実行時エラー発生時にもサイトのブランドデザイン（ダークテーマ・フォント・導線）を保つ。導入前は Next.js の既定ページ（無装飾）が表示されていた（Issue #458）。

## 配置とスコープ

| ファイル | スコープ | Navigation/Footer |
|---------|---------|---------------------|
| `app/not-found.tsx` | 404（どのルートにもマッチしない URL全般、および `notFound()` 呼び出し） | 自前で `Navigation` / `Footer` を import（`app/(site)/layout.tsx` の外側で描画されるため） |
| `app/(site)/error.tsx` | `/contact` `/philosophy` `/process` `/services` `/works` 配下のレンダリング時エラー | `app/(site)/layout.tsx` がそのまま残るため自動的に付与される |
| `app/error.tsx` | トップページ（`app/page.tsx`、`components/top/TopShell` 使用）のレンダリング時エラー | なし（トップページ自体が Navigation/Footer を使わないデザインのため） |
| `app/global-error.tsx` | ルートレイアウト（`app/layout.tsx`）自体が投げたエラー | なし（`<html>`/`<body>` を自前で描画し、globals.css 等ルートレイアウトが依存するものは一切 import しない） |

## 受け入れ基準

```gherkin
Given 存在しない URL にアクセスする
When レスポンスを受け取る
Then HTTP 404 が返る
And サイトのデザイン（ダークテーマ・Navigation・Footer）に沿った 404 ページが表示される
And トップページへの導線（リンク）が含まれる
And <title> に "ページが見つかりません" を含む
```

## 検証

```bash
npm run build && npm start
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/this-page-does-not-exist  # => 404
npm run test:e2e -- e2e/not-found.spec.ts
```

## 関連 Issue

- #458 fix(ux): app/ に not-found.tsx / error.tsx が存在せず404/エラー時にNext.jsの既定ページが表示される

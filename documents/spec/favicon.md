# ファビコン仕様

## 概要

ブラウザタブ・ブックマーク・iOS ホーム画面用に、正規ロゴ `public/shape-d-logo-transparent.png` から生成した静的 PNG を App Router で提供する。

## アセット

| ファイル | サイズ | 用途 |
|---------|--------|------|
| `app/icon.png` | 32×32 PNG | ブラウザタブ favicon |
| `app/apple-icon.png` | 180×180 PNG | apple-touch-icon |
| `public/shape-d-logo-transparent.png` | 1536×1024 RGBA | 生成元ロゴ |

`app/favicon.ico`（Create Next App 由来）は使用しない。

## デザイン

- 背景: `#0a0a0a`（サイト背景と同一）
- シンボル: 正規 SHAPE∞D ロゴ（透過 PNG を 82% 幅で中央配置）
- 旧仕様の `∞` 単体グラデーション（`lib/brand/favicon-image.tsx`）は廃止

## 再生成

```bash
node scripts/generate-favicon.mjs
```

## 受け入れ基準

```gherkin
Given ユーザーがブラウザでサイトを開いている
When タブのファビコンを確認する
Then 正規ロゴ由来の 32×32 PNG が表示される
```

```gherkin
Given iOS でホーム画面に追加する
When apple-touch-icon が読み込まれる
Then 180×180 の最適化済みアイコンが表示される
```

## 検証

```bash
npm run build
npm run test:e2e -- e2e/favicon.spec.ts
```

- E2E: `e2e/favicon.spec.ts`（サイズ / content-type / PNG シグネチャ / metadata）

## 関連 Issue

- #50 fix: ファビコンをグラデーション＋投影で最適化し違和感を解消（2026-06 正規ロゴ PNG 方式へ更新）

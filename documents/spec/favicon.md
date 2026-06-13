# ファビコン仕様

## 概要

ブラウザタブ・ブックマーク・iOS ホーム画面用に、専用サイズのファビコンを App Router の動的生成で提供する。

## アセット

| ファイル | サイズ | 用途 |
|---------|--------|------|
| `app/icon.tsx` | 32×32 PNG | ブラウザタブ favicon |
| `app/apple-icon.tsx` | 180×180 PNG | apple-touch-icon |

共通ビジュアルは `lib/brand/favicon-image.tsx` で定義。

## デザイン

- 背景: インディゴ系グラデーション（`#0A192F` → `#1e1b4b` → `#312e81`）
- シンボル: `∞`（SHAPE∞D ブランド）
- シンボル: ブルー〜パープルグラデーション + ドロップシャドウ
- 1.5MB の `public/image_13.png` は favicon 参照から除外

## 受け入れ基準

```gherkin
Given ユーザーがブラウザでサイトを開いている
When タブのファビコンを確認する
Then 小サイズでも判別可能なグラデーション＋投影付きアイコンが表示される
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

- E2E: `e2e/favicon.spec.ts`（サイズ / content-type / metadata 非参照）

## 関連 Issue

- #50 fix: ファビコンをグラデーション＋投影で最適化し違和感を解消

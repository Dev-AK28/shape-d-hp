# ファビコン仕様

## 概要

ブラウザタブ・ブックマーク・iOS ホーム画面用に、専用サイズのファビコンを App Router の動的生成で提供する。

## アセット

| ファイル | サイズ | 用途 |
|---------|--------|------|
| `app/icon.tsx` | 32×32 PNG | ブラウザタブ favicon |
| `app/apple-icon.tsx` | 180×180 PNG | apple-touch-icon |

共通ビジュアルは `lib/brand/favicon-image.tsx` で定義。

`app/favicon.ico`（Create Next App 由来の静的アイコン）は使用しない。動的生成のみを正とする。

## デザイン

- 背景: インディゴ系グラデーション（`#0A192F` → `#1e1b4b` → `#312e81`）
- シンボル: `∞`（SHAPE∞D ブランド）
- シンボル: ブルー〜パープルグラデーション + ドロップシャドウ
- フォント: Satori 既定（環境依存の `serif` 指定は使わない）
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

- E2E: `e2e/favicon.spec.ts`（サイズ / content-type / PNG シグネチャ・寸法 / 中心と背景の色差・チャンネル分散 / metadata が `/icon`・`/apple-icon` を指すこと / 旧 favicon.ico は 404）

## 関連 Issue

- #50 fix: ファビコンをグラデーション＋投影で最適化し違和感を解消

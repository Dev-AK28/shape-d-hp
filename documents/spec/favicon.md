# ファビコン仕様

## 概要

ブラウザタブ・ブックマーク・iOS ホーム画面用のファビコンは、原画像 `public/image_13.png` をそのまま縮小せず、専用アセットとして生成する。

## 生成方式

| 項目 | 内容 |
|------|------|
| 生成スクリプト | `npm run generate:favicons` |
| 実装 | `lib/brand/favicon.ts` |
| 出力先 | `app/icon.png`（32×32）、`app/apple-icon.png`（180×180） |
| 参照 | Next.js App Router の file-based metadata（`app/icon.png` / `app/apple-icon.png`） |

`app/layout.tsx` の `metadata.icons` では `image_13.png` を参照しない。

## ビジュアル仕様

1. **背景**: インディゴ〜パープル系の放射状グラデーション（サイト Hero と同系色）
2. **ロゴ**: 輝度ベースで暗部を透過抽出し、銀色ラインのみを合成
3. **投影**: 紫系グロー（`screen` ブレンド + blur）をロゴ背面に配置

### カラーパレット

| 用途 | 色 |
|------|-----|
| グラデーション内側 | `#4338ca` |
| グラデーション中間 | `#1e1b4b` |
| グラデーション基底 | `#0a0a1a` |
| グラデーション外側 | `#000000` |
| グロー内側 | `#818cf8` |
| グロー中間 | `#6366f1` |

## サイズ予算

| ファイル | サイズ | 上限 |
|----------|--------|------|
| `app/icon.png` | 32×32 | 10 KB |
| `app/apple-icon.png` | 180×180 | 60 KB |

## 受け入れ基準

- **Given** ユーザーがブラウザでサイトを開いている
- **When** タブのファビコンを確認する
- **Then** ロゴが小サイズでも判別でき、グラデーション／投影により違和感のないアイコンが表示される

- **Given** iOS でホーム画面に追加する
- **When** apple-touch-icon が読み込まれる
- **Then** 180×180 の最適化済みアイコンが表示される

- **Given** Network タブでファビコンを確認する
- **When** 初回ロード時にアイコンが取得される
- **Then** 1.5MB の `image_13.png` ではなく、専用アセット（数十 KB 以下）が使われる

## 再生成手順

ロゴ原画像を変更した場合:

```bash
npm run generate:favicons
```

生成後、`app/icon.png` と `app/apple-icon.png` をコミットする。

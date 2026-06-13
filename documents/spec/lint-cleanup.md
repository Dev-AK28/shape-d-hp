# ESLint 未使用変数・import 修正

Issue: #3

## 対象

| ファイル | 修正内容 |
|---------|---------|
| `app/contact/page.tsx` | 未使用 `useEffect` import を削除 |
| `app/contact/page.tsx` | catch 句の未使用 `error` を omit |

`components/PhilosophyContent.tsx` の未使用 `index` は先行リファクタで解消済み。

## 受け入れ基準

- `@typescript-eslint/no-unused-vars` 警告が 0 件（Issue 対象ファイル）

# 依存関係セキュリティ

Issue: #2

## 方針

- `npm audit` で検出された脆弱性は、パッチバージョン更新で解消する
- 更新後は `npm run build` と `npm audit` で回帰確認する

## 現在の固定

| パッケージ | バージョン | 備考 |
|-----------|-----------|------|
| `next` | `16.2.9` | DoS / Middleware bypass / XSS 等の CVE 対応 |
| `postcss` (override) | `^8.5.10` | XSS 対応 |
| `eslint-config-next` | `16.2.9` | next と同期 |

## 受け入れ基準（Given-When-Then）

- **Given** プロジェクトルートで `npm audit` を実行する
- **When** 監査が完了する
- **Then** 0 vulnerabilities が報告される

- **Given** `npm run build` を実行する
- **When** ビルドが完了する
- **Then** エラーなく成功する

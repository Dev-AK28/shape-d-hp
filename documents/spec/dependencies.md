# 依存関係セキュリティ

Issue: #2

## 方針

- `npm audit` で検出された脆弱性は、パッチ/マイナーバージョン更新で解消する
- 更新後は `npm run build` と `npm audit` で回帰確認する
- バージョン番号自体の固定ではなく、`npm audit` で 0 vulnerabilities を維持することを優先する
- 下表のバージョンを更新した場合は、本ドキュメントも同じPRで一緒に更新する。実値と本ドキュメントが乖離した場合は `package.json` を正とする

## 現在のバージョン（本ドキュメント更新時点のスナップショット）

| パッケージ | バージョン | 備考 |
|-----------|-----------|------|
| `next` | `16.3.2` | Middleware/Proxyバイパス, DoS, SSRF, キャッシュ混同等の CVE 対応（#476, #477） |
| `postcss` (override) | `^8.5.10` | XSS 対応 |
| `eslint-config-next` | `16.2.12` | next のバージョン更新に追従して都度確認する（バージョン番号の完全一致は必須ではない） |

## 受け入れ基準（Given-When-Then）

- **Given** プロジェクトルートで `npm audit` を実行する
- **When** 監査が完了する
- **Then** 0 vulnerabilities が報告される

- **Given** `npm run build` を実行する
- **When** ビルドが完了する
- **Then** エラーなく成功する

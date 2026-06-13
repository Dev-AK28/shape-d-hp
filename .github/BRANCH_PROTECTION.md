# main ブランチ保護ルール設定手順

GitHub Settings → Branches → Add branch protection rule

## 推奨設定

| 項目 | 設定 |
|------|------|
| Branch name pattern | `main` |
| Require a pull request before merging | ON（Approvals: 1） |
| Require status checks to pass | ON |
| Required checks | `quality` |
| Require branches to be up to date | ON |
| Include administrators | ON |

## 前提

- Issue #14 の CI ワークフローがリモートに push 済みであること
- 初回 CI 実行後に `quality` チェック名を確認すること

## CLI（権限がある場合）

```bash
gh api repos/Dev-AK28/shape-d-hp/branches/main/protection \
  --method PUT \
  --input .github/branch-protection.json
```

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
- CI は `actions/checkout@v5` / `actions/setup-node@v5` を使用（GitHub-hosted `ubuntu-latest` 前提。self-hosted runner 利用時は v2.327.1 以上が必要）

## CLI（権限がある場合）

リポジトリ設定を JSON と一致させる:

```bash
gh api repos/Dev-AK28/shape-d-hp/branches/main/protection \
  --method PUT \
  --input .github/branch-protection.json
```

適用後、本番設定を確認:

```bash
gh api repos/Dev-AK28/shape-d-hp/branches/main/protection \
  --jq '{enforce_admins: .enforce_admins.enabled, checks: .required_status_checks.checks}'
```

期待値: `enforce_admins: true`, `checks` に `quality`（`app_id: 15368` = GitHub Actions）

## セルフレビュー時のマージ

GitHub は自分の PR への `--approve` を拒否する。`enforce_admins: true` では `--admin` だけではマージできない（レビュー必須が管理者にも適用される）。

### 単独開発者向け手順（CI 通過後）

```bash
# 1. 一時的に管理者適用を解除
gh api repos/Dev-AK28/shape-d-hp/branches/main/protection/enforce_admins -X DELETE

# 2. マージ（CI quality は引き続き必須）
gh pr merge <number> --squash --admin --delete-branch

# 3. 管理者適用を再有効化
gh api repos/Dev-AK28/shape-d-hp/branches/main/protection/enforce_admins -X POST
```

### その他

| 方法 | 説明 |
|------|------|
| 別アカウントレビュー | 2 つ目の GitHub アカウントで Approve すれば `--admin` 不要 |

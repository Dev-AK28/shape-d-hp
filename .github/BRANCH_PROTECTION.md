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

GitHub は自分の PR への `--approve` を拒否する。単独開発時は次のいずれかを使う:

| 方法 | コマンド / 操作 |
|------|----------------|
| 管理者バイパス | `gh pr merge <number> --squash --admin` |
| 別アカウントレビュー | 2 つ目の GitHub アカウントで Approve |

`enforce_admins: true` のため、管理者も CI 未通過・レビュー未承認ではマージできない。`--admin` はレビュー必須のバイパスのみ行い、CI チェックは引き続き必須。

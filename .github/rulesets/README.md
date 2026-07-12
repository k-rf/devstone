# GitHub Repository Rulesets

このディレクトリは、リポジトリに適用する GitHub Rulesets の定義を管理します。
エージェント向けの説明は [`.agents/rules/branch-naming.md`](../../.agents/rules/branch-naming.md) を参照してください。

## Branch naming convention

許可されていない名前のブランチ作成・更新を拒否します。

- 定義ファイル: [`branch-naming-convention.json`](./branch-naming-convention.json)
- 許可:
  - `main`
  - `{type}/DEV-{n}/{desc}`
    （type = feature / fix / chore / docs / refactor / hotfix / test / ci / release）
  - `dependabot/*/*`
- 拒否例: `cursor/...`、チケット ID なし（例: `feature/add-login`）、プレフィックスなし

### Branch naming convention の適用（リポジトリ管理者）

Cursor 統合トークンには Rulesets 作成権限がないため、**リポジトリ管理者**が次を実行してください。

```bash
gh api --method POST repos/k-rf/devstone/rulesets --input .github/rulesets/branch-naming-convention.json
```

既存 Ruleset を更新する場合は、Ruleset ID を指定して `PUT` します。

```bash
gh api repos/k-rf/devstone/rulesets
gh api --method PUT repos/k-rf/devstone/rulesets/<ruleset-id> --input .github/rulesets/branch-naming-convention.json
```

### 検証手順

```bash
# 違反: 失敗すること
git push origin HEAD:refs/heads/cursor/invalid-branch-name

# 適合: 成功すること
git push origin HEAD:refs/heads/feature/DEV-29/ruleset-smoke-test
git push origin --delete feature/DEV-29/ruleset-smoke-test
```

## Main branch protection

`main` への直接 push・削除を防ぎ、PR 経由のマージと必須チェックを強制します。

- 定義ファイル: [`main-branch-protection.json`](./main-branch-protection.json)
- 主なルール:
  - force push / 削除の禁止
  - PR 必須（レビュー承認数は 0、未解決スレッドの解消は必須）
  - マージ方法は `merge` のみ
  - 必須ステータスチェック: `Run Checks`

### Main branch protection の適用（リポジトリ管理者）

```bash
gh api --method POST repos/k-rf/devstone/rulesets --input .github/rulesets/main-branch-protection.json
```

既存 Ruleset を更新する場合は、Ruleset ID を指定して `PUT` します。

```bash
gh api repos/k-rf/devstone/rulesets
gh api --method PUT repos/k-rf/devstone/rulesets/<ruleset-id> --input .github/rulesets/main-branch-protection.json
```

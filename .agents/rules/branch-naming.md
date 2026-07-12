# Branch Naming

> [!NOTE] このファイルの役割
> Git ブランチ名の命名規則を定義します。エージェントは作業用ブランチを作成する際、必ずこの規則に従ってください。
> GitHub Repository Rulesets による強制ルールと対になっています（`.github/rulesets/branch-naming.json`）。

## 1. 基本フォーマット

```text
{type}/{ticket-id}-{short-description}
```

| 要素                | 規則                                                                 | 例                         |
| :------------------ | :------------------------------------------------------------------- | :------------------------- |
| `type`              | 下記の許可プレフィックスのいずれか                                   | `feature`                  |
| `ticket-id`         | 開発タスクの ID（`DEV-` + 数字）。大文字で統一する                   | `DEV-29`                   |
| `short-description` | 内容を表す短い英単語。`kebab-case`。空白・アンダースコア・記号は不可 | `branch-naming-convention` |

### 許可プレフィックス（`type`）

| プレフィックス | 用途                                           |
| :------------- | :--------------------------------------------- |
| `feature/`     | 機能追加・仕様追加                             |
| `fix/`         | バグ修正                                       |
| `chore/`       | ビルド・依存関係・設定など機能に影響しない作業 |
| `docs/`        | ドキュメントのみの変更                         |
| `refactor/`    | 振る舞いを変えない内部構造の改善               |
| `hotfix/`      | 本番向けの緊急修正                             |
| `test/`        | テスト追加・修正のみ                           |
| `ci/`          | CI/CD 設定のみの変更                           |
| `release/`     | リリース準備（バージョン上げ等）               |

### 良い例

- `feature/DEV-29-branch-naming-convention`
- `fix/DEV-12-timer-sync-error`
- `chore/DEV-8-upgrade-pnpm`
- `docs/DEV-15-update-agents-md`

### 悪い例（禁止）

- `cursor/cursor-4cee`（プレフィックス不正・チケット ID なし）
- `feature/add-login`（チケット ID なし）
- `DEV-29-feature`（プレフィックスなし）
- `feature/dev-29-foo`（チケット ID は `DEV-` を大文字で書く）
- `feature/DEV-29_foo`（アンダースコア不可）
- `Feature/DEV-29-foo`（プレフィックスは小文字）

## 2. エージェントの必須手順

1. 開発タスクの ID（例: `DEV-29`）を確認する。
2. 変更の性質に合う `type` を 1 つ選ぶ。
3. `short-description` を 2〜5 語程度の `kebab-case` で付ける。
4. `main` から上記フォーマットのブランチを作成して作業する。
5. **勝手な名前（`cursor/...`、日時だけ、ランダム文字列など）でブランチを切ってはならない。**

## 3. 例外（システムが作成するブランチ）

人間・エージェントが作業用に切るブランチ以外で、次のみ許可する。

| パターン        | 理由                         |
| :-------------- | :--------------------------- |
| `main`          | デフォルトブランチ           |
| `dependabot/**` | Dependabot が自動生成する PR |

これ以外の例外を増やしたい場合は、先にこのルールと GitHub Ruleset を更新し、ユーザーの承認を得ること。

## 4. GitHub Rulesets との関係

- エージェント規則（本ファイル）: チケット ID 付きの完全なフォーマットを義務付ける。
- GitHub Rulesets: 許可プレフィックス外のブランチ作成・更新を拒否する（プレフィックス層の強制）。

Ruleset 定義: [`.github/rulesets/branch-naming.json`](../../.github/rulesets/branch-naming.json)
適用手順: [`.github/rulesets/README.md`](../../.github/rulesets/README.md)

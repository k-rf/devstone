---
name: create-pull-request
description: >-
  Pull Request の作成、gh pr create、PR タイトル・本文の作成を行う。
  ユーザーが PR 作成・プルリクエスト作成を求めた際に使用する。
  課題キー付きタイトル、commit.json のスタイル、GitHub PR テンプレートに従う。
---

# Pull Request 作成

現在のブランチから GitHub Pull Request を作成する。

## Step 0: 設定とテンプレートの読み込み

1. `.agents/configs/commit.json` を読む（なければデフォルト: `style=gitmoji`、`language=ja`）
2. `.github/pull_request_template.md`（または `.github/PULL_REQUEST_TEMPLATE/` 配下）を読む
3. タイトルのスタイル詳細は `commit-message` スキルを参照する
   - `gitmoji` の場合: `commit-message/references/gitmoji.md`

## Step 1: ブランチ状態の確認

次を並列で実行する：

- `git status`（未コミット変更・未追跡ファイル）
- `git diff` / `git diff --staged`
- `git log` / `git diff <base>...HEAD`（base は通常 `main`）
- リモート追跡の有無と ahead/behind
- `gh pr list --head <current-branch>`（既存 PR の有無）

### ガード

- 既存 PR がある場合は新規作成せず、URL を報告して止まる
- 未コミット変更がある場合は警告し、PR にはコミット済み差分のみを含める（勝手にコミットしない）
- リモート未 push なら `git push -u origin HEAD` してから作成する
- force push・フックスキップは禁止

## Step 2: 課題キーの抽出

ブランチ名から `DEV-<数字>` を抽出する。

| ブランチ例                     | 課題キー |
| ------------------------------ | -------- |
| `feature/DEV-42/add-login`     | `DEV-42` |
| `cursor/fix/DEV-12/timer-sync` | `DEV-12` |

抽出できない場合はユーザーに確認してから進む。推測でキーを捏造しない。

## Step 3: タイトルの生成

形式（厳守）:

```text
[<課題キー>] <style-prefix> <件名>
```

例:

```text
[DEV-42] 🔧 Cursor Cloud 用ブランチ命名例外を Rulesets に追加する
```

### ルール

- 先頭は必ず `[DEV-n]`（角括弧付き課題キー）
- `<style-prefix>` と `<件名>` は `commit.json` の `style` / `language` に従う
- **`feat:` / `chore:` / `fix:` 等の Conventional Commits タイプは付けない**
  - ❌ `[DEV-42] 🔧 feat: 設定を更新する`
  - ❌ `[DEV-42] feat: 設定を更新する`
  - ✅ `[DEV-42] 🔧 設定を更新する`
- 件名はコミットメッセージ同様、日本語なら動詞終止形（「〜する」）、英語なら命令形
- ブランチ全体の意図を1行で表す（最新コミットのコピペに頼らない）

## Step 4: 本文の生成

1. PR テンプレートのセクションを**削除せず**すべて残す
2. 各セクションを `main...HEAD` の差分・コミット履歴に基づいて埋める
3. HTML コメント（`<!-- ... -->`）は除去してよい
4. チェックリストは実施済みのみ `[x]` にする（未確認を嘘で埋めない）
5. 背景・目的に課題キー（例: `DEV-42`）を記載する

## Step 5: PR の作成

```bash
gh pr create --title "<タイトル>" --body "$(cat <<'EOF'
<テンプレートに沿った本文>
EOF
)"
```

作成後、PR URL を返す。
未コミット変更を残している場合は併せて報告する。

## やらないこと

- テンプレートにない独自セクションの追加で構成を崩すこと
- Conventional Commits タイプをタイトルや「スタイルのつもり」で混在させること
- ユーザーが求めていないコミット・push 先ブランチの変更
- 機密ファイル（`.env` 等）を含む変更の PR 化を黙認すること（検知したら止めて報告する）

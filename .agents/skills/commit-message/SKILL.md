---
name: commit-message
description: コミットメッセージの生成、作成、フォーマット、gitmoji、Conventional Commits、コミットメッセージの規約などをユーザーが求めた際に使用されるスキル。コミットメッセージのスタイルとフォーマット規則に関する知識を提供する。
user-invocable: false
---

# コミットメッセージ規約

コミットメッセージのスタイル、フォーマット規則、プロジェクト固有の規約に関する知識を提供する。

## 設定

`.agents/configs/commit.json` が存在する場合、プロジェクト固有の設定を読み込む。

| フィールド     | デフォルト | 説明                                                    |
| -------------- | ---------- | ------------------------------------------------------- |
| `style`        | `gitmoji`  | コミットメッセージのスタイル: `gitmoji`、`conventional` |
| `language`     | `en`       | メッセージの言語: `en`、`ja` 等の ISO 639-1 コード      |
| `scope`        | `false`    | スコープをメッセージに含めるか（例: `feat(auth):`）     |
| `customPrefix` | —          | 追加プレフィックス（例: チケットキー `PROJ-123`）       |

## メッセージ品質ガイドライン

### 件名

- 72文字以内にする
- 英語の場合は命令形を使用する（"Add feature" であって "Added feature" ではない）
- 日本語の場合は動詞終止形（「○○する」）を使用する（体言止めではない）
- 複数のプレフィックスが必要に思える場合、コミットをさらに分割すべき

### 本文

- 変更の**なぜ**を説明する（差分が何を変えたかを示すため、何をしたかは書かない）
- 件名と本文は空行で区切る

## スタイルリファレンス

設定されたスタイルに応じて適切なリファレンスを参照する：

- **gitmoji**: `references/gitmoji.md` で絵文字の選択とフォーマットを確認する
- **conventional**: `references/conventional-commits.md` でタイププレフィックスとフォーマットを確認する

### スタイルの統一と混在の禁止

- `commit.json` で指定されたスタイルを遵守し、絵文字と Conventional Commits プレフィックスの併用（例: `✨ feat:`）や、スタイルの混在を禁止する。

## コミットメッセージのフォーマット

### フォーマット規則

```plaintext
<prefix> [customPrefix] <件名>
```

- `customPrefix` が設定されている場合、コミットヘッダーに必ずプレフィックスを含める（例: 課題キーなど）。
- プレフィックスの値はチケットや作業ブランチ名から取得する。特定できない場合はコミットを作成せずユーザーに確認を求めて停止する。

### Bash での HEREDOC 形式

Bash 経由でコミットを作成する際は、常に HEREDOC 形式を使用する。
本文には変更の理由を記載する：

```bash
git commit -m "$(cat <<'EOF'
<prefix> [customPrefix] <件名>

<この変更が行われた理由を説明する本文>
EOF
)"
```

## 追加リソース

### リファレンスファイル

- **`references/gitmoji.md`** — 絵文字リファレンスと選択戦略
- **`references/conventional-commits.md`** — Conventional Commits 仕様

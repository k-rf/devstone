# GitHub PR Review API 投稿手順

承認後（または事前明示依頼時）は、サマリーとインラインコメントを
1 回のレビューとして投稿する。

## 1. 投稿前の最新コミット確認

実行直前に単一コマンドで最新の `headRefOid` を再取得し、
Step 1 で取得した値と一致していることを確認する。

```bash
gh pr view <number> --json headRefOid
```

不一致（レビュー中に新しいコミットが積まれた）の場合はそのまま投稿せず、
差分を再確認してからコメント案を作り直す。

## 2. リクエスト JSON の作成

ファイル作成ツール等で一意な一時 JSON ファイル
（例: `/tmp/pr-review-<number>-<timestamp>.json`）を作成する。
ヒアドキュメントやコマンド置換は使わない。

```json
{
  "commit_id": "<headRefOid>",
  "event": "COMMENT",
  "body": "<サマリーコメント本文>",
  "comments": [
    {
      "path": "path/to/file.ts",
      "line": 42,
      "side": "RIGHT",
      "body": "<インラインコメント本文>"
    }
  ]
}
```

複数行範囲に紐づける場合は `start_line`（開始行）と `start_side` を追加する。
インラインコメントが 0 件の場合は `comments` キーを省略するか空配列 `[]` にする。

## 3. 単一コマンドでのレビュー投稿

単一コマンドでレビューを投稿する。
`{owner}/{repo}` は `gh api` が自動置換するため、
手動置換する PR 番号だけ `<number>` を使う。

```bash
gh api --method POST repos/{owner}/{repo}/pulls/<number>/reviews --input /tmp/pr-review-<number>-<timestamp>.json
```

## 4. 一時ファイルの削除

投稿後は、API 呼び出しが HTTP 422 等で失敗した場合も含めて一時ファイルを削除する。

```bash
rm /tmp/pr-review-<number>-<timestamp>.json
```

## 5. API 制約と注意点

- `line` は必ず PR 差分ハンク内に含まれる行番号にする（差分外の行は HTTP 422 になる）。
- 複数行範囲を指定する場合は `start_line < line` かつ同一差分ハンク内に収め、
  `start_side` を `side` と揃える（違反すると HTTP 422 になる）。
- 自分が作成者の PR に対して `REQUEST_CHANGES` や `APPROVE` を送ると HTTP 422 になるため、
  ユーザーからの明示的な指定がない限り `event` は `"COMMENT"` 固定にする。
- 投稿直前に `commit_id` が最新の `headRefOid` と一致していることを必ず確認する。

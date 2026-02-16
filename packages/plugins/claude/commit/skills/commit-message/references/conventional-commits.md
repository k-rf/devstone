# Conventional Commits リファレンス

Conventional Commits は、コミットメッセージに構造化された形式を与える規約。
セマンティックバージョニングと連携し、変更履歴の自動生成を可能にする。

## メッセージフォーマット

```plaintext
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## タイププレフィックス

| タイプ     | 説明                           | SemVer への影響 |
| ---------- | ------------------------------ | --------------- |
| `feat`     | 新機能                         | MINOR           |
| `fix`      | バグ修正                       | PATCH           |
| `docs`     | ドキュメントのみ               | —               |
| `style`    | フォーマット、ロジック変更なし | —               |
| `refactor` | コード再構成、振る舞い変更なし | —               |
| `perf`     | パフォーマンス改善             | PATCH           |
| `test`     | テストの追加・更新             | —               |
| `build`    | ビルドシステムまたは依存関係   | —               |
| `ci`       | CI/CD 設定                     | —               |
| `chore`    | メンテナンスタスク             | —               |
| `revert`   | 以前のコミットの取り消し       | —               |

## スコープ

オプションのスコープで変更領域を絞り込む：

```plaintext
feat(auth): add JWT token refresh
fix(api): handle null response in user endpoint
refactor(db): extract query builder utility
build(deps): upgrade TypeScript to v5.7
```

## 破壊的変更

タイプ/スコープの後に `!` を付けるか、`BREAKING CHANGE:` フッターで破壊的変更を示す：

```plaintext
feat!: remove deprecated authentication method

BREAKING CHANGE: The legacy auth endpoint has been removed.
Use /api/v2/auth instead.
```

## 例

```plaintext
feat: add user profile page
fix: correct date parsing in ISO format handler
docs: update API reference for v2 endpoints
refactor: extract shared TypeScript configuration
build: upgrade Moon to v2 with JSONC configuration
chore: clean up unused dependencies
ci: add Node.js 24 to test matrix
```

## ガイドライン

- 件名行はタイププレフィックスの後を小文字にする
- 件名行の末尾にピリオドを付けない
- 命令形を使用する（"add" であって "adds" や "added" ではない）
- 件名行は72文字以内にする
- 本文は**なぜ**を説明し、何をしたかは書かない
- 各フッターは独自の行に記載する

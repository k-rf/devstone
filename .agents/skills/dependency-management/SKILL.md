---
name: dependency-management
description: ワークスペースで依存パッケージの追加、更新、削除を行う際にこのスキルを使用します。package.json の直接編集を禁止し、代わりに pnpm コマンドの使用を義務付けるルールを強制します。
---

# pnpm 依存パッケージ管理ルール

本プロジェクトでは、依存関係の一貫性を保ち、lockfile の不整合を防ぐため、以下のパッケージ追加・更新のルールを適用します。

## ルール

1. **`package.json` の直接編集の禁止**:
   `dependencies` や `devDependencies` に新しいパッケージを追加したり、バージョンを書き換えたりする際に、`package.json` をエディタやファイル操作ツールで直接編集してはなりません。

2. **`pnpm` コマンドによる操作の義務付け**:
   パッケージの追加・更新・削除は、必ず `pnpm` コマンドを使用して行ってください。
   - 例（パッケージ追加）: `pnpm add <package-name>`
   - 例（開発依存での追加）: `pnpm add -D <package-name>`
   - 例（特定の workspace パッケージへの追加）: `pnpm --filter <workspace-package-name> add <package-name>`

3. **`saveExact` 設定の考慮**:
   pnpm workspace 内で `saveExact: true` が有効な場合、`pnpm add` は自動的に厳密なバージョンでインストールします。手動で `^` を追加するなどの編集は行わないでください。

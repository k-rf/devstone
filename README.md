# devstone

自作のライブラリやツールを集めたモノレポです。

## コマンド一覧

### 基本方針

本プロジェクトでは、タスクランナーとして `moon` を採用しています。
複数のパッケージやアプリケーションにまたがる操作は `moon` を通じて行い、
個別のアプリケーション特有の開発操作（開発サーバーの起動など）は各ディレクトリの `npm scripts` を使用します。

### 主要コマンド（Workspace 全体）

| コマンド              | 用途                                                               |
| :-------------------- | :----------------------------------------------------------------- |
| `moon run :lint`      | ワークスペース内の全プロジェクトに対して Lint を実行します。       |
| `moon run :typecheck` | ワークスペース内の全プロジェクトに対して型チェックを実行します。   |
| `moon run :format`    | ワークスペース全体のコード整形（oxfmt）を実行します。              |
| `moon run :knip`      | ワークスペース全体のデッドコード（未使用ファイル等）を検出します。 |
| `moon run :build`     | 全プロジェクトをビルドします。                                     |
| `moon run :clean`     | ビルド成果物を一括削除します。                                     |

### プロジェクト別コマンド

特定のプロジェクトに対して操作を行う場合は、`moon run <project-id>:<task>` の形式を使用します。

#### notion-toggl-bridge (`apps/notion-toggl-bridge`)

| タスク         | コマンド                                    | 用途                                   |
| :------------- | :------------------------------------------ | :------------------------------------- |
| **開発**       | `pnpm --filter notion-toggl-bridge run dev` | Wrangler 開発サーバーを起動します。    |
| **デプロイ**   | `moon run notion-toggl-bridge:deploy`       | Cloudflare Workers へデプロイします。  |
| **テスト**     | `moon run notion-toggl-bridge:test`         | Vitest によるテストを実行します。      |
| **型チェック** | `moon run notion-toggl-bridge:typecheck`    | このアプリ限定で型チェックを行います。 |

各アプリケーションの起動方法・必須環境変数は各アプリの `README.md` を参照してください。

- [easel README](apps/easel/README.md)
- [notion-toggl-bridge README](apps/notion-toggl-bridge/README.md)

### ユーティリティ・コード品質維持

| 用途               | コマンド                  | 補足                                                |
| :----------------- | :------------------------ | :-------------------------------------------------- |
| **全検証**         | `pnpm run check:all`      | Lint・型チェック・テスト・knip 等を一括実行します。 |
| **自動修正**       | `pnpm run lint`           | ESLint による修正を試みます。                       |
| **Markdown 修正**  | `pnpm run lint:md`        | Markdown の構文を自動修正します。                   |
| **スペルチェック** | `pnpm run lint:spell`     | cspell CLI でワークスペースを検査します。           |
| **Git Hooks**      | `lefthook run pre-commit` | コミット前の検証を手動で実行します。                |

### 開発のヒント

- **キャッシュの活用**: `moon` はタスク結果をキャッシュします。変更がない場合は高速に終了します。キャッシュを無視したい場合は、コマンドに `--no-cache` を付与してください。
- **依存関係の考慮**: `moon` はプロジェクト間の依存関係（`dependsOn`）を解釈し、正しい順序でタスクを実行します。
- **ビルド前提**: `typecheck` / `lint` はワークスペースパッケージのビルド成果物（`dist`）を解決します。
  クリーンチェックアウト直後など `dist` が無い状態では
  `Cannot find module '@devstone/...'` で失敗するため、
  先に `moon run :build` を実行してください（キャッシュされるため通常は一度で十分）。

# automations/tasker

Android の自動化アプリ「Tasker」のレシピ（XML ファイル）および関連設定を管理するプロジェクトです。

## 概要

Tasker のプロファイル・タスク・プロジェクト等の定義（XML）を Git でバージョン管理し、
AI エージェント（`.agents/skills/tasker/SKILL.md`）の支援を受けながら設計・作成・保守するための基盤です。

## ディレクトリ構成とファイル規約

機能単位（Package by Feature）の `recipes/` と、複数レシピ間で横断再利用する `shared-tasks/` で管理します。

```plaintext
automations/tasker/
├── recipes/                  # 機能（Feature）単位の自動化レシピ
│   └── <feature-name>/       # 1つの自動化機能（Project 等）のまとまり
│       └── <feature-name>.{prj,prf,tsk}.xml
├── shared-tasks/             # 複数レシピから Perform Task で再利用する共通タスク (*.tsk.xml)
├── scripts/                  # 設定値（シーン ID 等）の確認用補助スクリプト
├── eslint.config.ts          # ESLint 設定
├── moon.jsonc                # moon プロジェクト設定
├── package.json              # パッケージ定義
├── tsconfig*.json            # TypeScript 設定
└── README.md
```

- ディレクトリ名およびファイル名は用途が判別しやすい英語の `kebab-case` とし、
  Tasker 標準の拡張子サフィックス（`.prj.xml` / `.prf.xml` / `.tsk.xml`）を付与します。

## 開発・運用フロー

1. **設計・作成**:
   `tasker` スキル（`.agents/skills/tasker/SKILL.md`）を活用し、
   自動化したい要件から `recipes/<feature-name>/`（または共通処理の場合は `shared-tasks/`）へ
   Tasker XML レシピおよび端末側の設定手順を作成・更新します。
2. **実機へのインポート**:
   作成した XML ファイルを Android 端末へ転送し、
   Tasker アプリの対象タブ（Project / Profile / Task）を長押しして `Import` から取り込みます。
   `shared-tasks/` の共通タスクを利用するレシピの場合は、先に共通タスクを Task タブへインポートします。
3. **実機からのエクスポート**:
   実機上で調整した設定は `Export -> XML to Storage` で出力し、
   対応するディレクトリへ反映して差分を管理します。

## セキュリティ・機密情報の扱い

- API トークン、Webhook URL、パスワード、個人識別情報（電話番号、メールアドレス、SSID 等）を
  XML 内に直接ハードコードしないでください。
- 機密値は Tasker のグローバル変数（例: `%API_TOKEN`, `%WEBHOOK_URL`）として参照し、
  実機側で初期設定する構成にしてください。

---
name: tasker
description: >-
  Android の自動化ツール「Tasker」のレシピ（XML）の設計・作成・編集・管理を行うスキル。
  「Tasker の自動化を作って」「Tasker の XML を生成・修正して」「Android の自動化レシピを追加して」など、
  Tasker を用いた自動化ワークフローの構築や XML 定義の管理をユーザーが求めた際に使用する。
---

# Tasker 自動化レシピ設計・管理スキル

ユーザーの自動化要件（自然言語の指示）を Tasker の概念モデルへ翻訳し、
`automations/tasker/` 配下で再現・保守可能な Tasker XML レシピおよび設定手順として構築するワークフロー。

コンポーネントの定義カタログ、XML スキーマ、および詳細な生成規約は
`./references/` 配下の各リファレンスファイルを正本として参照する。

## 1. 配置場所とファイル命名規則（Package by Feature）

Tasker の XML（`<TaskerData>`）は 1 ファイルの中に Project・Profile・Task を同梱してインポートする仕様のため、
要素の種別（Layer）ではなく **機能単位（Feature）** でディレクトリを切って管理する。

| 区分        | 配置先パス                                                   | 用途                                                                |
| :---------- | :----------------------------------------------------------- | :------------------------------------------------------------------ |
| **Recipes** | `automations/tasker/recipes/<feature-name>/<name>.<ext>.xml` | 機能単位の自動化レシピ（1 ディレクトリ ＝ 1 つの機能・Project 等）  |
| **Shared**  | `automations/tasker/shared-tasks/<task-name>.tsk.xml`        | 複数のレシピから `Perform Task` で横断再利用する共通の名前付き Task |

- `<feature-name>`, `<name>`, `<task-name>` は用途を表す英語の `kebab-case` とする。
- `<ext>` は実機でのインポート単位（Tasker の対象タブ）に応じた拡張子サフィックスとする:
  - `prj`: Project（`<Project>` とそれに属する Profile / Task 一式を同梱）
  - `prf`: Profile（単一の `<Profile>` とその Entry / Exit Task を同梱）
  - `tsk`: Standalone Task（トリガーを持たない単一の名前付き `<Task>`）

## 2. 設計・作成ワークフロー

### Step 1: 要件の整理と概念マッピング

ユーザーの要求から以下の要素を明確化する。不明確な点（トリガーの有無、State の反転条件、必須パラメータ等）が
ある場合は、推測で XML を生成せず実装前に質問する（質問形式や判断基準は
[generation-rules.md](./references/generation-rules.md) を参照）。

- **エンティティ種別の決定（Profile / Standalone Task / Project）**:
  - **Profile（`.prf.xml`）**: トリガー条件と単一の処理フローで構成される場合。Profile に紐づく
    Entry/Exit Task は `<nme>` タグを持たない**匿名タスク**とする。
  - **Standalone Task（`.tsk.xml`）**: トリガー条件を持たず手動実行やショートカット、または他レシピからの
    `Perform Task` 呼び出しで使われる単一タスク。`<Task>` 直下に `<nme>` タグを持つ**名前付きタスク**とする。
  - **Project（`.prj.xml`）**: 複数の Profile を含む場合、同一レシピ内の複数箇所から再利用される
    名前付きタスクを含む場合、または別タスクを呼び出す `Widget v2` を含む場合。
    `<Project sr="proj0" ve="2">`（`sr="proj0"` 固定、名称は `<name>` タグ）として構成する。
- **共通タスク（`shared-tasks/`）の確認と再利用**:
  - 設計前に `automations/tasker/shared-tasks/` 配下に再利用可能な `.tsk.xml` が存在するか確認する。
  - `shared-tasks/` 上の既存タスクを利用する場合は、`Perform Task`（`code: 130`）の `arg0` にそのタスクの
    `<nme>`（タスク名）を指定して呼び出す。
  - **重要（[generation-rules.md](./references/generation-rules.md) の例外規則）**:
    `shared-tasks/` で独立管理されている共通タスクを呼び出す場合、呼び出し側の `recipes/<feature-name>/` の
    XML 内にはその `<Task>` 実体を重複して同梱しない（`<Project>` の `<tids>` にも含めない）。
    そのレシピ内部でのみ再利用するサブルーチンタスクは、通常通り同じ `.prj.xml` 内に同梱する。
- **トリガー（Profile Contexts）の選定**:
  - [context-catalogs.md](./references/context-catalogs.md) の Event / State Context カタログ、
    および [xml-schema-and-examples.md](./references/xml-schema-and-examples.md) の
    `<App>` / `<Time>` / `<Loc>` 定義から適切なコンテキストを選定する。
  - 専用コンテキストが存在せず
    [variables-and-conditions.md](./references/variables-and-conditions.md) の
    Built-in Variable カタログに該当変数がある場合は、`Variable Value` State（`code: 165`）で監視する。
  - State（および `<App>`）の条件反転が必要な場合は `<pin>true</pin>` を付与し、設定値の自動運用のため
    `<Profile>` には `<flags>40</flags>` を設定して、元の状態へ戻す処理は明示的な Exit Task（`<mid1>`）で記述する。
- **アクション列（Task & Actions）の選定**:
  - [action-catalog.md](./references/action-catalog.md) に定義された `code` とパラメータのみを使用する。
  - カタログに存在しないコードの捏造（ハルシネーション）や、サードパーティ製プラグイン
    （AutoNotification, AutoInput, Join 等）への依存は禁止する。
- **変数設計**:
  - 詳細は [variables-and-conditions.md](./references/variables-and-conditions.md) および
    [generation-rules.md](./references/generation-rules.md) を参照する。
  - **命名規則の厳守**: すべての変数ベース名は **3文字以上**（数字始まり不可）とする。
    ループ変数等であっても `%i` や `%n` などの短い名前は使用せず、`%index`, `%item` 等を使用する。
  - **ローカル変数（すべて小文字、例: `%payload`, `%status`）**:
    タスク内部でのみ使用する一時データ。原則としてローカル変数を優先する。
  - **グローバル変数（大文字を含む、例: `%WEBHOOK_URL`, `%PreviousRingerVolume`）**:
    複数タスク間や Entry Task / Exit Task 間で共有する値、および実機側で注入する機密情報。

### Step 2: Tasker XML の構築

[xml-schema-and-examples.md](./references/xml-schema-and-examples.md) の XML スキーマ定義・構造解説・サンプル、
および [generation-rules.md](./references/generation-rules.md) の生成ルールに準拠し、
`<TaskerData>` ルート要素を持つ XML を作成する。

- **引数の厳密な連番・型マッピング**:
  - カタログ内のパラメータ定義（`p.p` 配列）の順序通りに `arg0`, `arg1`, ... を欠番・並び替えなく出力する。
  - 各 `argN` の XML タグ名（`<Str>`, `<Int>`, `<Bundle>`, `<App>`, `<Img>`）は、
    カタログの `"a"` フィールドに完全一致させる。省略可能な非文字列型が空の場合も `<Str/>` にせず、
    その型の空タグ（例: `<Img sr="arg4" ve="2"/>`）を出力する。
- **`<Int>` タグにおけるリテラルと変数の区別**:
  - リテラル整数は `val` 属性を使用する: `<Int sr="arg0" val="1"/>`
  - Tasker 変数を渡す場合は `val` 属性を使わず、`<var>` 子要素で包む:
    `<Int sr="arg0"><var>%my_variable</var></Int>`
- **連続する変数設定の統合（`Multiple Variables Set`）**:
  - 2つ以上の単純変数を連続して設定する場合、および `Widget v2`（`code: 461`）の直前でウィジェット用の色・設定変数
    （`%widget_color_background` 等）を準備する場合は、`Variable Set`（`code: 547`）を連ねず、
    単一の `Multiple Variables Set`（`code: 389`、`arg1` に `%name=value` を改行区切り、
    `arg4` に `<Str sr="arg4" ve="3">=</Str>`）を使用する。
- **配列・構造化データアクセス**:
  - 詳細は [variables-and-conditions.md](./references/variables-and-conditions.md) を参照する。
  - Tasker 配列は **1始まり**（`%arr(1)`, ループ範囲 `1:%arr(#)`）で扱う。
  - JSON / HTML / CSV の構造化アクセス（`%http_data.key` 等）を行う場合は、データ生成元アクションの
    `Structured Output` パラメータを明示的に `1` に設定する。連続ブラケット（`%var[a][b]`）は使わず
    `%var[a.b]` または `%var.a.b` とする。
- **エラーハンドリングと待機処理の定石**:
  - **事前条件チェック（Early Return）**: `If`（否定条件）→ `Flash`（`arg1=1`, `arg2=1`）→
    `Stop`（`code: 137`, `arg0=1`）→ `End If`。
  - **アクション実行後のエラー捕捉**: 失敗し得るアクション（`HTTP Request`, `Run Shell`, `Input Dialog` 等）には
    `<code>` 直下に `<se>false</se>` を付与し、直後に `If %err Is Set`（`op: 12`）→
    `Notify`（`code: 523`, Text に `%errmsg`, Category に `AI Errors`）→ `Stop` → `End If` を配置する。
  - **長時間待機の回避**: 30秒を超える `Wait`（`code: 30`）は避け、`%TIMES` を用いたタイムスタンプ比較や
    プロファイル分割を優先する。

### Step 3: 実機導入・設定ガイドの提示

XML レシピの作成・更新とあわせて、ユーザーが実機へ反映する際に必要な情報を提示する。

- インポート手順（対象タブの長押し → `Import`）
- 事前設定が必要なグローバル変数の一覧と設定値の形式
- 必要な Android 権限（通知アクセス、位置情報、ニアバイデバイス等）

## 3. セキュリティと品質の規律

- **機密情報のハードコード禁止**:
  API トークン、Webhook URL、パスワード、個人識別情報（電話番号、メールアドレス、SSID、位置座標等）は
  XML 内に直接記述せず、必ずグローバル変数（例: `%NOTION_API_TOKEN`）を参照させる。
- **既存 XML の段階的変更**:
  既存の XML レシピを編集する場合は、[xml-schema-and-examples.md](./references/xml-schema-and-examples.md) の
  変更規約に従い、構造や既存の ID（`<id>`, `sr` 属性等）・名前を可能な限り維持し、必要な箇所のみを外科的に変更する。
- **最小限で明快な構成**:
  1つのタスクに過剰な責務を詰め込まず、再利用や検証がしやすい単位（Project 内の Named Task 等）に分割する。

## 4. リファレンス

Tasker コンポーネントのカタログや XML スキーマの詳細は、用途に応じて以下のリファレンスを参照すること。

- [context-catalogs.md](./references/context-catalogs.md):
  Event Context カタログ、State Context カタログ、および Tasker Command System の仕様
- [action-catalog.md](./references/action-catalog.md):
  全 Action の `code`・引数型 `"a"`・デフォルト値・出力変数定義カタログ
- [variables-and-conditions.md](./references/variables-and-conditions.md):
  組み込み変数一覧（`%BATT`, `%VOLM`, `%TIMES`, `%err` 等）、配列・構造化データ（JSON / HTML / CSV）の
  アクセス構文、および条件演算子（`<ConditionList>` の `<op>` コード表・パターンマッチ規則）
- [xml-schema-and-examples.md](./references/xml-schema-and-examples.md):
  `<TaskerData>` の XML スキーマ定義、Profile / Standalone Task / Project（および `<Time>` 等）の
  構造解説、完全な XML サンプル、および既存 XML の変更規約
- [widget-v2.md](./references/widget-v2.md):
  `Widget v2`（`code: 461`）の Custom Layout JSON スキーマ、レイアウト例、Material You カラーパレット、
  および Widget 構築時の厳格ルール
- [generation-rules.md](./references/generation-rules.md):
  要件確認（Clarification）スキーマ、`Input Dialog` 種別カタログ、AI の思考プロセス、変数命名規約、
  および XML 生成時の厳格ルール群

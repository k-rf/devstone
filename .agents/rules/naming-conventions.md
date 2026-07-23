---
trigger: always_on
---

# Naming Conventions

> [!NOTE] このファイルの役割
> プロジェクトにおける命名規則と、一貫した用語の使用方法を記載しています。

## 1. 基本ルール

- **Language**: 原則として英語を使用します。
- **Case**:
  - `PascalCase`: クラス、インターフェース、`Context.Tag`、`Schema`、型定義。
  - `camelCase`: 変数、関数、プロパティ、`Effect` インスタンス。
  - `kebab-case`: ファイル名、ディレクトリ名、ブランチ名の説明部分。
- **Git ブランチ**: 作業ブランチは [branch-naming.md](./branch-naming.md) に従う（例: `feature/DEV-29/short-description`）。

## 2. Effect-TS 固有の命名

| 種類                         | プレフィックス / サフィックス | 例                    |
| :--------------------------- | :---------------------------- | :-------------------- |
| **Port (Tag)**               | なし                          | `TaskBoardPort`       |
| **Adapter (Implementation)** | `Live` (サフィックス)         | `NotionTaskBoardLive` |
| **Adapter (Mock)**           | `Mock` (サフィックス)         | `TaskBoardMock`       |
| **Service (Effect)**         | なし（動詞から開始）          | `startTogglTimer`     |
| **Schema**                   | なし（名詞）                  | `TrackingRecord`      |

## 3. Hexagonal Architecture 関連

データの流れと責任を明確にするために、以下のサフィックスを使い分けます。

- **`Payload`**: `adapter/inbound` および `adapter/outbound` において、外部（Client/Remote API）とやり取りされる通信用データ。
- **`Input`**: `core/application` が受け取る、バリデーション済みのデータ（Schema）。
- **`Output`**: `core/application` が返す結果データ。
- **`Record`**: `adapter/repository` において、ドメインモデルを保存・復元するために構造化されたデータ（Data Model）。

## 4. ファイル命名の規約

ディレクトリの役割がファイル名からも推測できるようにします。

- **Port**: `core/port/{inbound,outbound,repository}/xyz.port.ts`
- **Workflow**: `core/application/xyz.workflow.ts` (ユースケースの全体フローを定義)
- **Activity**: `core/application/xyz.activity.ts` (Workflow を構成する個別の処理アクティビティ)
- **Input**: `core/application/xyz.input.ts` (アプリケーションサービスの入力スキーマ)
- **Output**: `core/application/xyz.output.ts` (アプリケーションサービスの出力スキーマ)
- **Adapter**: `adapter/outbound/xyz.<specific>.adapter.ts`
- **Repository**: `adapter/repository/xyz.<specific>.repository.ts`
- **Handler**: `adapter/inbound/xyz.handler.ts`
- **Schema (Communication)**: `adapter/{inbound,outbound}/xyz.payload.ts`
- **Schema (Persistence)**: `adapter/repository/xyz.record.ts`

## 5. データの三態（Payload / Input / Record）

情報の「場所」と「役割」を明確に区別します。

- **Payload**: 通信用。外界（HTTP 等）の規約に従う、純粋な「積荷」。
- **Input / Output**: 論理用。Core 層が理解する、ビジネス上の「意味」。
- **Record**: 永続化用。Repository が管理する、ドメインモデルの「写し（記録）」。

## 5. 真実を語る名前

- **Boolean**: 以下の文法パターンを用いて、英語として自然で意図が明確に伝わる命名を行います。単に `is` や `can` などのプレフィックスを強制するのではなく、状況に応じて適切な品詞や助動詞を使い分けてください。
  1. **`be` 動詞 + 形容詞**: 今その状態にあるかどうか（例: `isActive`, `isEmpty`）
  2. **動詞の三人称単数現在形（三単現）**: その動作・状態に該当するか（例: `exists`, `contains`）
  3. **サ変動詞の過去分詞形**: すでにその状態にされているか。受動態であることを明確にしたい場合は `be` 動詞を伴うこともある（例: `checked`, `selected`, `isLocked`）
  4. **助動詞 + 動詞**: 助動詞（`can`, `should`, `will` など）の表すニュアンスを利用する（例: `canPlay`, `shouldNotify`, `willFetch`）
  5. **現在分詞**: 現時点でその動作・処理が継続しているかどうかを表す（例: `running`, `downloading`）
  6. **`has` / `have` + 過去分詞**: 処理がすでに完了しているかどうかを表す（例: `hasFinished`, `done`）
- **Collection**: `items`, `records` などの複数形、あるいは `List` サフィックスを検討してください。
- **Effect**: 副作用を伴う場合は、その振る舞いを明示する動詞を選んでください。

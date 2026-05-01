# Naming Conventions

> [!NOTE] このファイルの役割
> プロジェクトにおける命名規則と、一貫した用語の使用方法を記載しています。

## 1. 基本ルール

- **Language**: 原則として英語を使用します。
- **Case**:
  - `PascalCase`: クラス、インターフェース、`Context.Tag`、`Schema`、型定義。
  - `camelCase`: 変数、関数、プロパティ、`Effect` インスタンス。
  - `kebab-case`: ファイル名、ディレクトリ名。

## 2. Effect-TS 固有の命名

| 種類                         | プレフィックス / サフィックス | 例                    |
| :--------------------------- | :---------------------------- | :-------------------- |
| **Port (Tag)**               | なし                          | `TaskBoardPort`       |
| **Adapter (Implementation)** | `Live` (サフィックス)         | `NotionTaskBoardLive` |
| **Adapter (Mock)**           | `Test` / `Mock`               | `TestTaskBoardLive`   |
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
- **Service**: `core/application/xyz.service.ts`
- **Adapter**: `adapter/{inbound,outbound,repository}/xyz.adapter.ts`
- **Handler**: `adapter/inbound/xyz.handler.ts`
- **Schema (Communication)**: `adapter/{inbound,outbound}/xyz.payload.ts`
- **Schema (Persistence)**: `adapter/repository/xyz.record.ts`

## 5. データの三態（Payload / Input / Record）

情報の「場所」と「役割」を明確に区別します。

- **Payload**: 通信用。外界（HTTP 等）の規約に従う、純粋な「積荷」。
- **Input / Output**: 論理用。Core 層が理解する、ビジネス上の「意味」。
- **Record**: 永続化用。Repository が管理する、ドメインモデルの「写し（記録）」。

## 5. 真実を語る名前

- **Boolean**: `is`, `has`, `should`, `can` で開始します。
- **Collection**: `items`, `records` などの複数形、あるいは `List` サフィックスを検討してください。
- **Effect**: 副作用を伴う場合は、その振る舞いを明示する動詞を選んでください。

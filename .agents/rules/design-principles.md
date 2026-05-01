# Design Principles

> [!NOTE] このファイルの役割
> プロジェクトの根幹を成す設計哲学と、SOLID / DRY 原則の具体的な適用指針を記載しています。

## 1. Single Responsibility Principle (単一責任の原則)

「一つのモジュールは、ただ一つのアクター（変更理由）に対して責任を持つ」という原則を、Effect-TS の文脈で徹底します。

- **Service の粒度**: 一つの `Service`（ユースケース）は、一つのビジネスイベントを完遂することに集中します。
- **Layer の分離**: 外部 API との通信（Adapter）と、ビジネスロジック（Core）を明確に分離し、ロジックの中に `fetch` や `KV` 操作を混ぜないでください。
- **Small Effects**: 複雑な `Effect` は、小さな意味のある単位に分割し、`Effect.gen` で合成します。

## 2. DRY: Don't Repeat Yourself (知識の重複回避)

DRY の本質は「コードの見た目」ではなく「知識」の一元化です。

- **Schema as Single Source of Truth**: 入出力のバリデーション、型定義、エラー処理の基点を `Effect.Schema` に集約します。
- **Domain Modeling**: ビジネスルールは `core/domain` に集約し、複数の `Service` で同じルールを再実装しないようにします。
- **Utility Logic**: 汎用的な変換ロジック（例: 日付操作）は `packages/libs` へ切り出し、ワークスペース全体で共有します。

## 3. Dependency Inversion Principle (依存性逆転の原則)

上位モジュールが下位モジュールに依存するのではなく、双方が「抽象」に依存するようにします。

- **Port-based Interface**: `core/application` は `adapter` を直接参照せず、
  `core/port` で定義された `Context.Tag` を通じて外部サービスを呼び出します。
- **Late Binding**: 具体的な実装（Layer）はアプリケーションの「最外殻（`index.ts`）」で注入します。これにより、ビジネスロジックを一切変更せずに、モックや異なる環境への差し替えを可能にします。

## 4. Separation of Concerns (関心の分離)

Hexagonal Architecture の境界を厳格に守ります。

- **Inside (Core)**: ビジネスの「なぜ」と「何」を記述。
- **Outside (Adapter)**: 技術的な「どうやって」を記述。
- **Boundary**: 境界を越えるデータの変換（Mapper）は、常に **Adapter 層** の責任です。

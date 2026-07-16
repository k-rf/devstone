---
trigger: always_on
---

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

## 5. Validation & Application Service Layering (バリデーションの分離とアプリケーションサービスの階層化)

堅牢なシステムを構築するため、バリデーションの責務を明確に分離し、アプリケーションサービス（ユースケース）の処理構造を一貫させます。

### 5.1. 構文的バリデーションと意味論的バリデーションの分離

- **構文的バリデーション（Syntax Validation）**: 外部からの入力値の型や形式のチェック。
  - これは **Adapter 層 (CLI, HTTP コントローラ等)** の責務です。
  - Adapter 層ではビジネスロジックの組み立てやデータのマージ、ノード種類の判定などを行わず、パースした値を単一のアプリケーションサービス（Workflow）へ引き渡すことだけに集中します。これにより、外部アダプター層から無駄な条件分岐（if文など）が排除され、テストカバレッジの向上と責務の純粋化が両立します。
- **意味論的バリデーション（Semantic Validation）**: ビジネスルールやエンティティの状態変化の妥当性チェック。
  - これは **Core 層 (Application/Domain)** の責務です。後述する Workflow の中で行います。

### 5.2. Workflow と Activity の分離 (Application Service)

`core/application` におけるユースケース（Service）は、一連のビジネスフローを統治する
**Workflow** と、その中で実行される個別の具体的な処理ステップである **Activity** に構造化して記述します。

- **Workflow**:
  - ビジネスイベントを完遂する全体フローを表現します。
  - `Effect.gen` やパイプラインを用いて、各 Activity を繋ぎ合わせるオーケストレーターとして機能します。
- **Activity**:
  - Workflow を構成する、再利用可能で閉じた単一の操作単位（例：既存データの取得、データのマージなど）です。
  - 小さな `Effect` として定義し、Workflow から合成して呼び出します。
  - **ただ階層をかませただけの無駄な Activity は定義しないこと**:
    - 他の層の関数を単に呼び出して結果を返すだけの単純な委譲処理は、Activity として定義しません。
      そのような場合は、Workflow から直接対象の関数を呼び出してください。
    - Activity として定義・抽出するべきなのは、複数の処理からなるデータ変換やマージ、副作用を伴う操作など、
      ユースケースにおいて「意味のある独立した処理のまとまり」が存在する場合に限ります。

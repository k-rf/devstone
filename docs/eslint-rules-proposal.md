# ESLint自動化ルールプロポーザル

## 1. 導入

本ドキュメントは、Devstoneプロジェクトのコード品質、アーキテクチャ境界、命名規約、
およびテスト/Storybookの標準を自動でチェックするためのESLintルールプロポーザルである。
静的解析ツールを適切に導入し、開発者の認知負荷を下げつつ
「誤った設計・実装を物理的に書けない仕組み」を構築することで、
長期的で堅牢なコードベースの維持を目指す。

本提案では、既存プラグインの設定のみで即時導入可能なルールと、
プロジェクト固有のディレクトリ構造や型定義を検証するためにカスタムAST（Abstract Syntax Tree）
ルールを構築するものの2つのアプローチで構成している。

---

## 2. ルール一覧（サマリーテーブル）

| ルール名 / 識別子                        | カテゴリ                       | 定義元ドキュメント                                              | 実装方針                                                                    |
| :--------------------------------------- | :----------------------------- | :-------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| `devstone/hexagonal-boundary`            | Architecture & Boundary        | [architecture.md][arch_doc], [design-principles.md][design_doc] | `import/no-restricted-paths`                                                |
| `devstone/outbound-partitioning`         | Architecture & Boundary        | [architecture.md][arch_doc]                                     | カスタムASTルール (ファイルパス検証)                                        |
| `devstone/no-core-side-effects`          | Architecture & Boundary        | [design-principles.md][design_doc]                              | `no-restricted-globals`/`no-restricted-syntax` (非決定論的処理の禁止を含む) |
| `devstone/logic-free-inbound-adapters`   | Architecture & Boundary        | [design-principles.md][design_doc]                              | `no-restricted-syntax` (条件分岐の制限)                                     |
| `devstone/no-simple-delegation-activity` | Architecture & Boundary        | [design-principles.md][design_doc]                              | カスタムASTルール (呼び出し構成検証)                                        |
| `devstone/hexagonal-suffix-boundaries`   | Architecture & Boundary        | [naming-conventions.md][naming_doc]                             | カスタムASTルール (スキーマ変数とパス整合性、UI等除外)                      |
| `devstone/path-naming-conventions`       | Naming, Structure & Effect-TS  | [naming-conventions.md][naming_doc]                             | カスタムASTルール (パス別の命名強制)                                        |
| `devstone/export-role-suffixes`          | Naming, Structure & Effect-TS  | [naming-conventions.md][naming_doc]                             | カスタムASTルール (エクスポート名検証)                                      |
| `devstone/matching-tag-identifier`       | Naming, Structure & Effect-TS  | [naming-conventions.md][naming_doc]                             | カスタムASTルール (再帰的ASTヘルパーによる検証)                             |
| `@typescript-eslint/naming-convention`   | Naming, Structure & Effect-TS  | [naming-conventions.md][naming_doc]                             | `@typescript-eslint/naming-convention` (Schema/Adapter特化規則)             |
| `unicorn/filename-case`                  | Naming, Structure & Effect-TS  | [naming-conventions.md][naming_doc]                             | `unicorn/filename-case`                                                     |
| `devstone/no-warnings`                   | Quality, Immutability & Values | [code-quality.md][quality_doc]                                  | CLI設定およびカスタムASTルール                                              |
| `unicorn/no-null`                        | Quality, Immutability & Values | [code-quality.md][quality_doc]                                  | `unicorn/no-null`                                                           |
| `functional/prefer-readonly-type`        | Quality, Immutability & Values | [code-quality.md][quality_doc]                                  | `eslint-plugin-functional` (`prefer-readonly-type` / `immutable-data` 統合) |
| `functional/no-let`                      | Quality, Immutability & Values | [code-quality.md][quality_doc]                                  | `eslint-plugin-functional`                                                  |
| `functional/no-loop-statements`          | Quality, Immutability & Values | [code-quality.md][quality_doc]                                  | `eslint-plugin-functional`                                                  |
| `no-restricted-syntax` (as any)          | Quality, Immutability & Values | [code-quality.md][quality_doc]                                  | `no-restricted-syntax` (`any`キャスト禁止)                                  |
| `devstone/no-throw-in-production`        | Quality, Immutability & Values | [code-quality.md][quality_doc]                                  | `no-restricted-syntax` (本番コードでの例外throw禁止)                        |
| `devstone/single-function-per-file`      | Quality, Immutability & Values | [code-quality.md][quality_doc]                                  | カスタムASTルール (エクスポート数検証)                                      |
| `devstone/no-ui-spec-files`              | Testing & Storybook Quality    | [devstone-ui-storybook-standard/SKILL.md][storybook_skill]      | カスタムASTルール (UIテスト記述場所制限)                                    |
| `devstone/storybook-no-title`            | Testing & Storybook Quality    | [devstone-ui-storybook-standard/SKILL.md][storybook_skill]      | `no-restricted-syntax` (satisfies考慮title制限)                             |
| `devstone/storybook-no-autodocs-tag`     | Testing & Storybook Quality    | [devstone-ui-storybook-standard/SKILL.md][storybook_skill]      | `no-restricted-syntax` (satisfies考慮tags制限)                              |
| `devstone/storybook-require-satisfies`   | Testing & Storybook Quality    | [devstone-ui-storybook-standard/SKILL.md][storybook_skill]      | カスタムASTルール (satisfies強制)                                           |
| `devstone/require-in-source-tests`       | Testing & Storybook Quality    | [devstone-testing-standard/SKILL.md][testing_skill]             | カスタムASTルール (インソーステストの強制と例外ルール)                      |
| `devstone/test-descriptions-japanese`    | Testing & Storybook Quality    | [devstone-testing-standard/SKILL.md][testing_skill]             | カスタムASTルール (テスト名の日本語検証)                                    |
| `devstone/no-single-describe`            | Testing & Storybook Quality    | [devstone-testing-standard/SKILL.md][testing_skill]             | カスタムASTルール (describeフラット化)                                      |
| `devstone/schema-error-no-cast`          | Testing & Storybook Quality    | [devstone-testing-standard/SKILL.md][testing_skill]             | カスタムASTルール (デコードキャスト制限)                                    |
| `devstone/effect-assert-error-flip`      | Testing & Storybook Quality    | [devstone-testing-standard/SKILL.md][testing_skill]             | `no-restricted-syntax` (例外的なExitチェック緩和)                           |

---

## 3. 各ルールの詳細仕様

### Category 1: Architecture & Boundary Rules

#### 3.1.1. `devstone/hexagonal-boundary`

- **カテゴリ**: Architecture & Boundary Rules
- **目的 / 概要**: ビジネスロジックを保持する Core 層 (`core/domain`, `core/application`,
  `core/port`) は、外部の実装詳細である Adapter 層 (`adapter`) に直接依存してはならない。
  Core層のファイルからAdapter層をインポートすることを禁止する。
- **定義元ドキュメント**: [architecture.md][arch_doc] (lines 40-47, 49-62) および
  [design-principles.md][design_doc] (lines 22-29)
- **コード例**:
  - **OK**:

    ```typescript
    // apps/easel/src/core/application/read-canvas.activity.ts
    import { CanvasRepository } from "../port/repository/canvas.repository.js";
    ```

  - **NG**:

    ```typescript
    // apps/easel/src/core/application/read-canvas.activity.ts
    // Core層が具体的なAdapter層の実装に依存している
    import { CanvasFileRepository } from "../../adapter/repository/canvas.file.repository.js";
    ```

- **実装詳細**:
  `eslint-plugin-import-x` の `import/no-restricted-paths` ルールを使用し、
  Core層からAdapter層への依存を制限する。

  ```typescript
  // eslint.config.ts
  import importPlugin from "eslint-plugin-import-x";

  export default [
    {
      plugins: { import: importPlugin },
      rules: {
        "import/no-restricted-paths": [
          "error",
          {
            zones: [
              {
                target: "**/src/core/**/*",
                from: "**/src/adapter/**/*",
                message: "Core layer must not depend on Adapter layer.",
              },
            ],
          },
        ],
      },
    },
  ];
  ```

---

#### 3.1.2. `devstone/outbound-partitioning`

- **カテゴリ**: Architecture & Boundary Rules
- **目的 / 概要**: 外部のサービスとやり取りする Outbound 系の Port および Adapter は、
  技術スタック（例: HTTP, KV）ではなく、接続先サービス単位（例: `notion`, `toggl`）で
  ディレクトリを分割しなければならない。また、`outbound` の直下にフラットに
  ファイルを置いてはならない。
- **定義元ドキュメント**: [architecture.md][arch_doc] (lines 57, 61)
- **コード例**:
  - **OK**:
    - `apps/easel/src/core/port/outbound/notion/notion.port.ts`
    - `apps/easel/src/adapter/outbound/notion/notion.http.adapter.ts`
  - **NG**:
    - `apps/easel/src/core/port/outbound/notion.ts` (ディレクトリ分割せずに直下に配置)
    - `apps/easel/src/adapter/outbound/http/notion.ts` (技術スタック `http` で分割)
- **実装詳細**:
  カスタムASTルールとして実装。`context.filename` が `**/core/port/outbound/**` または
  `**/adapter/outbound/**` に合致する場合にチェックを行う。
  `outbound/` 直後に来るサブディレクトリを切り出し、それが空（直下配置）または
  禁止技術名（`http`, `kv`, `db`, `database`, `fetch`, `rest`, `graphql`, `api`, `r2`, `d1`）
  である場合にエラーを報告する。

---

#### 3.1.3. `devstone/no-core-side-effects`

- **カテゴリ**: Architecture & Boundary Rules
- **目的 / 概要**: ビジネスロジック（Core層）内で直接、外部通信（globalの `fetch`）や
  Cloudflare のストレージタイプ（`KVNamespace`, `D1Database`, `R2Bucket`）などの
  副作用に依存してはならない。また、非決定論的な処理（`Date.now()`, `new Date()`, `Math.random()`）を
  Core内で直接使用することも禁止する。これらは必ず Outbound Port を通じて隠蔽し、
  あるいは Effect-TS の `Clock` や `Random` を通じてモック可能にしなければならない。
- **定義元ドキュメント**: [design-principles.md][design_doc] (line 11)
- **コード例**:
  - **OK**:

    ```typescript
    // apps/easel/src/core/application/read-canvas.activity.ts
    const repo = yield * CanvasRepository;
    return yield * repo.read();
    ```

  - **NG**:

    ```typescript
    // apps/easel/src/core/application/read-canvas.activity.ts
    // Portを通さず、グローバルの fetch を直接呼び出している
    const res = yield * Effect.tryPromise(() => fetch("https://api.example.com/canvas"));

    // Core内で直接、非決定論的な時間を生成している
    const now = Date.now();
    ```

- **実装詳細**:
  ESLintのビルトインルールである `no-restricted-globals` および `no-restricted-syntax` を
  Core層のファイル（`apps/*/src/core/**/*.ts`）に対して設定する。
  Cloudflare の型参照については、`Platform.KVNamespace` のように Namespace 経由で参照された場合（`TSQualifiedName`）にも
  検知できるように `:matches` セレクターを用いる。

  ```typescript
  // eslint.config.ts
  export default [
    {
      files: ["apps/*/src/core/**/*.ts"],
      rules: {
        "no-restricted-globals": [
          "error",
          {
            name: "fetch",
            message: "Do not use fetch directly inside Core. Use Outbound Ports instead.",
          },
        ],
        "no-restricted-syntax": [
          "error",
          {
            selector:
              "TSTypeReference[typeName:matches(Identifier[name=/^(KVNamespace|D1Database|R2Bucket)$/], TSQualifiedName[right.name=/^(KVNamespace|D1Database|R2Bucket)$/])]",
            message: "Cloudflare storage types are forbidden in Core. Use Outbound Ports instead.",
          },
          {
            selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
            message: "Do not use Date.now() in Core. Use Effect-TS Clock instead.",
          },
          {
            selector: "NewExpression[callee.name='Date'][arguments.length=0]",
            message: "Do not use new Date() with 0 arguments in Core. Use Effect-TS Clock instead.",
          },
          {
            selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
            message: "Do not use Math.random() in Core. Use Effect-TS Random instead.",
          },
        ],
      },
    },
  ];
  ```

---

#### 3.1.4. `devstone/logic-free-inbound-adapters`

- **カテゴリ**: Architecture & Boundary Rules
- **目的 / 概要**: HTTPハンドラやCLIコマンドなどの Inbound Adapter 層は、
  入力値のパースと Workflow への委譲のみを担当すべきであり、
  ビジネスロジックを組み立てるための条件分岐を行ってはならない。
  入力値の構文検証（syntax validation）は Inbound Adapter またはミドルウェアの責務として行う。

  **設計背景と合理的理由**:
  インバウンドアダプター内に条件分岐が混入すると、アダプター自体がドメイン知識や制御フローの決定権を
  持つようになり、ヘキサゴナルアーキテクチャにおける境界が曖昧になる。そのため、バリデーションエラーの
  ハンドリングやロジックフローの分岐は、`Effect.flatMap` などの Effect-TS パイプライン、
  あるいは専用のミドルウェアに委譲しなければならない。これにより、インバウンドアダプターから
  命令的な条件分岐制御ステートメントを排除し、宣言的で型安全なエラーハンドリングと
  一貫したワークフロー実行を保証する。

- **定義元ドキュメント**: [design-principles.md][design_doc] (lines 42-49)
- **コード例**:
  - **OK**:

    ```typescript
    // apps/easel/src/adapter/inbound/cli/edge/update.ts
    export const updateEdgeCommand = Command.make("update", { ... }).pipe(
      Command.withHandler(({ file, id, fromNode, toNode }) =>
        updateEdgeWorkflow({ id, fromNode, toNode }).pipe(
          provideCanvasRepository(file),
          Effect.tap(() => Console.log(`Successfully updated`))
        )
      )
    );
    ```

  - **NG**:

    ```typescript
    // apps/easel/src/adapter/inbound/cli/edge/update.ts
    export const updateEdgeCommand = Command.make("update", { ... }).pipe(
      Command.withHandler(({ file, id, fromNode, toNode }) => {
        // NG: アダプター層の中に条件分岐によるビジネスロジックが紛れ込んでいる
        if (!fromNode && !toNode) {
          return Console.error("At least one parameter must be updated");
        }
        return updateEdgeWorkflow({ id, fromNode, toNode }).pipe(...);
      })
    );
    ```

- **実装詳細**:
  `no-restricted-syntax` を用いて、`apps/*/src/adapter/inbound/**/*.ts` 内における
  手続き的な条件分岐のASTノードを禁止する。

  ```typescript
  // eslint.config.ts
  export default [
    {
      files: ["apps/*/src/adapter/inbound/**/*.ts"],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "IfStatement",
            message:
              "Inbound adapters should not contain conditional statements (IfStatement). Prefer validation pipelines.",
          },
          {
            selector: "SwitchStatement",
            message:
              "Inbound adapters should not contain conditional statements (SwitchStatement). Prefer validation pipelines.",
          },
        ],
      },
    },
  ];
  ```

---

#### 3.1.5. `devstone/no-simple-delegation-activity`

- **カテゴリ**: Architecture & Boundary Rules
- **目的 / 概要**: `core/application` において、単に他の層の関数（RepositoryやDomainモデル等）
  を呼び出してそのまま返すだけの単純な委譲処理を Activity として定義することを禁止する。
  そのような場合は、Workflow から直接呼び出さなければならない。
- **定義元ドキュメント**: [design-principles.md][design_doc] (lines 50-65)
- **コード例**:
  - **OK**:

    ```typescript
    // apps/easel/src/core/application/validate-edge-schema.activity.ts
    export const validateEdgeSchemaActivity = (edgeData: unknown) =>
      Effect.try({
        try: () => Schema.decodeUnknownSync(EdgeSchema)(edgeData),
        catch: (error) => new CanvasError({ message: "...", cause: error }),
      });
    ```

  - **NG**:

    ```typescript
    // apps/easel/src/core/application/read-canvas.activity.ts
    export const readCanvasActivity = () =>
      Effect.gen(function* () {
        const repo = yield* CanvasRepository;
        return yield* repo.read(); // 単にPortを呼び出すだけの委譲処理
      });
    ```

- **実装詳細**:
  カスタムASTルールを構築する。ファイル名が `**/*.activity.ts` に合致する場合に適用する。
  エクスポートされた関数内のステートメントをチェックし、`Effect.gen` 内部が
  Context の Tag 取得と、その Tag に対する直接のメソッド呼び出し（かつ yield / return）のみで
  構成されている場合にエラーとする。

---

#### 3.1.6. `devstone/hexagonal-suffix-boundaries`

- **カテゴリ**: Architecture & Boundary Rules
- **目的 / 概要**: ヘキサゴナルアーキテクチャの型構造を示す特定のサフィックス
  （`Payload`, `Input`, `Output`, `Record`）を持つ識別子は、
  それぞれ対応するディレクトリ内にのみ配置されなければならない。
  - `Payload` -> `/adapter/(inbound|outbound)/`
  - `Input` / `Output` -> `/core/application/`
  - `Record` -> `/adapter/repository/`
  - _例外_:
    - UIコンポーネントライブラリ等（例: `/packages/design-system/`）配下のファイルはチェック対象外とする。
    - エイリアスの末尾が `Props` である場合（例：`TextInputProps`）は除外する。
    - クラス宣言（`ClassDeclaration`）で末尾が `Input` または `Output` の場合（Reactのクラスコンポーネントなど）は除外する。
    - `const MyPayload = Schema.Struct(...)` のように `VariableDeclarator`
      でスキーマ変数として宣言された定数もスキャン対象とするが、変数宣言の初期化式（`init`）内で
      `Schema` への参照が存在する場合に限定して境界ルールを適用し、通常のコンポーネント変数などに対する誤検知を防ぐ。
- **定義元ドキュメント**: [naming-conventions.md][naming_doc] (line 24)
- **コード例**:
  - **OK**:
    - `NotionWebhookPayload` (`webhook.payload.ts` / adapter/inbound配下)
    - `CreateCanvasInput` (`create-canvas.input.ts` / core/application配下)
  - **NG**:
    - `NotionWebhookPayload` (`task-board-item.ts` / core/domain配下)
- **実装詳細**:
  カスタムASTルールを構築する。すべての `TSTypeAliasDeclaration`,
  `TSInterfaceDeclaration`, `ClassDeclaration`, および `VariableDeclarator` の識別子（名前）をスキャンする。
  `hasIdentifier` を使用する。親ノードへの逆行探索による循環参照と
  コールスタック上限エラー（Stack Overflow）を防ぐため `parent` キーをスキップすることに加え、
  巨大なASTツリーでのパフォーマンス低下を避けるために `loc` や `range` などの
  非式/メタデータキーの探索も明示的にスキップすることを推奨する。
  また、`Object.create(null)` 等で作成された null プロトタイプオブジェクトの検証時でもクラッシュしないよう、
  `node.hasOwnProperty` ではなく `Object.prototype.hasOwnProperty.call` を使用する。

  ```typescript
  const BOUNDARIES: Record<string, RegExp> = {
    Payload: /\/adapter\/(inbound|outbound)\//,
    Input: /\/core\/application\//,
    Output: /\/core\/application\//,
    Record: /\/adapter\/repository\//,
  };

  function hasIdentifier(node: any, name: string): boolean {
    if (!node) return false;
    if (node.type === "Identifier") {
      return node.name === name;
    }
    for (const key in node) {
      if (key === "parent" || key === "loc" || key === "range") continue;
      if (
        Object.prototype.hasOwnProperty.call(node, key) &&
        node[key] &&
        typeof node[key] === "object"
      ) {
        if (Array.isArray(node[key])) {
          if (node[key].some((child: any) => hasIdentifier(child, name))) {
            return true;
          }
        } else if (hasIdentifier(node[key], name)) {
          return true;
        }
      }
    }
    return false;
  }

  export default {
    create(context) {
      const filename = context.getFilename().replace(/\\/g, "/");

      if (filename.includes("packages/design-system/")) {
        return {};
      }

      function checkIdentifier(node: any, name: string) {
        if (name.endsWith("Props")) return;

        for (const [suffix, pathRegex] of Object.entries(BOUNDARIES)) {
          if (name.endsWith(suffix)) {
            if ((suffix === "Input" || suffix === "Output") && node.type === "ClassDeclaration") {
              continue;
            }

            if (!pathRegex.test(filename)) {
              context.report({
                node,
                message: `Identifier '${name}' ends with suffix '${suffix}' but is located in '${filename}'. It must be placed in a path matching: ${pathRegex}`,
              });
            }
          }
        }
      }

      return {
        TSTypeAliasDeclaration(node) {
          checkIdentifier(node, node.id.name);
        },
        TSInterfaceDeclaration(node) {
          checkIdentifier(node, node.id.name);
        },
        ClassDeclaration(node) {
          if (node.id) {
            checkIdentifier(node, node.id.name);
          }
        },
        VariableDeclarator(node) {
          const name = node.id.name;
          if (!name) return;

          const hasHexagonalSuffix = Object.keys(BOUNDARIES).some((suffix) =>
            name.endsWith(suffix),
          );
          if (!hasHexagonalSuffix) return;

          const isSchema = node.init && hasIdentifier(node.init, "Schema");
          if (isSchema) {
            checkIdentifier(node, name);
          }
        },
      };
    },
  };
  ```

---

### Category 2: Naming, Structure & Effect-TS Conventions

#### 3.2.1. `devstone/path-naming-conventions`

- **カテゴリ**: Naming, Structure & Effect-TS Conventions
- **目的 / 概要**: ファイルが配置されているディレクトリに基づき、
  ファイル名に正しい役割サフィックスを付与することを強制する
  （spec、test、index、preview等は除く）。
  - `/core/port/` -> `*.port.ts` or `*.port.tsx` (リポジトリポートである `/core/port/repository/` を含む)
  - `/core/application/` -> `*.workflow.ts`, `*.activity.ts`, `*.input.ts`, or `*.output.ts`
  - `/adapter/outbound/` -> `*.adapter.ts` or `*.payload.ts`
  - `/adapter/repository/` -> `*.repository.ts` or `*.record.ts`
  - `/adapter/inbound/` -> `*.handler.ts`, `*.payload.ts`, or `*.route.ts`
- **定義元ドキュメント**: [naming-conventions.md][naming_doc] (line 33)
- **コード例**:
  - **OK**:
    - `apps/easel/src/core/application/add-edge.workflow.ts`
    - `apps/easel/src/core/port/repository/canvas.port.ts`
    - `apps/easel/src/core/application/create-canvas.input.ts`
  - **NG**:
    - `apps/easel/src/core/application/add-edge.ts` (サフィックスがない)
- **実装詳細**:
  カスタムASTルールとしてファイルパス（Windows環境を考慮して
  `context.getFilename().replace(/\\/g, "/")` で正規化したもの）を検証する。
  対象ディレクトリに属するファイルが、期待されるサフィックスのいずれかで
  終了しているかを判定し、違反している場合はエラーとする。

  **注意**: `/core/port/repository/` 配下に配置されるリポジトリポート（例：`canvas.port.ts`）は、
  パス内に `/core/port/repository/` を含むが、これは `/core/port/` の一部であるため、
  一貫して `*.port.ts` サフィックスを要求する。

---

#### 3.2.2. `devstone/export-role-suffixes`

- **カテゴリ**: Naming, Structure & Effect-TS Conventions
- **目的 / 概要**: 特定の役割サフィックス（`.workflow.ts`, `.activity.ts`）
  を持つファイルは、その役割と同じサフィックスを持つ変数または関数
  （例: `Workflow`, `Activity`）のみをエクスポートしなければならない。
- **定義元ドキュメント**: [naming-conventions.md][naming_doc] (line 33)
- **コード例**:
  - **OK**:
    - `add-edge.workflow.ts` -> `export const addEdgeWorkflow = ...`
  - **NG**:
    - `add-edge.workflow.ts` -> `export const addEdge = ...` (サフィックスがない)
- **実装詳細**:
  カスタムASTルールとして実装。ファイルの拡張子（`.workflow.ts` 等）を判定し、
  `ExportNamedDeclaration` の内部にあるすべての変数/関数宣言名が、
  ファイルに対応する文字列（`Workflow` 等）で終了しているかを確認する。

---

#### 3.2.3. `devstone/matching-tag-identifier`

- **カテゴリ**: Naming, Structure & Effect-TS Conventions
- **目的 / 概要**: `Context.Tag` または `Data.TaggedError` を継承して作成されるクラスは、
  そのクラス名と全く同一の文字列リテラルを引数に渡さなければならない
  （Effect-TSのデバッグおよび実行時エラー検証の整合性のため）。
  本ルールは `ClassDeclaration` と `ClassExpression` の双方を監視し、無名クラスやクラス式におけるクラス名も以下のように解決する：
  1. `node.id` が存在する場合は、その名前（`node.id.name`）を使用する。
  2. `node.id` が `null` であり、かつ `VariableDeclarator` 内の `ClassExpression` である場合は、変数名（`node.parent.id.name`）をクラス名として解決する。
  3. その他の無名クラス宣言（例：`export default class extends ...`）は、
     クラス名が特定できずタグの整合性を検証できないため、`Context.Tag` または
     `Data.TaggedError` を継承することを禁止（エラー報告）する。
     ジェネリクス型パラメータを持つ場合（例：`extends Context.Tag("X")<Y>()`）は、
     `TSInstantiationExpression` にラップされるため、再帰的に AST を unwrapping して
     コアの呼び出し式を抽出する。
- **定義元ドキュメント**: [naming-conventions.md][naming_doc] (line 14)
- **コード例**:
  - **OK**:

    ```typescript
    export class TaskBoardPort
      extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {}
    export class TaskBoardError
      extends Data.TaggedError("TaskBoardError")<{...}> {}

    // クラス式で変数名から解決可能な場合
    const TaskBoardPortExpression = class extends Context.Tag("TaskBoardPortExpression")<TaskBoardPort>() {};
    ```

  - **NG**:

    ```typescript
    export class TaskBoardPort
      extends Context.Tag("NotionTaskBoard")<TaskBoardPort>() {}
    export class TaskBoardError
      extends Data.TaggedError("ErrorTaskBoard")<{...}> {}

    // 解決できない匿名クラス宣言で継承を行っている場合
    export default class extends Context.Tag("AnonymousPort")<any>() {}
    ```

- **実装詳細**:
  カスタムASTルールとして実装。クラスの `superClass` が型アサーションや型パラメータで
  ラップされていても対応できるように、再帰的ヘルパー `findTagOrErrorCall` を用いて、
  実際の `Context.Tag` / `Data.TaggedError` の CallExpression を検出し、
  その第1引数の文字列とクラス名が一致しているかを検証する。

  ```typescript
  function findTagOrErrorCall(node: any): any | null {
    if (!node) return null;

    if (node.type === "CallExpression") {
      let callee = node.callee;
      while (callee && callee.type === "TSInstantiationExpression") {
        callee = callee.expression;
      }

      if (callee) {
        if (
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.property.type === "Identifier" &&
          ((callee.object.name === "Context" && callee.property.name === "Tag") ||
            (callee.object.name === "Data" && callee.property.name === "TaggedError"))
        ) {
          return node;
        }
        if (
          callee.type === "Identifier" &&
          (callee.name === "Tag" || callee.name === "TaggedError")
        ) {
          return node;
        }
        if (callee.type === "CallExpression") {
          return findTagOrErrorCall(callee);
        }
      }
    }

    if (node.type === "TSInstantiationExpression") {
      return findTagOrErrorCall(node.expression);
    }

    return null;
  }

  export default {
    create(context) {
      function checkClass(node: any) {
        if (!node.superClass) return;

        const tagCall = findTagOrErrorCall(node.superClass);
        if (!tagCall) return;

        let className: string | null = null;
        if (node.id) {
          className = node.id.name;
        } else if (
          node.type === "ClassExpression" &&
          node.parent &&
          node.parent.type === "VariableDeclarator" &&
          node.parent.id &&
          node.parent.id.type === "Identifier"
        ) {
          className = node.parent.id.name;
        }

        if (!className) {
          context.report({
            node: node.superClass,
            message: `匿名クラスで Context.Tag または Data.TaggedError を継承することは禁止されているか、クラス名が特定できないためタグの整合性を検証できません。`,
          });
          return;
        }

        const firstArg = tagCall.arguments[0];
        if (!firstArg || firstArg.type !== "Literal" || firstArg.value !== className) {
          context.report({
            node: firstArg || tagCall,
            message: `クラス名 "${className}" と、Tag/TaggedErrorの引数 "${firstArg ? firstArg.value : ""}" が一致していません。`,
          });
        }
      }

      return {
        ClassDeclaration(node) {
          checkClass(node);
        },
        ClassExpression(node) {
          checkClass(node);
        },
      };
    },
  };
  ```

---

#### 3.2.4. `@typescript-eslint/naming-convention`

- **カテゴリ**: Naming, Structure & Effect-TS Conventions
- **目的 / 概要**: 変数、プロパティ、パラメータなどの命名規約を制限し、コードベース全体での一貫性を強制する。
  - `boolean` 型の変数には `is`, `has`, `should`, `can` プレフィックスを強制する。
  - `Effect.Schema` などのスキーマや hexagonal 境界モデル（`Schema`, `Payload`, `Input`, `Output`, `Record`
    サフィックス）で定義された `const` 変数については、型と値の双方を表現する役割を持つため例外的に `PascalCase`
    での記述を許容する。
  - 本番用のアダプター実装クラス（`/adapter/` 以下に配置され、テスト/モック用ファイル以外）については `Live` サフィックス（例：`NotionTaskBoardLive`）を強制する。
  - テスト・モック用のアダプタークラス（`*.mock.ts` や `mocks` ディレクトリ配下）については、`Mock` プレフィックスを強制する。
- **定義元ドキュメント**: [naming-conventions.md][naming_doc] (line 54)
- **コード例**:
  - **OK**:
    - `const isValid: boolean = true;`
    - `const TrackingRecord = Schema.Struct(...)` (PascalCase const Schema)
    - `class NotionTaskBoardLive implements TaskBoard`
    - `class MockTaskBoard implements TaskBoard`
  - **NG**:
    - `const valid: boolean = true;`
    - `const trackingRecord = Schema.Struct(...)` (camelCase)
- **実装詳細**:
  `@typescript-eslint/eslint-plugin` の `@typescript-eslint/naming-convention` ルールおよび
  ESLint の Flat Config を構成する。

  ```typescript
  // eslint.config.ts
  export default [
    {
      rules: {
        "@typescript-eslint/naming-convention": [
          "error",
          // デフォルト規則
          {
            selector: "default",
            format: ["camelCase"],
            leadingUnderscore: "allow",
            trailingUnderscore: "allow",
          },
          // boolean変数のプレフィックス強制
          {
            selector: "variable",
            types: ["boolean"],
            format: ["camelCase"],
            prefix: ["is", "has", "should", "can"],
          },
          {
            selector: "parameter",
            types: ["boolean"],
            format: ["camelCase"],
            prefix: ["is", "has", "should", "can"],
          },
          // スキーマ変数・境界型定数は PascalCase を許容する
          {
            selector: "variable",
            modifiers: ["const"],
            format: ["camelCase", "UPPER_CASE", "PascalCase"],
            filter: {
              regex: "^[A-Z]",
              match: true,
            },
          },
          {
            selector: "typeLike",
            format: ["PascalCase"],
          },
          {
            selector: "property",
            format: ["camelCase", "PascalCase", "UPPER_CASE"],
          },
          {
            selector: "parameter",
            format: ["camelCase"],
            leadingUnderscore: "allow",
          },
        ],
      },
    },
    // 注意: ESLint の設定においてベースルールをマージせず完全にリセット（上書き）するため、
    // 実際の設定ファイルでは naming-convention の中でベースの共通設定（camelCase等）を明示的にコピーして再宣言する必要がある。
    // 1. 本番用の Adapter 実装クラス（Live サフィックス必須）
    {
      files: ["apps/*/src/adapter/**/*.ts", "packages/*/src/adapter/**/*.ts"],
      ignores: ["**/*.spec.ts", "**/*.test.ts", "**/*.mock.ts", "**/mocks/**/*"],
      rules: {
        "@typescript-eslint/naming-convention": [
          "error",
          {
            selector: "class",
            format: ["PascalCase"],
            suffix: ["Live"],
          },
        ],
      },
    },
    // 2. モック・テスト用の Adapter クラス（Test / Mock プレフィックス必須）
    {
      files: [
        "apps/*/src/adapter/**/*.mock.ts",
        "packages/*/src/adapter/**/*.mock.ts",
        "**/mocks/**/*.ts",
      ],
      rules: {
        "@typescript-eslint/naming-convention": [
          "error",
          {
            selector: "class",
            format: ["PascalCase"],
            prefix: ["Mock"],
          },
        ],
      },
    },
  ];
  ```

---

#### 3.2.5. `unicorn/filename-case`

- **カテゴリ**: Naming, Structure & Effect-TS Conventions
- **目的 / 概要**: プロジェクト内の一貫性を保つため、すべてのファイル名および
  ディレクトリ名は `kebab-case` で記述されなければならない。
- **定義元ドキュメント**: [naming-conventions.md][naming_doc] (line 6)
- **コード例**:
  - **OK**: `task-board-item.ts`, `slack-adapter.ts`
  - **NG**: `TaskBoardItem.ts`, `slack_adapter.ts`
- **実装詳細**:
  `eslint-plugin-unicorn` の `unicorn/filename-case` ルールを有効化する。

  ```typescript
  export default [
    {
      rules: {
        "unicorn/filename-case": [
          "error",
          {
            case: "kebabCase",
          },
        ],
      },
    },
  ];
  ```

---

### Category 3: Code Quality, Immutability & Value Handling

#### 3.3.1. `devstone/no-warnings`

- **カテゴリ**: Code Quality, Immutability & Value Handling
- **目的 / 概要**: 警告レベル（`warn`）のルール設定を禁止する。すべての警告は
  技術的負債となるため、ルールは常に `error`（または無効化）とし、
  コードベース内での警告の発生を許容しない。
- **定義元ドキュメント**: [code-quality.md][quality_doc] (line 11)
- **コード例**:
  - **OK**:

    ```typescript
    rules: { "semi": "error" }
    ```

  - **NG**:

    ```typescript
    rules: { "semi": "warn" }
    ```

- **実装詳細**:
  - CLIコマンドに `--max-warnings 0` オプションを付与して運用する（設定済み）。
  - カスタムASTルールとして、`eslint.config.ts` をスキャンし、`rules` オブジェクトの値として
    `"warn"` または数値の `1` が指定されている場合に警告・エラーにする。
    - ASTセレクター:
      - `"Property[key.name='rules'] Property[value.value='warn']"`
      - `"Property[key.name='rules'] Property[value.value=1]"`
      - `"Property[key.name='rules'] ArrayExpression > Literal[value='warn']"`
      - `"Property[key.name='rules'] ArrayExpression > Literal[value=1]"`

---

#### 3.3.2. `unicorn/no-null`

- **カテゴリ**: Code Quality, Immutability & Value Handling
- **目的 / 概要**: TypeScriptコードベースにおいて `null` の直接使用を禁止し、
  値の不在を表現する際は `undefined` または `Effect.Option`（`Option.none()`）
  を使用することを強制する。
- **定義元ドキュメント**: [code-quality.md][quality_doc] (line 29)
- **コード例**:
  - **OK**:

    ```typescript
    const value: string | undefined = undefined;
    ```

  - **NG**:

    ```typescript
    const value: string | null = null;
    ```

- **実装詳細**:
  `eslint-plugin-unicorn` の `unicorn/no-null` ルールを有効化する。サードパーティ製APIの
  返り値などによりどうしても `null` の扱いが必要な箇所では、インラインコメント
  (`/* eslint-disable-next-line unicorn/no-null */`) を使用して理由を記載する。

---

#### 3.3.3. `functional/prefer-readonly-type`

- **カテゴリ**: Code Quality, Immutability & Value Handling
- **目的 / 概要**: オブジェクトや配列の宣言において、不変性を保証するため `readonly`
  修飾子および `ReadonlyArray` の使用を強制する。
- **定義元ドキュメント**: [code-quality.md][quality_doc] (line 36)
- **コード例**:
  - **OK**:

    ```typescript
    const list: ReadonlyArray<string> = ["a", "b"];
    ```

  - **NG**:

    ```typescript
    const list: string[] = ["a", "b"];
    ```

- **実装詳細**:
  `eslint-plugin-functional` プラグインを導入し、`functional/prefer-readonly-type`
  ルールを有効化する。また、オブジェクトや配列に対する直接的な値の書き換えや追加
  （例：`obj.prop = x` や `array.push(x)`）を検知して不変性をより厳密に強制するために、
  同プラグインの `functional/immutable-data` ルールを統合することを推奨する。

---

#### 3.3.4. `functional/no-let`

- **カテゴリ**: Code Quality, Immutability & Value Handling
- **目的 / 概要**: 変数宣言における再代入を排除するため、`let` の使用を禁止し、
  `const` を強制する。
- **定義元ドキュメント**: [code-quality.md][quality_doc] (line 36)
- **コード例**:
  - **OK**:

    ```typescript
    const value = "Hello";
    ```

  - **NG**:

    ```typescript
    let value = "Hello";
    ```

- **実装詳細**:
  `eslint-plugin-functional` プラグインを導入し、`functional/no-let` ルールを有効化する。

---

#### 3.3.5. `functional/no-loop-statements`

- **カテゴリ**: Code Quality, Immutability & Value Handling
- **目的 / 概要**: 命令的なループ処理をコードから排除し、高階関数
  （`map`, `filter`, `reduce` 等）による宣言的なデータ処理を強制する。
- **定義元ドキュメント**: [code-quality.md][quality_doc] (line 43)
- **コード例**:
  - **OK**:

    ```typescript
    const doubled = items.map((x) => x * 2);
    ```

  - **NG**:

    ```typescript
    const doubled = [];
    for (const x of items) {
      doubled.push(x * 2);
    }
    ```

- **実装詳細**:
  `eslint-plugin-functional` の `functional/no-loop-statements` を有効にするか、
  `no-restricted-syntax` を用いて、`for`, `for...in`, `for...of`, `while`, `do...while`
  を制限する。
  - ASTセレクター:
    `"ForStatement, ForInStatement, ForOfStatement, WhileStatement, DoWhileStatement"`

---

#### 3.3.6. `no-restricted-syntax` (No `as any` type casting)

- **カテゴリ**: Code Quality, Immutability & Value Handling
- **目的 / 概要**: 静的型安全性を意図的かつ暗黙的に破壊する `as any` や `<any>` による
  型キャストを禁止する。一時的な型エラーの回避には `@ts-expect-error <reason>` を
  使用して明確に理由を記述する。
- **定義元ドキュメント**: [code-quality.md][quality_doc] (line 55)
- **コード例**:
  - **OK**:

    ```typescript
    // Schema.decodeUnknownSync を使用して安全にデコードする
    const res = Schema.decodeUnknownSync(TaskBoardItemId)(123);
    ```

  - **NG**:

    ```typescript
    const res = data as any;
    ```

- **実装詳細**:
  `no-restricted-syntax` ルールで `any` キャスト用のASTパターンを対象にする。
  - ASTセレクター:
    `"TSAsExpression[typeAnnotation.type='TSAnyKeyword'], TSTypeAssertion[typeAnnotation.type='TSAnyKeyword']"`

---

#### 3.3.7. `devstone/no-throw-in-production`

- **カテゴリ**: Code Quality, Immutability & Value Handling
- **目的 / 概要**: 全域関数（Total Functions）および Effect-TS のエラーチャネルの規律を保つため、本番コードでの `throw` 文の使用は原則禁止とする。
  ただし、テストファイル（`*.spec.ts`, `*.test.ts`）や Storybookファイル（`*.stories.tsx`、`play`関数内）においてはアサーションフレームワークが内部的に例外を使用するため、これらは除外されなければならない。
- **定義元ドキュメント**: [code-quality.md][quality_doc] (line 31)
- **コード例**:
  - **OK**:

    ```typescript
    // 本番コードでエラーチャネルを返却する
    return Effect.fail(new CanvasError({ message: "Failed" }));
    ```

  - **NG**:

    ```typescript
    // 本番コード内で例外をthrowする
    throw new Error("Something went wrong");
    ```

- **実装詳細**:
  `no-restricted-syntax` を用い、`ThrowStatement` を指定する。本番ソースコードのみをターゲットとし、テストファイルや Storybook ファイルを対象外に設定する。

  ```typescript
  // eslint.config.ts
  export default [
    {
      files: ["apps/*/src/**/*.ts", "packages/*/src/**/*.ts"],
      ignores: [
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.mock.ts",
        "**/*.stories.ts",
        "**/*.stories.tsx",
      ],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "ThrowStatement",
            message:
              "本番コード内での例外の直接的な throw は禁止されています。Effect.fail、Option.none、Either.left などの関数型エラーチャネルを使用してください。外部ライブラリのスローをラップする場合は Effect.try を使用してください。",
          },
        ],
      },
    },
  ];
  ```

---

#### 3.3.8. `devstone/single-function-per-file`

- **カテゴリ**: Code Quality, Immutability & Value Handling
- **目的 / 概要**: 1つのファイルに複数の主要な関数が定義されるのを防ぎ、単一責任の原則を徹底するため、原則として1つのファイルには1つの主要な関数（あるいは主要なエクスポート）のみを定義する。
- **定義元ドキュメント**: [code-quality.md][quality_doc] (line 42)
- **コード例**:
  - **OK**:

    ```typescript
    // apps/easel/src/core/application/add-edge.workflow.ts
    export const addEdgeWorkflow = (...) => { ... };
    ```

  - **NG**:

    ```typescript
    // apps/easel/src/utils/math-helper.ts
    // 同一ファイルから複数の主要な関数がエクスポートされている
    export const add = (a: number, b: number) => a + b;
    export const subtract = (a: number, b: number) => a - b;
    ```

- **実装詳細**:
  カスタムASTルールとして実装。エクスポートされている主要な宣言の数をカウントする。
  `ExportNamedDeclaration` および `ExportDefaultDeclaration` でエクスポートされている
  関数、クラス、あるいは変数の宣言数の合計が 1 を超える場合にエラーを報告する。
  ただし、テストファイル（`*.spec.ts`, `*.test.ts`）、
  Storybookファイル（`*.stories.tsx`）は除外する。
  また、型定義（`TSTypeAliasDeclaration`, `TSInterfaceDeclaration`）や、
  主要な機能に付随する単純な定数（例：スキーマや型定義のみのエクスポートなど）は
  カウントから除外する。
  - ASTセレクター / 実装方針:

    ```typescript
    // 各ファイルでエクスポートされる主要な宣言の数（関数、クラス、主要な変数）を
    // カウントし、1を超える場合に警告/エラーを出す。
    ```

---

### Category 4: Testing & Storybook Quality

#### 3.4.1. `devstone/no-ui-spec-files`

- **カテゴリ**: Testing & Storybook Quality
- **目的 / 概要**: UIコンポーネントに対する個別テストファイル（`*.spec.tsx` または
  `*.spec.jsx`）の作成を禁止する。UIテストおよびユーザーインタラクションの検証は、
  Storybookの `play` 関数に記述し一元管理する。
  ただし、`packages/design-system/` 配下のブラウザベースのテストや、統合テスト/E2Eテストディレクトリ（例: `**/integration/**`, `**/e2e/**`）内のテストファイルは本ルールの対象外とする。
- **定義元ドキュメント**:
  [devstone-ui-storybook-standard/SKILL.md][storybook_skill] (Section 1)
- **コード例**:
  - **OK**:
    - `button.stories.tsx` 内の `play` 関数
    - `packages/design-system/src/button.spec.tsx` （Design System配下のブラウザベーステストのため除外対象）
    - `tests/integration/button-workflow.spec.tsx` （統合テストディレクトリ内のため除外対象）
  - **NG**:
    - `apps/easel/src/button.spec.tsx` （通常アプリ配下のUIコンポーネントに対する単体テストファイル定義）
- **実装詳細**:
  カスタムASTルールを定義。ファイルパスが `*.spec.tsx` や `*.spec.jsx` に合致する場合に
  `Program` ノードでエラーを報告する。ただし、ファイルパスの正規化（`replace(/\\/g, "/")`）後に
  `packages/design-system/`、`integration/`、または `e2e/` のいずれかが含まれている場合は、
  即座に評価をスキップ（早期リターン）する。

---

#### 3.4.2. `devstone/storybook-no-title`

- **カテゴリ**: Testing & Storybook Quality
- **目的 / 概要**: Storybook ファイル内（`*.stories.{ts,tsx}`）のデフォルトエクスポートまたは
  `meta` 変数のオブジェクト定義において `title` プロパティの明示を禁止する。
  Storybook上のツリー表示は、実際の物理ディレクトリ構造に自動一致させるため。
- **定義元ドキュメント**:
  [devstone-ui-storybook-standard/SKILL.md][storybook_skill] (Section 2.1)
- **コード例**:
  - **OK**:

    ```typescript
    const meta = { component: Button } satisfies Meta<typeof Button>;
    export default meta;
    ```

  - **NG**:

    ```typescript
    const meta = {
      title: "Components/Button",
      component: Button,
    } satisfies Meta<typeof Button>;
    export default meta;
    ```

- **実装詳細**:
  `no-restricted-syntax` で `title` プロパティを検知する。`satisfies` や `as`
  構文のラッピング（`TSSatisfiesExpression` や `TSAsExpression`）による検知漏れを防ぎ、
  かつ `args` などの内部に定義された nested な `title` プロパティに対する誤検知を防ぐため、
  特定の階層（直下）に限定したセレクターを用いる。

  **警告（パフォーマンス・バイパスの注意）**: 子セレクター（`>`）を使用した指定は、
  オブジェクトが括弧等で囲まれている場合（例：`({ ... })`）にバイパスされる可能性がある。
  これを防ぐためには、子セレクターの代わりに子孫セレクターを使用するか、
  あるいはカスタムASTルールを用いてプログラム的（命令的）に対象プロパティを検証することが
  推奨される。
  - ASTセレクター:

    ```text
    VariableDeclarator[id.name='meta'] ObjectExpression Property[key.name='title'],
    VariableDeclarator[id.name='meta'] TSSatisfiesExpression ObjectExpression Property[key.name='title'],
    VariableDeclarator[id.name='meta'] TSAsExpression ObjectExpression Property[key.name='title'],
    ExportDefaultDeclaration ObjectExpression Property[key.name='title'],
    ExportDefaultDeclaration TSSatisfiesExpression ObjectExpression Property[key.name='title'],
    ExportDefaultDeclaration TSAsExpression ObjectExpression Property[key.name='title']
    ```

---

#### 3.4.3. `devstone/storybook-no-autodocs-tag`

- **カテゴリ**: Testing & Storybook Quality
- **目的 / 概要**: 各Storyの `meta` オブジェクトにおいて `tags: ["autodocs"]` を定義することを
  禁止する。ドキュメント化は、共通設定 `.storybook/preview.ts` にてグローバルに一元管理する。
- **定義元ドキュメント**:
  [devstone-ui-storybook-standard/SKILL.md][storybook_skill] (Section 2.2)
- **コード例**:
  - **OK**: `.storybook/preview.ts` 側で `tags: ["autodocs"]` を定義する。
  - **NG**: 各Storyファイルの `meta` 内で `tags: ["autodocs"]` を指定する。
- **実装詳細**:
  `no-restricted-syntax` を用いて、`*.stories.{ts,tsx}` の `meta` オブジェクト内の `tags`
  配列内に `"autodocs"` が定義されていることを禁止する。`storybook-no-title` と同様に、`satisfies` 等のラッピングがある場合にも対応する。

  **警告（パフォーマンス・バイパスの注意）**: 子セレクター（`>`）を使用した指定は、
  オブジェクトが括弧等で囲まれている場合（例：`({ ... })`）にバイパスされる可能性がある。
  これを防ぐためには、子セレクターの代わりに子孫セレクターを使用するか、
  あるいはカスタムASTルールを用いてプログラム的（命令的）に対象プロパティを検証することが
  推奨される。
  - ASTセレクター:

    ```text
    VariableDeclarator[id.name='meta'] ObjectExpression Property[key.name='tags'] ArrayExpression Literal[value='autodocs'],
    VariableDeclarator[id.name='meta'] TSSatisfiesExpression ObjectExpression Property[key.name='tags'] ArrayExpression Literal[value='autodocs'],
    VariableDeclarator[id.name='meta'] TSAsExpression ObjectExpression Property[key.name='tags'] ArrayExpression Literal[value='autodocs'],
    ExportDefaultDeclaration ObjectExpression Property[key.name='tags'] ArrayExpression Literal[value='autodocs'],
    ExportDefaultDeclaration TSSatisfiesExpression ObjectExpression Property[key.name='tags'] ArrayExpression Literal[value='autodocs'],
    ExportDefaultDeclaration TSAsExpression ObjectExpression Property[key.name='tags'] ArrayExpression Literal[value='autodocs']
    ```

---

#### 3.4.4. `devstone/storybook-require-satisfies`

- **カテゴリ**: Testing & Storybook Quality
- **目的 / 概要**: Storybook の `meta` 変数宣言や各 `Story` オブジェクト定義、
  および変数宣言を伴わない直接のデフォルトエクスポート（例:
  `export default { component: Button };` などの `ExportDefaultDeclaration`）において、
  型を極力細かく維持し補完を効かせるため、明示的な型注釈を禁止し、
  TypeScriptの `satisfies` キーワードの使用を強制する。
- **定義元ドキュメント**:
  [devstone-ui-storybook-standard/SKILL.md][storybook_skill] (Section 2.3)
- **コード例**:
  - **OK**:

    ```typescript
    const meta = { component: Button } satisfies Meta<typeof Button>;
    export const Default = { args: {} } satisfies Story;

    // 直接のデフォルトエクスポートで satisfies を使用している場合
    export default { component: Button } satisfies Meta<typeof Button>;
    ```

  - **NG**:

    ```typescript
    const meta: Meta<typeof Button> = { component: Button };
    export const Default: Story = { args: {} };

    // 直接のデフォルトエクスポートで satisfies を使用していない場合
    export default { component: Button };

    // 型アサーションによるバイパス
    export default { component: Button } as Meta;
    ```

- **実装詳細**:
  カスタムASTルールを構築。`*.stories.{ts,tsx}` に適用し、以下の条件を検証する：
  1. 変数名が `meta` の箇所や、個別にエクスポートされているStory変数の定義箇所（`VariableDeclarator`）において、
     型アノテーションの存在（`id.typeAnnotation`）を禁止し、
     かつ初期化式（`init`）が `satisfies` 構文（`TSSatisfiesExpression`）でない場合にエラーとする。
  2. `ExportDefaultDeclaration` について、型アサーション等によるバイパス
     （例：`export default { ... } as Meta;`）を防ぐため、
     宣言のタイプが `TSSatisfiesExpression` でも `Identifier`（すでに定義された
     `meta` 変数の参照）でもない場合を検出してエラーとする。
     対象セレクター：
     `ExportDefaultDeclaration[declaration.type!='TSSatisfiesExpression']`
     `[declaration.type!='Identifier']`
  - 検出用ASTセレクター例:
    - 型アノテーション禁止:
      `VariableDeclarator[id.name='meta'][id.typeAnnotation]`,
      `VariableDeclarator[id.name=/^[A-Z]/][id.typeAnnotation]`
    - `meta`変数およびStory変数の `satisfies` 強制:
      `VariableDeclarator[id.name='meta'][init.type!='TSSatisfiesExpression']`,
      `VariableDeclarator[id.name=/^[A-Z]/][init.type!='TSSatisfiesExpression']`
    - 直接のデフォルトエクスポートの `satisfies` 強制 (型アサーション等のバイパス検知を含む):
      `ExportDefaultDeclaration[declaration.type!='TSSatisfiesExpression']`
      `[declaration.type!='Identifier']`

---

#### 3.4.5. `devstone/require-in-source-tests`

- **カテゴリ**: Testing & Storybook Quality
- **目的 / 概要**: モックや `faker` を必要としない、純粋なロジックやスキーマ定義
  （`core/domain/` または `utils/` 配下で、`Layer` や `faker` のインポートを
  伴わないファイル）は、テストコードを別ファイルに分離せず、必ず
  `if (import.meta.vitest)` ブロックを使用してソースファイル内に直接記述
  （インソーステスト）しなければならない。
  **例外**: 膨大なモックや `Layer` のセットアップが必要、あるいは `faker` に
  よるテストデータの自動生成が必要で、ソースの可読性を著しく損なう場合は
  `.spec.ts` ファイルに分離する。
- **定義元ドキュメント**: [devstone-testing-standard/SKILL.md][testing_skill]
- **コード例**:
  - **OK**:
    - `src/utils/math.ts` (純粋なロジックを含み、ソース内に `if (import.meta.vitest)`
      ブロックを持つ)

      ```typescript
      export const add = (a: number, b: number) => a + b;

      if (import.meta.vitest) {
        const { it, expect } = import.meta.vitest;
        it("二つの数値の和を正しく計算すること", () => {
          expect(add(1, 2)).toBe(3);
        });
      }
      ```

    - `src/core/application/some-complex.workflow.ts` (純粋なロジックではなく、
      `Layer` のセットアップや `faker` が必要なため、テストを
      `some-complex.spec.ts` に分離している)

  - **NG**:
    - `src/utils/math.ts` (純粋なロジックであるにもかかわらず、
      `if (import.meta.vitest)` ブロックが存在しない)

      ```typescript
      export const add = (a: number, b: number) => a + b;
      ```

    - `src/utils/math.ts` と `src/utils/math.spec.ts` (純粋なロジックであるため
      インソーステストにすべき箇所を、不要に別テストファイルに分離している)

- **実装詳細**:
  カスタムASTルールとして実装する。
  対象となるファイル（`core/domain/` または `utils/` 配下のプロダクションコードで、
  テストファイル等を除外したもの）において、まず `ImportDeclaration` を走査し、
  `Layer` や `faker` のインポートが存在するかを判定する。
  それらのインポートが存在しない（＝純粋なロジック・スキーマ定義である）場合、
  ファイル内に `if (import.meta.vitest)` （またはブラケット表記の
  `import.meta['vitest']`）に対応する `IfStatement` が存在することを強制する。
  また、純粋なロジックファイルであるにもかかわらず、対応する `*.spec.ts` などの
  別テストファイルが存在する場合も警告・エラーを報告する。
  - ASTセレクター（`if (import.meta.vitest)` の検出）:
    `IfStatement[test.type='MemberExpression'][test.object.type='MetaProperty'][test.object.meta.name='import'][test.property.name='vitest']`

---

#### 3.4.6. `devstone/test-descriptions-japanese`

- **カテゴリ**: Testing & Storybook Quality
- **目的 / 概要**: テスト仕様（`it` または `test` の第1引数の文字列、`.spec-d.ts` 内の
  型テストも含む）は、ビジネス要件とのマッピングを明らかにするため、
  英語ではなく日本語で記述することを強制する。
- **定義元ドキュメント**:
  [devstone-testing-standard/SKILL.md][testing_skill] (Section 2.2)
- **コード例**:
  - **OK**:

    ```typescript
    it("正しいエッジデータを渡した場合、エッジが正常に追加され、そのIDが返されること", () => {});
    ```

  - **NG**:

    ```typescript
    it("should return the added edge ID when valid data is provided", () => {});
    ```

- **実装詳細**:
  テストファイル（`*.spec.ts`, `*.spec.tsx`, `*.spec-d.ts`）に対して適用するカスタムASTルール。
  `it` / `test` の `CallExpression` をスキャンし、第1引数（Literal または TemplateLiteral）の値に
  日本語の文字コード（ひらがな、カタカナ、漢字）が1文字も含まれていない場合にエラーを報告する。
  - 日本語文字チェック正規表現: `/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/`

---

#### 3.4.7. `devstone/no-single-describe`

- **カテゴリ**: Testing & Storybook Quality
- **目的 / 概要**: テストファイル内において、
  テストケース群が単一のコンテキストしか存在しない場合、冗長な `describe` グループ化を
  省略し、直接 `it` / `test` を平坦（フラット）に記述することを強制する。
- **定義元ドキュメント**: [devstone-testing-standard/SKILL.md][testing_skill] (Section 2.2)
- **コード例**:
  - **OK**:

    ```typescript
    it("正しい引数のとき正常に終了すること", () => {});
    ```

  - **NG**:

    ```typescript
    describe("正常系", () => {
      it("正しい引数のとき正常に終了すること", () => {});
    });
    ```

- **実装詳細**:
  カスタムASTルール。テストファイル全体における
  `describe` の呼び出し式を追跡し、`describe` が1つしかなく、その内部に他の
  `describe` やフック関数がなく、直接テストケースのみが定義されている場合に
  エラーを報告し、フラット化を促す。

---

#### 3.4.8. `devstone/schema-error-no-cast`

- **カテゴリ**: Testing & Storybook Quality
- **目的 / 概要**: `Effect.Schema` における無効データのデコードエラーを検証する際、
  `as any` 等の型キャストや `// @ts-expect-error` で型チェッカーをバイパスしつつ
  `Schema.decodeSync` を呼び出すことを禁止する。
  キャストが不要な `Schema.decodeUnknownSync` の使用を強制する。
- **定義元ドキュメント**:
  [devstone-testing-standard/SKILL.md][testing_skill] (Section 2.5)
- **コード例**:
  - **OK**:

    ```typescript
    expect(() => Schema.decodeUnknownSync(TextNode)(invalidData)).toThrow();
    ```

  - **NG**:

    ```typescript
    // as anyによるキャスト
    expect(() => Schema.decodeSync(TextNode)(invalidData as any)).toThrow();

    // @ts-expect-error による型エラー回避
    // @ts-expect-error
    expect(() => Schema.decodeSync(TaskBoardItemId)(123)).toThrow();
    ```

- **実装詳細**:
  カスタムASTルールを構築。`expect(...).toThrow()` 等の中で `Schema.decodeSync` に
  渡される引数が型キャスト (`TSAsExpression`) されている場合や、
  該当行が `ts-expect-error` コメントを保持している場合にエラーを報告し、
  `decodeUnknownSync` の利用を提示する。

---

#### 3.4.9. `devstone/effect-assert-error-flip`

- **カテゴリ**: Testing & Storybook Quality
- **目的 / 概要**: Effect-TSにおける失敗系のアサーション検証において、
  `Exit.match` や `runPromiseExit` / `runSyncExit` などの冗長なハンドリングを禁止し、
  `Effect.flip` と `Effect.runPromise` を組み合わせた簡潔なアサーション方法を強制する。
  テスト標準（`devstone-testing-standard/SKILL.md`）に基づき、
  `Exit.match` などの例外的な Exit チェック手法は一律で冗長・禁止とする。
- **定義元ドキュメント**:
  [devstone-testing-standard/SKILL.md][testing_skill] (Section 2.5)
- **コード例**:
  - **OK**:

    ```typescript
    const error = await Effect.runPromise(Effect.flip(program));
    expect(error._tag).toBe("CanvasError");
    ```

  - **NG**:

    ```typescript
    // Exit.match や runPromiseExit を使用した冗長な検証
    const exit = await Effect.runPromiseExit(program);
    if (exit._tag === "Failure") {
      expect(Cause.isDie(exit.cause)).toBe(true);
    }
    ```

- **実装詳細**:
  テストコード内（`*.spec.ts`, `*.spec.tsx`）での `runPromiseExit` / `runSyncExit` または `Exit.match` の呼び出しを一律で禁止する。
  `no-restricted-syntax` を用いて、これらの呼び出し式を検出してエラーとする。
  - ASTセレクター:
    - `CallExpression[callee.name=/^run(Promise|Sync)Exit$/]`
    - `CallExpression[callee.property.name=/^run(Promise|Sync)Exit$/]`
    - `CallExpression[callee.object.name='Exit'][callee.property.name='match']`
    - `CallExpression[callee.property.name='match'][callee.object.property.name='Exit']`

[arch_doc]: ../.agents/rules/architecture.md
[design_doc]: ../.agents/rules/design-principles.md
[naming_doc]: ../.agents/rules/naming-conventions.md
[quality_doc]: ../.agents/rules/code-quality.md
[testing_skill]: ../.agents/skills/devstone-testing-standard/SKILL.md
[storybook_skill]: ../.agents/skills/devstone-ui-storybook-standard/SKILL.md

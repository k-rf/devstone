# single-function-per-file

1つのファイルに複数の主要な関数が定義されるのを防ぎ、単一責任の原則（1ファイル1関数）を強制します。

## Rule Details

原則として、1つのファイルには1つの主要な関数（あるいは主要なエクスポート）のみを定義します。
同一ファイルから複数の関数、クラス、または定数（変数）がエクスポートされるのを防ぎ、ファイル分割を促すことでモジュールの肥大化と複雑化を防止します。

なお、以下のものは評価の対象外です：

- テストファイル（`*.spec.ts`, `*.test.ts`, `*.spec-d.ts`, `*.test-d.ts`）
- Storybook ファイル（`*.stories.ts`, `*.stories.tsx`）
- 型定義ファイル（`*.d.ts`）
- 型エクスポート（`export type`, `export interface`）
- 再エクスポート（`export * from "..."`, `export { ... } from "..."`）
- エラー定義クラス（`Data.TaggedError` や `Error` を継承）
- ブランド型等の識別子として用いる `unique symbol` 型定数（`export const FooBrand: unique symbol = ...`）

### ❌ Incorrect

```typescript
// math-helper.ts
// 同一ファイルから複数の主要な関数がエクスポートされている
export const add = (a: number, b: number): number => a + b;
export const subtract = (a: number, b: number): number => a - b;
```

```typescript
// user-service.ts
export function getUser(id: string) {}
export function deleteUser(id: string) {}
```

```typescript
// handlers.ts
export class UserHandler {}
export class OrderHandler {}
```

```typescript
// schemas.ts
// 複数の定数（Schema 等）がエクスポートされている
export const ToolCallEntry = Schema.Struct({ ... });
export const SessionStats = Schema.Struct({ ... });
```

```typescript
// file.option.ts
// 定数（CLI オプション定義）と関数（DI ヘルパー）が混在してエクスポートされている
export const fileOption = Options.file("file");
export const provideCanvasRepository = (filePath: string) => ...;
```

### ✅ Correct

```typescript
// add.ts
export const add = (a: number, b: number): number => a + b;
```

```typescript
// subtract.ts
export const subtract = (a: number, b: number): number => a - b;
```

```typescript
// add-edge.workflow.ts
// 単一の主要な関数
export const addEdgeWorkflow = (input: AddEdgeInput) => Effect.gen(...);
```

```typescript
// session-stats.ts
// コンパニオンオブジェクトパターン（1つの export const ＋ export type）は許可
export const SessionStats = Schema.Struct({ ... });
export type SessionStats = typeof SessionStats.Type;
```

```typescript
// node-id.ts
// unique symbol 型定数とスキーマ定数の組み合わせは許可
export const NodeIdBrand: unique symbol = Symbol.for("NodeIdBrand");
export const NodeId = Schema.String.pipe(Schema.brand(NodeIdBrand));
export type NodeId = typeof NodeId.Type;
```

```typescript
// task-board.port.ts
// エラークラスとポート定義の組み合わせは許可
export class TaskBoardError extends Data.TaggedError("TaskBoardError")<...> {}
export class TaskBoardPort extends Context.Tag("TaskBoardPort")<...> {}
```

## Options

このルールにオプションはありません。

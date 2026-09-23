# single-function-per-file

1つのファイルに複数の主要な関数が定義されるのを防ぎ、単一責任の原則（1ファイル1関数）を強制します。

## Rule Details

原則として、1つのファイルには1つの主要な関数（あるいは主要なエクスポート）のみを定義します。
同一ファイルから複数の関数やクラスがエクスポートされるのを防ぎ、ファイル分割を促すことでモジュールの肥大化と複雑化を防止します。

なお、以下のものは評価の対象外です：

- テストファイル（`*.spec.ts`, `*.test.ts`, `*.spec-d.ts`, `*.test-d.ts`）
- Storybook ファイル（`*.stories.ts`, `*.stories.tsx`）
- 型定義ファイル（`*.d.ts`）
- 型エクスポート（`export type`, `export interface`）
- 再エクスポート（`export * from "..."`, `export { ... } from "..."`）
- 主要機能に付随する単純な定数
- エラー定義クラス（`Data.TaggedError` や `Error` を継承）

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
// file.option.ts
// 主要な関数に付随する定数のエクスポートは許可
export const fileOption = Options.file("file");
export const provideCanvasRepository = (filePath: string) => ...;
```

```typescript
// task-board.port.ts
// エラークラスとポート定義の組み合わせは許可
export class TaskBoardError extends Data.TaggedError("TaskBoardError")<...> {}
export class TaskBoardPort extends Context.Tag("TaskBoardPort")<...> {}
```

## Options

このルールにオプションはありません。

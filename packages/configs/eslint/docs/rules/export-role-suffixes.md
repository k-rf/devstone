# export-role-suffixes

役割サフィックス付きファイルの named export が、
役割名で終わることを強制します。

## Rule Details

`.workflow.ts` や `.activity.ts` などの役割サフィックスを持つファイルにおいて、
エクスポートされる変数・関数・クラスの名前が
対応する役割サフィックス（`Workflow` / `Activity`）で終わることを強制します。

なお、テストファイル（`*.spec.ts`, `*.test.ts`）や
型エクスポート（`export type`, `export interface`）は対象外です。

### ❌ Incorrect

```typescript
// create-user.workflow.ts
export const createUser = () => {};
export function handleCreateUser() {}
export class UserCreator {}
export { createUser as executeUser };
```

```typescript
// save-user.activity.ts
export const saveUser = () => {};
```

### ✅ Correct

```typescript
// create-user.workflow.ts
export const createUserWorkflow = () => {};
export function handleCreateUserWorkflow() {}
export class CreateUserWorkflow {}
export { createUserWorkflow as executeCreateUserWorkflow };

// 型定義は対象外
export type CreateUserInput = { readonly id: string };
```

```typescript
// save-user.activity.ts
export const saveUserActivity = () => {};
```

## Options

このルールにオプションはありません。

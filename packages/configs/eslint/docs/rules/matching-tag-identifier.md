# matching-tag-identifier

`Context.Tag` または `Data.TaggedError` を継承して作成されるクラスにおいて、クラス名と同一の文字列リテラルが第1引数に渡されていることを強制します。

## Rule Details

Effect-TS のデバッグおよび実行時エラー検証の整合性を保つため、`Context.Tag` や `Data.TaggedError` のタグ識別子はクラス名と完全に一致させる必要があります。

本ルールはクラス宣言およびクラス式の双方を監視し、変数代入やオブジェクトプロパティに定義されたクラス式の名前も解決して検証します。また、型アサーション等でラップされた継承式にも対応します。
名前を解決できない匿名クラス宣言での継承は禁止します。

### ❌ Incorrect

```typescript
// クラス名とタグ識別子が一致していない
export class TaskBoardPort extends Context.Tag("NotionTaskBoard")<TaskBoardPort>() {}

export class TaskBoardError extends Data.TaggedError("DifferentError")<{}> {}

// 変数代入のクラス式で識別子が不一致
const TaskBoardPort = class extends Context.Tag("NotionTaskBoard")<TaskBoardPort>() {};

// 解決できない匿名クラス
export default class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {}

// タグ識別子が文字列リテラルでない、または引数がない
export class TaskBoardPort extends Context.Tag()<TaskBoardPort>() {}
const tag = "TaskBoardPort";
export class TaskBoardPort extends Context.Tag(tag)<TaskBoardPort>() {}
```

### ✅ Correct

```typescript
export class TaskBoardPort extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {}

export class TaskBoardError extends Data.TaggedError("TaskBoardError")<{
  readonly message: string;
}> {}

// 変数宣言への代入
export const TaskBoardPort = class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {};

// 型アサーションでラップされた場合
export class TaskBoardPort extends (Context.Tag("TaskBoardPort")<TaskBoardPort>() as any) {}
```

# port-and-adapter-suffix-boundaries

ポート＆アダプターアーキテクチャの型構造を示す特定のサフィックス（`Payload`, `Input`, `Output`, `Record`）を持つ識別子が、
それぞれ対応するディレクトリ内にのみ配置されることを強制します。

## Rule Details

以下のサフィックスを持つ型エイリアス（`type`）、インターフェース（`interface`）、クラス（`class`）、
および `Schema` への参照を持つ定数宣言（`VariableDeclarator`）は、対応するディレクトリ配下にのみ配置できます。

- `Payload` -> `/adapter/(inbound|outbound)/`
- `Input` / `Output` -> `/core/application/`
- `Record` -> `/adapter/repository/`

以下のケースは例外として検査対象外となります。

- 末尾が `Props` である型エイリアス（`TSTypeAliasDeclaration`）
- 末尾が `Input` または `Output` であるクラス宣言（`ClassDeclaration`）

### ❌ Incorrect

```typescript
// apps/example/src/core/domain/task-board-item.ts
export const NotionWebhookPayload = Schema.Struct({
  id: Schema.String,
});
export type NotionWebhookPayload = typeof NotionWebhookPayload.Type;
```

### ✅ Correct

```typescript
// apps/example/src/adapter/inbound/http/webhook.payload.ts
export const NotionWebhookPayload = Schema.Struct({
  id: Schema.String,
});
export type NotionWebhookPayload = typeof NotionWebhookPayload.Type;
```

```typescript
// apps/example/src/core/application/create-canvas.input.ts
export const CreateCanvasInput = Schema.Struct({
  id: Schema.String,
});
export type CreateCanvasInput = typeof CreateCanvasInput.Type;
```

## Options

このルールにオプションはありません。

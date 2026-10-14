import { RuleTester } from "@typescript-eslint/rule-tester";

import { portAndAdapterSuffixBoundariesRule } from "./index.js";

const ruleTester = new RuleTester();

const invalidSuffixBoundary = (
  name: string,
  suffix: "Payload" | "Input" | "Output" | "Record",
  allowedPath: string,
): {
  readonly messageId: "invalidSuffixBoundary";
  readonly data: Record<string, string>;
} => ({
  messageId: "invalidSuffixBoundary" as const,
  data: {
    name: name,
    suffix: suffix,
    allowedPath: allowedPath,
  },
});

ruleTester.run("port-and-adapter-suffix-boundaries", portAndAdapterSuffixBoundariesRule, {
  valid: [
    {
      name: "adapter/inbound 配下で Payload サフィックスの型エイリアスと Schema 定数を許可すること",
      filename: "apps/example/src/adapter/inbound/http/webhook.payload.ts",
      code: `
        export const NotionWebhookPayload = Schema.Struct({ id: Schema.String });
        export type NotionWebhookPayload = typeof NotionWebhookPayload.Type;
      `,
    },
    {
      name: "adapter/outbound 配下で Payload サフィックスの interface と class を許可すること",
      filename: "apps/example/src/adapter/outbound/notion/notion.payload.ts",
      code: `
        export interface NotionPagePayload { readonly id: string }
        export class RawNotionPayload {}
      `,
    },
    {
      name: "Windows パス形式の adapter/inbound 配下で Payload サフィックスを許可すること",
      filename: String.raw`C:\workspace\apps\example\src\adapter\inbound\http\webhook.payload.ts`,
      code: "export type NotionWebhookPayload = { readonly id: string };",
    },
    {
      name: "core/application 配下で Input および Output サフィックスの型・interface・Schema 定数を許可すること",
      filename: "apps/example/src/core/application/create-canvas.input.ts",
      code: `
        export const CreateCanvasInput = Schema.Struct({ id: Schema.String });
        export type CreateCanvasInput = typeof CreateCanvasInput.Type;
        export interface CreateCanvasOutput { readonly id: string }
        export const CreateCanvasOutputSchema = Schema.Struct({ id: Schema.String });
      `,
    },
    {
      name: "adapter/repository 配下で Record サフィックスの型・interface・class・Schema 定数を許可すること",
      filename: "apps/example/src/adapter/repository/canvas.record.ts",
      code: `
        export const CanvasRecord = Schema.Struct({ id: Schema.String });
        export type CanvasRecord = typeof CanvasRecord.Type;
        export interface CanvasMetaRecord { readonly id: string }
        export class StoredCanvasRecord {}
      `,
    },
    {
      name: "packages/design-system 配下のファイルはチェック対象外とすること",
      filename: "packages/design-system/src/components/text-input.tsx",
      code: `
        export type TextInput = { readonly value: string };
        export interface FormPayload { readonly value: string }
        export class ItemRecord {}
        export const SelectOutput = Schema.Struct({ value: Schema.String });
      `,
    },
    {
      name: "型エイリアスの末尾が Props である場合は除外すること",
      filename: "apps/example/src/core/domain/button.ts",
      code: "export type ButtonProps = { readonly label: string };",
    },
    {
      name: "ClassDeclaration で末尾が Input または Output の場合は除外すること",
      filename: "apps/example/src/core/domain/stream.ts",
      code: `
        export class StreamInput {}
        export class StreamOutput {}
      `,
    },
    {
      name: "匿名クラスの default export をエラーにしないこと",
      filename: "apps/example/src/core/domain/anonymous.ts",
      code: "export default class {}",
    },
    {
      name: "分割代入の変数宣言は検査対象外とすること",
      filename: "apps/example/src/core/domain/user.ts",
      code: "export const { userPayload } = { userPayload: 1 };",
    },
    {
      name: "Schema への参照を持たない通常の変数宣言は検査対象外とすること",
      filename: "apps/example/src/core/domain/user.ts",
      code: `
        export const validPayload = { id: "1" };
        export const nodesOutput = "nodes";
        declare const uninitializedPayload: string;
      `,
    },
    {
      name: "別の VariableDeclarator の Schema 参照を誤検知しないこと",
      filename: "apps/example/src/core/domain/user.ts",
      code: "export const userPayload = { id: '1' }, userSchema = Schema.Struct({ id: Schema.String });",
    },
    {
      name: "対象サフィックスを持たない識別子はどのディレクトリでも許可すること",
      filename: "apps/example/src/core/domain/task-board-item.ts",
      code: `
        export const TaskBoardItem = Schema.Struct({ id: Schema.String });
        export type TaskBoardItem = typeof TaskBoardItem.Type;
        export interface TaskBoardPort { readonly id: string }
        export class TaskBoardError {}
      `,
    },
  ],
  invalid: [
    {
      name: "core/domain 配下で Payload サフィックスの型エイリアスを報告すること",
      filename: "apps/example/src/core/domain/task-board-item.ts",
      code: "export type NotionWebhookPayload = { readonly id: string };",
      errors: [
        invalidSuffixBoundary("NotionWebhookPayload", "Payload", "/adapter/(inbound|outbound)/"),
      ],
    },
    {
      name: "core/application 配下で Payload サフィックスの interface を報告すること",
      filename: "apps/example/src/core/application/start-timer.workflow.ts",
      code: "export interface NotionWebhookPayload { readonly id: string }",
      errors: [
        invalidSuffixBoundary("NotionWebhookPayload", "Payload", "/adapter/(inbound|outbound)/"),
      ],
    },
    {
      name: "core/domain 配下で Payload サフィックスの class を報告すること",
      filename: "apps/example/src/core/domain/task-board-item.ts",
      code: "export class NotionWebhookPayload {}",
      errors: [
        invalidSuffixBoundary("NotionWebhookPayload", "Payload", "/adapter/(inbound|outbound)/"),
      ],
    },
    {
      name: "core/domain 配下で Payload サフィックスの Schema 定数を報告すること",
      filename: "apps/example/src/core/domain/task-board-item.ts",
      code: "export const NotionWebhookPayload = Schema.Struct({ id: Schema.String });",
      errors: [
        invalidSuffixBoundary("NotionWebhookPayload", "Payload", "/adapter/(inbound|outbound)/"),
      ],
    },
    {
      name: "adapter/inbound 配下で Input サフィックスの型エイリアスと Schema 定数を報告すること",
      filename: "apps/example/src/adapter/inbound/http/webhook.route.ts",
      code: `
        export const CreateCanvasInput = Schema.Struct({ id: Schema.String });
        export type CreateCanvasInput = typeof CreateCanvasInput.Type;
      `,
      errors: [
        invalidSuffixBoundary("CreateCanvasInput", "Input", "/core/application/"),
        invalidSuffixBoundary("CreateCanvasInput", "Input", "/core/application/"),
      ],
    },
    {
      name: "core/domain 配下で Output サフィックスの interface と Schema 定数を報告すること",
      filename: "apps/example/src/core/domain/canvas.ts",
      code: `
        export interface CreateCanvasOutput { readonly id: string }
        export const CreateCanvasOutput = Schema.Struct({ id: Schema.String });
      `,
      errors: [
        invalidSuffixBoundary("CreateCanvasOutput", "Output", "/core/application/"),
        invalidSuffixBoundary("CreateCanvasOutput", "Output", "/core/application/"),
      ],
    },
    {
      name: "core/port/repository 配下で Record サフィックスの型・interface・class・Schema 定数を報告すること",
      filename: "apps/example/src/core/port/repository/canvas.repository.ts",
      code: `
        export type CanvasRecord = { readonly id: string };
        export interface CanvasMetaRecord { readonly id: string }
        export class StoredCanvasRecord {}
        export const CanvasSchemaRecord = Schema.Struct({ id: Schema.String });
      `,
      errors: [
        invalidSuffixBoundary("CanvasRecord", "Record", "/adapter/repository/"),
        invalidSuffixBoundary("CanvasMetaRecord", "Record", "/adapter/repository/"),
        invalidSuffixBoundary("StoredCanvasRecord", "Record", "/adapter/repository/"),
        invalidSuffixBoundary("CanvasSchemaRecord", "Record", "/adapter/repository/"),
      ],
    },
    {
      name: "packages/design-system に似た別パッケージは除外しないこと",
      filename: "packages/design-system-tools/src/item.ts",
      code: "export interface ItemRecord { readonly id: string }",
      errors: [invalidSuffixBoundary("ItemRecord", "Record", "/adapter/repository/")],
    },
    {
      name: "Windows パス形式で境界外のサフィックスを報告すること",
      filename: String.raw`C:\workspace\apps\example\src\core\domain\task-board-item.ts`,
      code: "export type NotionWebhookPayload = { readonly id: string };",
      errors: [
        invalidSuffixBoundary("NotionWebhookPayload", "Payload", "/adapter/(inbound|outbound)/"),
      ],
    },
  ],
});

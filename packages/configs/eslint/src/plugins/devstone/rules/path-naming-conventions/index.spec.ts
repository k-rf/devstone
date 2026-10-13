import { RuleTester } from "@typescript-eslint/rule-tester";

import { pathNamingConventionsRule } from "./index.js";

const ruleTester = new RuleTester();
const code = "export const value = 1;";

const validFilenames = [
  "apps/example/src/core/port/outbound/example.port.ts",
  "apps/example/src/core/port/repository/example.repository.ts",
  "apps/example/src/core/application/example.workflow.ts",
  "apps/example/src/core/application/example.activity.ts",
  "apps/example/src/core/application/example.input.ts",
  "apps/example/src/core/application/example.output.ts",
  "apps/example/src/adapter/outbound/example.adapter.ts",
  "apps/example/src/adapter/outbound/example.payload.ts",
  "apps/example/src/adapter/outbound/example.mapper.ts",
  "apps/example/src/adapter/repository/example.repository.ts",
  "apps/example/src/adapter/repository/example.record.ts",
  "apps/example/src/adapter/inbound/example.handler.ts",
  "apps/example/src/adapter/inbound/example.payload.ts",
  "apps/example/src/adapter/inbound/example.route.ts",
  "apps/example/src/adapter/inbound/example.middleware.ts",
  "apps/example/src/adapter/inbound/example.command.ts",
  "apps/example/src/adapter/inbound/example.option.ts",
] as const;

const excludedFilenames = [
  "apps/example/src/core/application/example.spec.ts",
  "apps/example/src/core/application/example.test.ts",
  "apps/example/src/core/application/index.ts",
  "apps/example/src/core/application/preview.tsx",
  "apps/example/src/core/application/types.ts",
  "apps/example/src/adapter/inbound/cli/options.ts",
  "apps/example/src/adapter/inbound/cli/commands.ts",
] as const;

ruleTester.run("path-naming-conventions", pathNamingConventionsRule, {
  valid: [
    ...validFilenames.map((filename) => ({
      name: `${filename} を許可すること`,
      code: code,
      filename: filename,
    })),
    ...excludedFilenames.map((filename) => ({
      name: `${filename} を検査しないこと`,
      code: code,
      filename: filename,
    })),
  ],
  invalid: [
    {
      name: "core/port で役割サフィックスがないファイルを報告すること",
      code: code,
      filename: "apps/example/src/core/port/example.ts",
      errors: [{ messageId: "invalidRoleSuffix" as const, data: { suffixes: ".port.ts" } }],
    },
    {
      name: "core/application で無効な役割サフィックスを報告すること",
      code: code,
      filename: "apps/example/src/core/application/example.service.ts",
      errors: [
        {
          messageId: "invalidRoleSuffix" as const,
          data: { suffixes: ".workflow.ts, .activity.ts, .input.ts, .output.ts" },
        },
      ],
    },
    {
      name: "adapter/outbound で無効な役割サフィックスを報告すること",
      code: code,
      filename: "apps/example/src/adapter/outbound/example.client.ts",
      errors: [
        {
          messageId: "invalidRoleSuffix" as const,
          data: { suffixes: ".adapter.ts, .payload.ts, .mapper.ts" },
        },
      ],
    },
    {
      name: "adapter/repository で無効な役割サフィックスを報告すること",
      code: code,
      filename: "apps/example/src/adapter/repository/example.adapter.ts",
      errors: [
        {
          messageId: "invalidRoleSuffix" as const,
          data: { suffixes: ".repository.ts, .record.ts" },
        },
      ],
    },
    ...[
      "apps/example/src/adapter/inbound/example.controller.ts",
      "apps/example/src/adapter/inbound/example.options.ts",
    ].map((filename) => ({
      name: `${filename} を報告すること`,
      code: code,
      filename: filename,
      errors: [
        {
          messageId: "invalidRoleSuffix" as const,
          data: {
            suffixes:
              ".handler.ts, .payload.ts, .route.ts, .middleware.ts, .command.ts, .option.ts",
          },
        },
      ],
    })),
    {
      name: "Windows 形式の core/port/repository パスを報告すること",
      code: code,
      filename: String.raw`apps\example\src\core\port\repository\example.ts`,
      errors: [{ messageId: "invalidRoleSuffix" as const, data: { suffixes: ".repository.ts" } }],
    },
    {
      name: "core/port/repository では port サフィックスを報告すること",
      code: code,
      filename: "apps/example/src/core/port/repository/example.port.ts",
      errors: [{ messageId: "invalidRoleSuffix" as const, data: { suffixes: ".repository.ts" } }],
    },
  ],
});

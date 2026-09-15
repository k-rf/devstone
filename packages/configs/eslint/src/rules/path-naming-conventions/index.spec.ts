import { Linter } from "eslint";
import { parser } from "typescript-eslint";
import { describe, expect, it } from "vitest";

import { plugin } from "../../plugin.js";

const ruleId = "devstone/path-naming-conventions";
const linter = new Linter();

const config = {
  files: ["**/*.{ts,tsx}"],
  plugins: {
    devstone: plugin,
  },
  languageOptions: {
    parser: parser,
    sourceType: "module",
  },
  rules: {
    "devstone/path-naming-conventions": "error",
  },
} satisfies Linter.Config;

const lint = (filename: string): readonly Linter.LintMessage[] => {
  return linter.verify("export const value = 1;", config, { filename: filename });
};

describe("許可する", () => {
  it.each([
    "apps/example/src/core/port/outbound/example.port.ts",
    "apps/example/src/core/port/repository/example.port.tsx",
    "apps/example/src/core/application/example.workflow.ts",
    "apps/example/src/core/application/example.activity.ts",
    "apps/example/src/core/application/example.input.ts",
    "apps/example/src/core/application/example.output.ts",
    "apps/example/src/adapter/outbound/example.adapter.ts",
    "apps/example/src/adapter/outbound/example.payload.ts",
    "apps/example/src/adapter/repository/example.repository.ts",
    "apps/example/src/adapter/repository/example.record.ts",
    "apps/example/src/adapter/inbound/example.handler.ts",
    "apps/example/src/adapter/inbound/example.payload.ts",
    "apps/example/src/adapter/inbound/example.route.ts",
  ])("%s を許可すること", (filename) => {
    expect(lint(filename)).toEqual([]);
  });
});

describe("除外する", () => {
  it.each([
    "apps/example/src/core/application/example.spec.ts",
    "apps/example/src/core/application/example.test.ts",
    "apps/example/src/core/application/index.ts",
    "apps/example/src/core/application/preview.tsx",
    "apps/example/src/core/application/types.ts",
  ])("%s を検査しないこと", (filename) => {
    expect(lint(filename)).toEqual([]);
  });
});

describe("報告する", () => {
  it.each([
    {
      filename: "apps/example/src/core/port/example.ts",
      suffixes: ".port.ts",
    },
    {
      filename: "apps/example/src/core/application/example.service.ts",
      suffixes: ".workflow.ts, .activity.ts, .input.ts, .output.ts",
    },
    {
      filename: "apps/example/src/adapter/outbound/example.client.ts",
      suffixes: ".adapter.ts, .payload.ts",
    },
    {
      filename: "apps/example/src/adapter/repository/example.adapter.ts",
      suffixes: ".repository.ts, .record.ts",
    },
    {
      filename: "apps/example/src/adapter/inbound/example.middleware.ts",
      suffixes: ".handler.ts, .payload.ts, .route.ts",
    },
    {
      filename: String.raw`apps\example\src\core\port\repository\example.ts`,
      suffixes: ".port.ts",
    },
  ])("%s を報告すること", ({ filename, suffixes }) => {
    expect(lint(filename)).toMatchObject([
      {
        ruleId: ruleId,
        messageId: "invalidRoleSuffix",
        message: `このパスのファイル名は次のいずれかのサフィックスで終わる必要があります: ${suffixes}。`,
      },
    ]);
  });
});

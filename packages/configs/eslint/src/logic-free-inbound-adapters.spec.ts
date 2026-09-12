import { Linter } from "eslint";
import { parser } from "typescript-eslint";
import { describe, expect, it } from "vitest";

import { logicFreeInboundAdapters } from "./logic-free-inbound-adapters.js";

const linter = new Linter();

const lint = (code: string, filename: string): readonly Linter.LintMessage[] => {
  return linter.verify(
    code,
    [
      {
        files: ["**/*.ts"],
        languageOptions: {
          parser: parser,
          sourceType: "module",
        },
      },
      ...logicFreeInboundAdapters,
    ],
    { filename: filename },
  );
};

describe("検査しない", () => {
  it.each([
    {
      name: "Effect パイプラインによる宣言的な制御フローを許可すること",
      filename: "apps/easel/src/adapter/inbound/cli/command.ts",
      code: "const command = input.pipe(Effect.flatMap(runWorkflow));",
    },
    {
      name: "Inbound Adapter 以外の if 文を許可すること",
      filename: "apps/easel/src/core/application/workflow.ts",
      code: "if (input.isValid) { runWorkflow(); }",
    },
    {
      name: "テストファイル内の if 文を許可すること",
      filename: "apps/easel/src/adapter/inbound/cli/command.spec.ts",
      code: "if (result.isOk) { expect(result.value).toBeDefined(); }",
    },
    {
      name: "middleware 内の switch 文を許可すること",
      filename: "apps/easel/src/adapter/inbound/http/validate.middleware.ts",
      code: "switch (request.method) { case 'POST': break; }",
    },
  ])("$name", ({ filename, code }) => {
    expect(lint(code, filename)).toEqual([]);
  });
});

describe("報告する", () => {
  it.each([
    {
      name: "Inbound Adapter 内の if 文を報告すること",
      code: "if (input.isValid) { runWorkflow(); }",
      messageId: "restrictedSyntax",
      message:
        "Inbound Adapter で if 文を使わないでください。検証は middleware、制御フローは Effect パイプラインまたは Workflow に委譲してください。",
    },
    {
      name: "Inbound Adapter 内の switch 文を報告すること",
      code: "switch (input.kind) { case 'create': runWorkflow(); break; }",
      messageId: "restrictedSyntax",
      message:
        "Inbound Adapter で switch 文を使わないでください。検証は middleware、制御フローは Effect パイプラインまたは Workflow に委譲してください。",
    },
  ])("$name", ({ code, message, messageId }) => {
    expect(lint(code, "apps/easel/src/adapter/inbound/cli/command.ts")).toMatchObject([
      {
        ruleId: "no-restricted-syntax",
        message: message,
        messageId: messageId,
      },
    ]);
  });
});

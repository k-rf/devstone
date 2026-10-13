import { RuleTester } from "@typescript-eslint/rule-tester";

import { outboundPartitioningRule } from "./index.js";

const ruleTester = new RuleTester();
const code = "export const value = 1;";

const excludedFilenames = [
  "src/core/port/inbound/http/request.port.ts",
  "src/adapter/inbound/http/request.adapter.ts",
  "src/core/port/repository/db/cache.port.ts",
  "src/domain/outbound/notion/notion.ts",
] as const;

const validFilenames = [
  "src/core/port/outbound/notion/task-board.port.ts",
  "src/adapter/outbound/toggl/toggl-http.adapter.ts",
  String.raw`C:\workspace\src\core\port\outbound\slack\notification.port.ts`,
  String.raw`C:\workspace\src\adapter\outbound\cloudflare\kv.adapter.ts`,
] as const;

const filesWithoutServiceDirectory = [
  "src/core/port/outbound/task-board.port.ts",
  "src/adapter/outbound/notion.adapter.ts",
  String.raw`C:\workspace\src\core\port\outbound\task-board.port.ts`,
  String.raw`C:\workspace\src\adapter\outbound\notion.adapter.ts`,
] as const;

const prohibitedDirectoryNames = [
  "http",
  "kv",
  "db",
  "database",
  "fetch",
  "rest",
  "graphql",
  "api",
  "r2",
  "d1",
  "HTTP",
] as const;

ruleTester.run("outbound-partitioning", outboundPartitioningRule, {
  valid: [
    ...excludedFilenames.map((filename) => ({
      name: `Outbound Port または Adapter 以外のパスは検査しないこと: ${filename}`,
      code: code,
      filename: filename,
    })),
    ...validFilenames.map((filename) => ({
      name: `外部サービス名で分割されたパスを許可すること: ${filename}`,
      code: code,
      filename: filename,
    })),
  ],
  invalid: [
    ...filesWithoutServiceDirectory.map((filename) => ({
      name: `outbound 直下のファイルを報告すること: ${filename}`,
      code: code,
      filename: filename,
      errors: [{ messageId: "missingServiceDirectory" as const }],
    })),
    ...prohibitedDirectoryNames.map((directoryName) => ({
      name: `技術名のディレクトリを報告すること: ${directoryName}`,
      code: code,
      filename: `src/adapter/outbound/${directoryName}/service.adapter.ts`,
      errors: [
        {
          messageId: "prohibitedTechnologyDirectory" as const,
          data: { directoryName: directoryName },
        },
      ],
    })),
  ],
});

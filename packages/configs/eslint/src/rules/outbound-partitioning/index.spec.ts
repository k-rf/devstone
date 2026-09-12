import { Linter } from "eslint";
import { parser } from "typescript-eslint";
import { describe, expect, it } from "vitest";

import { plugin } from "../../plugin.js";

const ruleId = "devstone/outbound-partitioning";
const linter = new Linter();

const config = {
  files: ["**/*.ts"],
  plugins: {
    devstone: plugin,
  },
  languageOptions: {
    parser: parser,
    sourceType: "module",
  },
  rules: {
    [ruleId]: "error",
  },
} satisfies Linter.Config;

const lint = (filename: string): readonly Linter.LintMessage[] => {
  return linter.verify("export const value = 1;", config, { filename: filename });
};

const missingServiceDirectory = {
  ruleId: ruleId,
  messageId: "missingServiceDirectory",
  message:
    "outbound 直下へのファイル配置はできません。外部サービス名のディレクトリに配置してください。",
};

const prohibitedTechnologyDirectory = (directoryName: string) => ({
  ruleId: ruleId,
  messageId: "prohibitedTechnologyDirectory",
  message: `'${directoryName}' は技術名のため outbound の直下ディレクトリには使用できません。外部サービス名を使用してください。`,
});

describe("検査しない", () => {
  it.each([
    "src/core/port/inbound/http/request.port.ts",
    "src/adapter/inbound/http/request.adapter.ts",
    "src/core/port/repository/db/cache.port.ts",
    "src/domain/outbound/notion/notion.ts",
  ])("Outbound Port または Adapter 以外のパスは検査しないこと: %s", (filename) => {
    expect(lint(filename)).toEqual([]);
  });
});

describe("許可する", () => {
  it.each([
    "src/core/port/outbound/notion/task-board.port.ts",
    "src/adapter/outbound/toggl/toggl-http.adapter.ts",
    String.raw`C:\workspace\src\core\port\outbound\slack\notification.port.ts`,
    String.raw`C:\workspace\src\adapter\outbound\cloudflare\kv.adapter.ts`,
  ])("外部サービス名で分割されたパスを許可すること: %s", (filename) => {
    expect(lint(filename)).toEqual([]);
  });
});

describe("報告する", () => {
  it.each([
    "src/core/port/outbound/task-board.port.ts",
    "src/adapter/outbound/notion.adapter.ts",
    String.raw`C:\workspace\src\core\port\outbound\task-board.port.ts`,
    String.raw`C:\workspace\src\adapter\outbound\notion.adapter.ts`,
  ])("outbound 直下のファイルを報告すること: %s", (filename) => {
    expect(lint(filename)).toMatchObject([missingServiceDirectory]);
  });

  it.each(["http", "kv", "db", "database", "fetch", "rest", "graphql", "api", "r2", "d1", "HTTP"])(
    "技術名のディレクトリを報告すること: %s",
    (directoryName) => {
      const filename = `src/adapter/outbound/${directoryName}/service.adapter.ts`;

      expect(lint(filename)).toMatchObject([prohibitedTechnologyDirectory(directoryName)]);
    },
  );
});

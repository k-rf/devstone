import { expect, it } from "vitest";

import { getRoleSuffixFromFilename } from "./get-role-suffix-from-filename.js";

it.each([
  {
    name: ".workflow.ts は Workflow を返すこと",
    filename: "create-item.workflow.ts",
    expected: "Workflow",
  },
  {
    name: ".activity.ts は Activity を返すこと",
    filename: "create-item.activity.ts",
    expected: "Activity",
  },
  {
    name: ".workflow.tsx は Workflow を返すこと",
    filename: "create-item.workflow.tsx",
    expected: "Workflow",
  },
  {
    name: ".activity.mts は Activity を返すこと",
    filename: "create-item.activity.mts",
    expected: "Activity",
  },
  {
    name: "Windows のパス区切りでも Workflow を返すこと",
    filename: String.raw`src\core\create-item.workflow.ts`,
    expected: "Workflow",
  },
  {
    name: "ネストした Unix パスでも Activity を返すこと",
    filename: "src/core/application/create-item.activity.ts",
    expected: "Activity",
  },
  {
    name: "役割サフィックスのないファイルは undefined を返すこと",
    filename: "create-item.ts",
    expected: undefined,
  },
  {
    name: ".workflow.spec.ts は対象外として undefined を返すこと",
    filename: "create-item.workflow.spec.ts",
    expected: undefined,
  },
  {
    name: ".activity.test.ts は対象外として undefined を返すこと",
    filename: "create-item.activity.test.ts",
    expected: undefined,
  },
  {
    name: ".workflow.d.ts は対象外として undefined を返すこと",
    filename: "create-item.workflow.d.ts",
    expected: undefined,
  },
  {
    name: "ファイル名の一部が Workflow でも拡張子が一致しなければ undefined を返すこと",
    filename: "Workflow.ts",
    expected: undefined,
  },
])("$name", ({ filename, expected }) => {
  expect(getRoleSuffixFromFilename(filename)).toBe(expected);
});

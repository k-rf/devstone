import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { describe, expect, it } from "vitest";

import { hasIdentifier } from "./has-identifier.js";

describe("対象の名前の Identifier が含まれる場合、true を返すこと", () => {
  it("ノード自身が対象名の Identifier であるとき true を返すこと", () => {
    const node = {
      type: AST_NODE_TYPES.Identifier,
      name: "Schema",
    };

    expect(hasIdentifier(node, "Schema")).toBe(true);
  });

  it("ネストしたオブジェクトや配列の配下に対象名の Identifier があるとき true を返すこと", () => {
    const node = {
      type: AST_NODE_TYPES.CallExpression,
      callee: {
        type: AST_NODE_TYPES.MemberExpression,
        object: {
          type: AST_NODE_TYPES.Identifier,
          name: "Effect",
        },
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: "gen",
        },
      },
      arguments: [
        {
          type: AST_NODE_TYPES.Identifier,
          name: "Schema",
        },
      ],
    };

    expect(hasIdentifier(node, "Schema")).toBe(true);
  });
});

describe("対象の名前の Identifier が含まれない場合、false を返すこと", () => {
  it.each([
    { value: undefined, description: "undefined" },
    { value: "Schema", description: "文字列プリミティブ" },
    { value: 123, description: "数値プリミティブ" },
  ])("$description が渡されたとき false を返すこと", ({ value }) => {
    expect(hasIdentifier(value, "Schema")).toBe(false);
  });

  it("異なる名前の Identifier のみのとき false を返すこと", () => {
    const node = {
      type: AST_NODE_TYPES.Identifier,
      name: "Other",
    };

    expect(hasIdentifier(node, "Schema")).toBe(false);
  });

  it("parent、loc、range プロパティ配下にある Identifier は探索をスキップして false を返すこと", () => {
    const node = {
      type: AST_NODE_TYPES.CallExpression,
      parent: {
        type: AST_NODE_TYPES.Identifier,
        name: "Schema",
      },
      loc: {
        type: AST_NODE_TYPES.Identifier,
        name: "Schema",
      },
      range: [
        {
          type: AST_NODE_TYPES.Identifier,
          name: "Schema",
        },
      ],
    };

    expect(hasIdentifier(node, "Schema")).toBe(false);
  });
});

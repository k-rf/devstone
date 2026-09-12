import { ESLintUtils } from "@typescript-eslint/utils";

import { type MessageIds, type Options } from "./types.js";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/k-rf/devstone/blob/main/packages/configs/eslint/docs/rules/${name}.md`,
);

const roleSuffixesByDirectory = [
  {
    directory: "/core/port/",
    suffixes: ["port"],
  },
  {
    directory: "/core/application/",
    suffixes: ["workflow", "activity", "input", "output"],
  },
  {
    directory: "/adapter/outbound/",
    suffixes: ["adapter", "payload"],
  },
  {
    directory: "/adapter/repository/",
    suffixes: ["repository", "record"],
  },
  {
    directory: "/adapter/inbound/",
    suffixes: ["handler", "payload", "route"],
  },
] as const;

const excludedFilenamePattern = /(?:\.(?:spec|test)|\/(?:index|preview|types))\.[cm]?[jt]sx?$/u;

const getExpectedSuffixes = (filename: string): readonly string[] | undefined => {
  const normalizedFilename = filename.replaceAll("\\", "/");

  if (excludedFilenamePattern.test(normalizedFilename)) return undefined;

  return roleSuffixesByDirectory.find(({ directory }) => normalizedFilename.includes(directory))
    ?.suffixes;
};

const hasExpectedSuffix = (filename: string, suffixes: readonly string[]): boolean => {
  const normalizedFilename = filename.replaceAll("\\", "/");
  const pattern = new RegExp(String.raw`\.(?:${suffixes.join("|")})\.[cm]?[jt]sx?$`, "u");

  return pattern.test(normalizedFilename);
};

/**
 * 配置ディレクトリに対応するファイル役割サフィックスを要求する。
 */
export const pathNamingConventionsRule = createRule<Options, MessageIds>({
  name: "path-naming-conventions",
  meta: {
    type: "problem",
    docs: {
      description: "Require role suffixes that correspond to the file's architectural path.",
    },
    schema: [],
    messages: {
      invalidRoleSuffix:
        "このパスのファイル名は次のいずれかのサフィックスで終わる必要があります: {{suffixes}}。",
    },
  },
  create: (context) => {
    const expectedSuffixes = getExpectedSuffixes(context.filename);

    if (expectedSuffixes === undefined || hasExpectedSuffix(context.filename, expectedSuffixes)) {
      return {};
    }

    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- ESLint AST ノード名に従う
      Program: (node) => {
        context.report({
          node: node,
          messageId: "invalidRoleSuffix",
          data: { suffixes: expectedSuffixes.map((suffix) => `.${suffix}.ts`).join(", ") },
        });
      },
    };
  },
});

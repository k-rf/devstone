import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/k-rf/devstone/blob/main/packages/configs/eslint/docs/rules/${name}.md`,
);

const prohibitedDirectoryNames = new Set([
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
]);

const outboundPathPattern = /(?:^|\/)(?:core\/port|adapter)\/outbound\/(.+)$/u;

const getOutboundDirectory = (filename: string): string | undefined => {
  const normalizedFilename = filename.replaceAll("\\", "/");
  const matchedPath = outboundPathPattern.exec(normalizedFilename);

  return matchedPath?.[1]?.split("/")[0];
};

/**
 * Outbound Port と Adapter を、技術ではなく外部サービス単位のディレクトリに分割することを強制する。
 */
export const outboundPartitioningRule = createRule({
  name: "outbound-partitioning",
  meta: {
    type: "problem",
    docs: {
      description:
        "Require outbound ports and adapters to be partitioned by external service rather than technology.",
    },
    schema: [],
    messages: {
      missingServiceDirectory:
        "outbound 直下へのファイル配置はできません。外部サービス名のディレクトリに配置してください。",
      prohibitedTechnologyDirectory:
        "'{{directoryName}}' は技術名のため outbound の直下ディレクトリには使用できません。外部サービス名を使用してください。",
    },
  },
  create: (context) => {
    const outboundDirectory = getOutboundDirectory(context.filename);

    if (outboundDirectory === undefined) return {};

    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- ESLint のノード種別に従う
      Program: (node) => {
        if (outboundDirectory.includes(".")) {
          context.report({
            node: node,
            messageId: "missingServiceDirectory",
          });
          return;
        }

        if (prohibitedDirectoryNames.has(outboundDirectory.toLowerCase())) {
          context.report({
            node: node,
            messageId: "prohibitedTechnologyDirectory",
            data: { directoryName: outboundDirectory },
          });
        }
      },
    };
  },
});

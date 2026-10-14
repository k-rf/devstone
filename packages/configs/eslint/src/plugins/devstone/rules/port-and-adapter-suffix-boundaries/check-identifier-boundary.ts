import { type TSESTree } from "@typescript-eslint/utils";
import { type RuleContext } from "@typescript-eslint/utils/ts-eslint";

import { type MessageIds, type Options, type SuffixBoundary } from "./types.js";

const suffixBoundaries: readonly SuffixBoundary[] = [
  {
    suffix: "Payload",
    allowedPath: "/adapter/(inbound|outbound)/",
    allowedPathPattern: /(?:^|\/)adapter\/(?:inbound|outbound)\//u,
  },
  {
    suffix: "Input",
    allowedPath: "/core/application/",
    allowedPathPattern: /(?:^|\/)core\/application\//u,
  },
  {
    suffix: "Output",
    allowedPath: "/core/application/",
    allowedPathPattern: /(?:^|\/)core\/application\//u,
  },
  {
    suffix: "Record",
    allowedPath: "/adapter/repository/",
    allowedPathPattern: /(?:^|\/)adapter\/repository\//u,
  },
];

/**
 * 識別子名が特定のサフィックスで終わる場合、ファイルパスが対応するアーキテクチャ境界内にあるかを検証する。
 */
export const checkIdentifierBoundary = (
  context: Readonly<RuleContext<MessageIds, Options>>,
  identifier: TSESTree.Identifier,
  normalizedFilename: string,
): void => {
  const matchedBoundary = suffixBoundaries.find(({ suffix }) => identifier.name.endsWith(suffix));

  if (matchedBoundary === undefined) return;

  if (matchedBoundary.allowedPathPattern.test(normalizedFilename)) return;

  context.report({
    node: identifier,
    messageId: "invalidSuffixBoundary",
    data: {
      name: identifier.name,
      suffix: matchedBoundary.suffix,
      allowedPath: matchedBoundary.allowedPath,
    },
  });
};

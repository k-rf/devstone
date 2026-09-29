import { type TSESTree } from "@typescript-eslint/utils";
import { type RuleContext } from "@typescript-eslint/utils/ts-eslint";

import { extractTagIdentifier } from "./extract-tag-identifier.js";
import { findTaggedCallInfo } from "./find-tagged-call-info.js";
import { resolveClassName } from "./resolve-class-name.js";
import { type MessageIds, type Options } from "./types.js";

/**
 * クラスノードのタグ識別子とクラス名の一致を検証する。
 */
export const checkClassNode = (
  context: Readonly<RuleContext<MessageIds, Options>>,
  node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
): void => {
  const taggedCallInfo = findTaggedCallInfo(node.superClass);
  if (!taggedCallInfo) return;

  const { kind, callExpression } = taggedCallInfo;
  const className = resolveClassName(node);

  if (className === undefined) {
    context.report({
      node: node,
      messageId: "anonymousClass",
      data: {
        calleeName: kind,
      },
    });
    return;
  }

  const tagIdentifier = extractTagIdentifier(callExpression);

  if (tagIdentifier?.value === undefined) {
    context.report({
      node: tagIdentifier ? tagIdentifier.argumentNode : callExpression,
      messageId: "invalidIdentifier",
      data: {
        calleeName: kind,
        className: className,
      },
    });
    return;
  }

  if (tagIdentifier.value !== className) {
    context.report({
      node: tagIdentifier.argumentNode,
      messageId: "mismatchedIdentifier",
      data: {
        calleeName: kind,
        className: className,
        tagIdentifier: tagIdentifier.value,
      },
    });
  }
};

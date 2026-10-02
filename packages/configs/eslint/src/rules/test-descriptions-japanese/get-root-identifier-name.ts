import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { match } from "ts-pattern";

import { noop } from "../libs/noop.js";

const { CallExpression, Identifier, MemberExpression, TaggedTemplateExpression } = AST_NODE_TYPES;

/**
 * 呼び出しチェーンまたは式の根本となる識別子名を取得する。
 */
export const getRootIdentifierName = (node: TSESTree.Node): string | undefined =>
  match(node)
    .with({ type: Identifier }, ({ name }) => name)
    .with({ type: MemberExpression }, ({ object }) => getRootIdentifierName(object))
    .with({ type: CallExpression }, ({ callee }) => getRootIdentifierName(callee))
    .with({ type: TaggedTemplateExpression }, ({ tag }) => getRootIdentifierName(tag))
    .otherwise(noop);

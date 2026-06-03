import { type Node } from "@devstone/libs-json-canvas-spec";
import { Effect } from "effect";

import { CanvasError } from "../domain/errors.js";

/**
 * 既存のノードと指定されたタイプが一致するか検証する Activity
 * @param node - 検証対象のノードオブジェクト
 * @param expectedType - 期待されるノードのタイプ
 * @returns 検証されたノードオブジェクトを示す Effect
 */
export const validateNodeTypeActivity = (
  node: Node,
  expectedType: "text" | "file" | "link" | "group",
) =>
  Effect.gen(function* () {
    if (node.type !== expectedType) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${node.id}' は ${expectedType} ノードではありません` }),
      );
    }
    return node;
  });

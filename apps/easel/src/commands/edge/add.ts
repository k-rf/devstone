import { Edge } from "@devstone/libs-json-canvas-spec";
import { Command, Options } from "@effect/cli";
import { Console, Effect, Option, Schema } from "effect";

import { generateId } from "../../utils/generate-id.js";
import { readCanvas } from "../../utils/read-canvas.js";
import { writeCanvas } from "../../utils/write-canvas.js";
import { fileOption } from "../options/file-option.js";

const fromNodeOption = Options.text("from-node").pipe(Options.withDescription("Source Node ID"));
const toNodeOption = Options.text("to-node").pipe(Options.withDescription("Target Node ID"));
const fromSideOption = Options.choice("from-side", [
  "top",
  "right",
  "bottom",
  "left",
] as const).pipe(Options.optional, Options.withDescription("Connection side of the source node"));
const toSideOption = Options.choice("to-side", ["top", "right", "bottom", "left"] as const).pipe(
  Options.optional,
  Options.withDescription("Connection side of the target node"),
);
const colorOption = Options.text("color").pipe(
  Options.optional,
  Options.withDescription("Color of the connection line"),
);
const labelOption = Options.text("label").pipe(
  Options.optional,
  Options.withDescription("Optional label for the edge"),
);

/**
 * 2つのノードを接続する新しいエッジを追加するコマンド。
 * IDは自動生成され、接続元と接続先のノードの実在確認が行われます。
 * @returns 追加処理を実行する Effect。
 */
export const addEdgeCommand = Command.make("add", {
  file: fileOption,
  fromNode: fromNodeOption,
  toNode: toNodeOption,
  fromSide: fromSideOption,
  toSide: toSideOption,
  color: colorOption,
  label: labelOption,
}).pipe(
  Command.withDescription("Add a new edge with auto-assigned ID"),
  Command.withHandler(({ file, fromNode, toNode, fromSide, toSide, color, label }) =>
    readCanvas(file).pipe(
      Effect.flatMap((canvas) => {
        const fromSideValue = Option.getOrUndefined(fromSide);
        const toSideValue = Option.getOrUndefined(toSide);
        const colorValue = Option.getOrUndefined(color);
        const labelValue = Option.getOrUndefined(label);

        const nodes = canvas.nodes ?? [];
        const edges = canvas.edges ? [...canvas.edges] : [];

        const fromExists = nodes.some((n) => n.id === fromNode);
        const toExists = nodes.some((n) => n.id === toNode);

        if (!fromExists) {
          return Effect.fail(new Error(`Referenced source node '${fromNode}' does not exist`));
        }
        if (!toExists) {
          return Effect.fail(new Error(`Referenced target node '${toNode}' does not exist`));
        }

        const edgeId = generateId();
        const edgeData = {
          id: edgeId,
          fromNode: fromNode,
          toNode: toNode,
          fromSide: fromSideValue,
          toSide: toSideValue,
          color: colorValue ?? "1",
          label: labelValue,
        };

        return Effect.try({
          try: () => Schema.decodeUnknownSync(Edge)(edgeData),
          catch: (error) =>
            new Error(`エッジデータの検証に失敗しました: ${(error as Error).message}`),
        }).pipe(
          Effect.flatMap((validatedEdge) => {
            edges.push(validatedEdge);
            const updatedCanvas = {
              ...canvas,
              edges: edges,
            };
            return writeCanvas(file, updatedCanvas);
          }),
          Effect.tap(() => Console.log(`Successfully added edge: ${edgeId}`)),
        );
      }),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);

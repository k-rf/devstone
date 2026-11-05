import { Options } from "@effect/cli";

/**
 * .canvas ファイルへのパスを指定する共通オプション。
 */
export const fileOption = Options.file("file").pipe(
  Options.withAlias("f"),
  Options.withDescription("Path to the JSON-Canvas file"),
  Options.withDefault("canvas.canvas"),
);

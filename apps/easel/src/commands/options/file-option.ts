import { Options } from "@effect/cli";

/**
 * 対象となる JSON-Canvas ファイルのパスを指定する共通オプション。
 */
export const fileOption = Options.file("file").pipe(
  Options.withAlias("f"),
  Options.withDescription("JSON-Canvas file path to read/write"),
  Options.withDefault("canvas.canvas"),
);

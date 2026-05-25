import { Options } from "@effect/cli";

/**
 * ノードを一意に識別するための ID オプション。
 */
export const nodeIdOption = Options.text("id").pipe(
  Options.optional,
  Options.withDescription("Unique identifier for the node (auto-generated if omitted)"),
);

/**
 * ノードの X 座標。
 */
export const xOption = Options.integer("x").pipe(
  Options.withDescription("X coordinate of the node"),
);

/**
 * ノードの Y 座標。
 */
export const yOption = Options.integer("y").pipe(
  Options.withDescription("Y coordinate of the node"),
);

/**
 * ノードの横幅。
 */
export const widthOption = Options.integer("width").pipe(
  Options.withDescription("Width of the node"),
);

/**
 * ノードの高さ。
 */
export const heightOption = Options.integer("height").pipe(
  Options.withDescription("Height of the node"),
);

/**
 * ノードのカラー。カラープリセット(1-6)または16進数。
 */
export const colorOption = Options.text("color").pipe(
  Options.optional,
  Options.withDescription("Color preset (1-6) or hex code"),
);

/**
 * ノードの追加ラベル。
 */
export const labelOption = Options.text("label").pipe(
  Options.optional,
  Options.withDescription("Optional label"),
);

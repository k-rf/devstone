import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";

import { runCli } from "./app.js";

// メイン処理の実行。BunContext レイヤーを適用し、BunRuntime.runMain で安全に実行します。
Effect.suspend(() => runCli(process.argv)).pipe(
  Effect.provide(BunContext.layer),
  BunRuntime.runMain,
);

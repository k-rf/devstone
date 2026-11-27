import { CliConfig, Options } from "@effect/cli";
import { BunContext } from "@effect/platform-bun";
import { Effect, Option } from "effect";
import { expect, it } from "vitest";

import { notifyOption } from "./notify.option.js";

const parseNotifyOption = (args: readonly string[]) =>
  Options.processCommandLine(notifyOption, args, CliConfig.defaultConfig).pipe(
    Effect.map((result) => result[2]),
    Effect.provide(BunContext.layer),
  );

it("フラグ未指定時は Option.none を返すこと", async () => {
  expect(await Effect.runPromise(parseNotifyOption([]))).toStrictEqual(Option.none());
});

it("--notify 指定時は Option.some(true) を返すこと", async () => {
  expect(await Effect.runPromise(parseNotifyOption(["--notify"]))).toStrictEqual(Option.some(true));
});

it("--no-notify 指定時は Option.some(false) を返すこと", async () => {
  expect(await Effect.runPromise(parseNotifyOption(["--no-notify"]))).toStrictEqual(
    Option.some(false),
  );
});

it("--notify と --no-notify の同時指定時は ValidationError で失敗すること", async () => {
  const error = await Effect.runPromise(
    Effect.flip(parseNotifyOption(["--notify", "--no-notify"])),
  );

  expect(error._tag).toBe("InvalidValue");
});

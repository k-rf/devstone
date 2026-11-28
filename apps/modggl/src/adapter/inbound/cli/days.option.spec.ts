import { CliConfig, Options } from "@effect/cli";
import { BunContext } from "@effect/platform-bun";
import { Effect } from "effect";
import { expect, it } from "vitest";

import { daysOption } from "./days.option.js";

const parseDaysOption = (args: readonly string[]) =>
  Options.processCommandLine(daysOption, args, CliConfig.defaultConfig).pipe(
    Effect.map((result) => result[2]),
    Effect.provide(BunContext.layer),
  );

it("未指定時はデフォルト値の 7 を返すこと", async () => {
  expect(await Effect.runPromise(parseDaysOption([]))).toBe(7);
});

it.each([1, 3650])("許容範囲内の整数（%i）を受理すること", async (days) => {
  expect(await Effect.runPromise(parseDaysOption(["--days", String(days)]))).toBe(days);
});

it.each([
  { label: "0", value: "0" },
  { label: "負数", value: "-1" },
  { label: "上限超過 (3651)", value: "3651" },
])("許容範囲外の日数（$label）はバリデーションエラーになること", async ({ value }) => {
  const error = await Effect.runPromise(Effect.flip(parseDaysOption(["--days", value])));

  expect(error._tag).toBe("InvalidValue");
});

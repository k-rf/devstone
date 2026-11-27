import { Clock, DateTime, Effect, Option } from "effect";
import { expect, it } from "vitest";

import { resolveDateRangeActivity } from "./resolve-date-range.activity.js";

const fixedNow = DateTime.unsafeMake("2026-11-27T05:00:00.000Z");

const withFixedClock = <A, E, R>(effect: Effect.Effect<A, E, R>) => {
  const baseClock = Clock.make();
  return effect.pipe(
    Effect.withClock({
      ...baseClock,
      unsafeCurrentTimeMillis: () => fixedNow.epochMillis,
      currentTimeMillis: Effect.succeed(fixedNow.epochMillis),
    }),
  );
};

it("since と until が省略されたとき [now - days, now + 1日] を返すこと", async () => {
  const result = await Effect.runPromise(
    withFixedClock(
      resolveDateRangeActivity({
        since: Option.none(),
        until: Option.none(),
        days: 7,
      }),
    ),
  );

  expect(DateTime.formatIso(result.since)).toBe("2026-11-20T05:00:00.000Z");
  expect(DateTime.formatIso(result.until)).toBe("2026-11-28T05:00:00.000Z");
});

it("since と until が明示指定されたときその値をそのまま使用すること", async () => {
  const since = DateTime.unsafeMake("2026-11-01T00:00:00Z");
  const until = DateTime.unsafeMake("2026-11-10T00:00:00Z");

  const result = await Effect.runPromise(
    withFixedClock(
      resolveDateRangeActivity({
        since: Option.some(since),
        until: Option.some(until),
        days: 7,
      }),
    ),
  );

  expect(result).toStrictEqual({ since: since, until: until });
});

it.each([
  {
    label: "since と until が同時刻",
    since: DateTime.unsafeMake("2026-11-10T00:00:00Z"),
    until: DateTime.unsafeMake("2026-11-10T00:00:00Z"),
  },
  {
    label: "since が until より後",
    since: DateTime.unsafeMake("2026-11-11T00:00:00Z"),
    until: DateTime.unsafeMake("2026-11-10T00:00:00Z"),
  },
])("$label のとき InvalidDateRangeError を返すこと", async ({ since, until }) => {
  const error = await Effect.runPromise(
    Effect.flip(
      withFixedClock(
        resolveDateRangeActivity({
          since: Option.some(since),
          until: Option.some(until),
          days: 7,
        }),
      ),
    ),
  );

  expect(error._tag).toBe("InvalidDateRangeError");
  expect(error.since).toStrictEqual(since);
  expect(error.until).toStrictEqual(until);
});

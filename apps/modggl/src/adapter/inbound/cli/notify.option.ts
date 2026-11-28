import { HelpDoc, Options, ValidationError } from "@effect/cli";
import { Effect, Match, Option } from "effect";

const enableNotifyOption = Options.boolean("notify").pipe(
  Options.withDescription("Enable notification even when --dry-run is set"),
);

const disableNotifyOption = Options.boolean("no-notify").pipe(
  Options.withDescription("Disable notification"),
);

/**
 * 通知送信の有効／無効を明示指定するオプション。
 * 未指定時は `Option.none()` を返し、`--dry-run` の値に連動する。
 */
export const notifyOption: Options.Options<Option.Option<boolean>> = Options.all({
  enable: enableNotifyOption,
  disable: disableNotifyOption,
}).pipe(
  Options.mapEffect(({ enable, disable }) =>
    Match.value([enable, disable] as const).pipe(
      Match.when([false, false], () => Effect.succeed(Option.none<boolean>())),
      Match.when([true, false], () => Effect.succeed(Option.some(true))),
      Match.when([false, true], () => Effect.succeed(Option.some(false))),
      Match.when([true, true], () =>
        Effect.fail(
          ValidationError.invalidValue(
            HelpDoc.p("--notify and --no-notify cannot be specified together"),
          ),
        ),
      ),
      Match.exhaustive,
    ),
  ),
);

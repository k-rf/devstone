import { Options } from "@effect/cli";

import { IsoDateTimeSchema } from "./iso-date-time.option.js";

/**
 * 取得終了日時（ISO 8601）を指定するオプション
 */
export const untilOption = Options.text("until").pipe(
  Options.withSchema(IsoDateTimeSchema),
  Options.optional,
  Options.withDescription("End datetime in ISO 8601 format (defaults to now + 1 day)"),
);

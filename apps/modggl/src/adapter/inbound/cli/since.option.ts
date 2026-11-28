import { Options } from "@effect/cli";

import { IsoDateTimeSchema } from "./iso-date-time.option.js";

/**
 * 取得開始日時（ISO 8601）を指定するオプション
 */
export const sinceOption = Options.text("since").pipe(
  Options.withSchema(IsoDateTimeSchema),
  Options.optional,
  Options.withDescription("Start datetime in ISO 8601 format (defaults to now - days)"),
);

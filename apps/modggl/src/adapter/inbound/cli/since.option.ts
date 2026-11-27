import { Options } from "@effect/cli";
import { Schema } from "effect";

const IsoDateTimeSchema = Schema.String.pipe(
  Schema.pattern(/^\d{4}-\d{2}-\d{2}/u),
  Schema.compose(Schema.DateTimeUtc),
);

/**
 * 取得開始日時（ISO 8601）を指定するオプション
 */
export const sinceOption = Options.text("since").pipe(
  Options.withSchema(IsoDateTimeSchema),
  Options.optional,
  Options.withDescription("Start datetime in ISO 8601 format (defaults to now - days)"),
);

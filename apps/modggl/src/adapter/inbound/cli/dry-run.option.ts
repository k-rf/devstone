import { Options } from "@effect/cli";

/**
 * Toggl 2.0 API への書き込みを行わず計画結果のみ出力するオプション
 */
export const dryRunOption = Options.boolean("dry-run").pipe(
  Options.withDescription("Preview planned changes without writing to Toggl 2.0"),
);

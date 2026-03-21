import { Schema } from "effect";

export const TogglTimeEntryResponseSchema = Schema.Struct({
  id: Schema.Number,
  description: Schema.optionalWith(Schema.String, { default: () => "" }),
  start: Schema.String,
  workspace_id: Schema.Number,
  project_id: Schema.NullOr(Schema.Number),
});

export type TogglTimeEntryResponse = typeof TogglTimeEntryResponseSchema.Type;

export const TogglMeResponseSchema = Schema.Struct({
  id: Schema.Number,
  default_workspace_id: Schema.Number,
});

export type TogglMeResponse = typeof TogglMeResponseSchema.Type;

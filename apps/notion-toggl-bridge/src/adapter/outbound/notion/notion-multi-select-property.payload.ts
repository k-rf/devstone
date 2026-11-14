import { Schema } from "effect";

export const NotionMultiSelectProperty = Schema.Struct({
  multi_select: Schema.Array(Schema.Struct({ name: Schema.String })),
});

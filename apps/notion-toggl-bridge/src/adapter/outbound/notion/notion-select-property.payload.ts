import { Schema } from "effect";

export const NotionSelectProperty = Schema.Struct({
  select: Schema.Struct({ name: Schema.String }),
});

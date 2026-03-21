import { Schema } from "effect";

export class LinkActivityInput extends Schema.Class<LinkActivityInput>("LinkActivityInput")({
  togglProjectId: Schema.String,
  eventId: Schema.String,
}) {}

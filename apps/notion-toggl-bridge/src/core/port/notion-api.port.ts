import { Context, Data, type Effect } from "effect";

export class NotionApiError extends Data.TaggedError("NotionApiError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export interface GetRelationPageOutput {
  readonly id: string;
  readonly name: string;
  readonly category: string;
}

export interface GetDailyNoteOutput {
  readonly id: string;
  readonly title: string;
}

export class NotionApiPort extends Context.Tag("NotionApiPort")<
  NotionApiPort,
  {
    readonly getRelationPage: (
      pageId: string,
    ) => Effect.Effect<GetRelationPageOutput, NotionApiError>;
    readonly getLatestDailyNote: () => Effect.Effect<GetDailyNoteOutput, NotionApiError>;
    readonly addRelationToPage: (
      pageId: string,
      propertyName: string,
      relationPageId: string,
    ) => Effect.Effect<void, NotionApiError>;
  }
>() {}

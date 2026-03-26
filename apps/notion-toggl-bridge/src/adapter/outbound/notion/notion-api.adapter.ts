import { Effect, Layer, Option, Schema } from "effect";

import type { Environment } from "../../../core/port/environment.js";
import {
  NotionApiError,
  type NotionApiPort,
} from "../../../core/port/notion-api.port.js";
import { NotionApiPort as NotionApiPortTag } from "../../../core/port/notion-api.port.js";

import { toGetDailyNoteOutput, toGetRelationPageOutput } from "./notion-api.mapper.js";
import type { NotionPatchPageRequest, NotionQueryDatabaseRequest } from "./notion-api.request.js";
import { NotionDatabaseQueryResponse, NotionPageResponse } from "./notion-api.response.js";

const NOTION_API_BASE = "https://api.notion.com/v1";

const notionFetch = <T, I>(
  url: string,
  method: string,
  token: string,
  decoder: Schema.Schema<T, I>,
  body?: string,
): Effect.Effect<T, NotionApiError> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  };

  return Effect.tryPromise({
    try: () => {
      const init: RequestInit = { method, headers };
      if (body !== undefined) {
        init.body = body;
      }
      return fetch(url, init).then((response) => response.json());
    },
    catch: (error) =>
      new NotionApiError({ message: "Notion API request failed", cause: error }),
  }).pipe(
    Effect.flatMap((raw) =>
      Schema.decodeUnknown(decoder)(raw).pipe(
        Effect.mapError(
          (error) =>
            new NotionApiError({
              message: "Failed to decode Notion API response",
              cause: error,
            }),
        ),
      ),
    ),
  );
};

export const NotionApiAdapterLive = (environment: Environment): Layer.Layer<NotionApiPort> =>
  Layer.succeed(NotionApiPortTag, {
    getRelationPage: (pageId) =>
      notionFetch(
        `${NOTION_API_BASE}/pages/${pageId}`,
        "GET",
        environment.NOTION_API_TOKEN,
        NotionPageResponse,
      ).pipe(
        Effect.flatMap((page) => {
          const output = toGetRelationPageOutput(page);
          return Option.match(output, {
            onNone: () =>
              Effect.fail(
                new NotionApiError({
                  message: `Could not extract page data from page: ${pageId}`,
                }),
              ),
            onSome: (outputValue) => Effect.succeed(outputValue),
          });
        }),
      ),

    getLatestDailyNote: () =>
      Effect.sync(() => {
        const iso = new Date().toISOString();
        return iso.split("T")[0] ?? iso;
      }).pipe(
        Effect.flatMap((today) => {
          const request: NotionQueryDatabaseRequest = {
            filter: {
              property: environment.NOTION_DAILY_NOTE_DATE_PROPERTY,
              date: { on_or_before: today },
            },
            sorts: [
              {
                property: environment.NOTION_DAILY_NOTE_DATE_PROPERTY,
                direction: "descending",
              },
            ],
            page_size: 1,
          };

          return notionFetch(
            `${NOTION_API_BASE}/databases/${environment.NOTION_DAILY_NOTE_DATABASE_ID}/query`,
            "POST",
            environment.NOTION_API_TOKEN,
            NotionDatabaseQueryResponse,
            JSON.stringify(request),
          );
        }),
        Effect.flatMap((response) => {
          const firstPage = response.results[0];
          if (firstPage === undefined) {
            return Effect.fail(new NotionApiError({ message: "No daily note found" }));
          }
          const output = toGetDailyNoteOutput(firstPage);
          return Option.match(output, {
            onNone: () =>
              Effect.fail(
                new NotionApiError({ message: "Could not extract title from daily note" }),
              ),
            onSome: (outputValue) => Effect.succeed(outputValue),
          });
        }),
      ),

    addRelationToPage: (pageId, propertyName, relationPageId) => {
      const request: NotionPatchPageRequest = {
        properties: {
          [propertyName]: {
            relation: [{ id: relationPageId }],
          },
        },
      };

      return notionFetch(
        `${NOTION_API_BASE}/pages/${pageId}`,
        "PATCH",
        environment.NOTION_API_TOKEN,
        NotionPageResponse,
        JSON.stringify(request),
      ).pipe(Effect.asVoid);
    },
  });

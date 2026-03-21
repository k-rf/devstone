import { Option, Schema } from "effect";

import type { GetDailyNoteOutput, GetRelationPageOutput } from "../../../core/port/notion-api.port.js";

import {
  NotionPagePropertySelect,
  NotionPagePropertyTitle,
  type NotionPageResponse,
} from "./notion-api.response.js";

const extractTitle = (properties: Record<string, unknown>): Option.Option<string> => {
  const titleEntry = Object.values(properties).find(
    (p): p is NotionPagePropertyTitle => Schema.is(NotionPagePropertyTitle)(p),
  );

  if (titleEntry === undefined) return Option.none();
  const firstText = titleEntry.title[0];
  if (firstText === undefined) return Option.none();
  const plainText = firstText.plain_text;
  return Option.some(plainText); // eslint-disable-line unicorn/no-array-callback-reference
};

const extractSelectValue = (
  properties: Record<string, unknown>,
  propertyName: string,
): Option.Option<string> => {
  const property = properties[propertyName];
  if (!Schema.is(NotionPagePropertySelect)(property)) return Option.none();
  if (property.select === null) return Option.none();
  const selectName = property.select.name;
  return Option.some(selectName); // eslint-disable-line unicorn/no-array-callback-reference
};

export const toGetRelationPageOutput = (
  page: NotionPageResponse,
  categoryPropertyName = "カテゴリ",
): Option.Option<GetRelationPageOutput> => {
  const name = extractTitle(page.properties);
  const category = extractSelectValue(page.properties, categoryPropertyName);

  return Option.all({ name, category }).pipe(
    Option.map(({ name: pageName, category: pageCategory }) => ({
      id: page.id,
      name: pageName,
      category: pageCategory,
    })),
  );
};

export const toGetDailyNoteOutput = (
  page: NotionPageResponse,
): Option.Option<GetDailyNoteOutput> => {
  const title = extractTitle(page.properties);
  return title.pipe(Option.map((titleValue) => ({ id: page.id, title: titleValue })));
};

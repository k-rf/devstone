import { Schema } from "effect";

const DATE_PART_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/u;
const TIME_PART_PATTERN = /^(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-](\d{2}):(\d{2}))?$/u;

const validateCalendarDate = (datePart: string): boolean => {
  const matched = DATE_PART_PATTERN.exec(datePart);

  return matched
    ? (() => {
        const year = Number(matched[1]);
        const month = Number(matched[2]);
        const day = Number(matched[3]);
        const checkDate = new Date(Date.UTC(year, month - 1, day));

        return (
          checkDate.getUTCFullYear() === year &&
          checkDate.getUTCMonth() === month - 1 &&
          checkDate.getUTCDate() === day
        );
      })()
    : false;
};

const validateTimeAndOffset = (timePart: string): boolean => {
  const matched = TIME_PART_PATTERN.exec(timePart);

  return matched
    ? (() => {
        const hour = Number(matched[1]);
        const minute = Number(matched[2]);
        const second = Number(matched[3]);
        const offsetHour = matched[4];
        const offsetMinute = matched[5];
        const validTime = hour <= 23 && minute <= 59 && second <= 59;
        const validOffset =
          offsetHour === undefined || (Number(offsetHour) <= 23 && Number(offsetMinute) <= 59);

        return validTime && validOffset;
      })()
    : false;
};

const isValidIsoCalendarDateTime = (value: string): boolean => {
  const tIndex = value.indexOf("T");
  const datePart = tIndex === -1 ? value : value.slice(0, tIndex);
  const timePart = tIndex === -1 ? undefined : value.slice(tIndex + 1);

  return (
    validateCalendarDate(datePart) && (timePart === undefined || validateTimeAndOffset(timePart))
  );
};

/**
 * 暦日・時刻・オフセットの実在性を検証する ISO 8601 UTC 日時スキーマ
 */
export const IsoDateTimeSchema = Schema.String.pipe(
  Schema.filter((value) =>
    isValidIsoCalendarDateTime(value) ? true : "実在する ISO 8601 日時を指定してください",
  ),
  Schema.compose(Schema.DateTimeUtc),
);

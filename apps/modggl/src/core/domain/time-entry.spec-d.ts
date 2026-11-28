import { type Option } from "effect";
import { describe, expectTypeOf, it } from "vitest";

import { type ClientId } from "./client-id.js";
import { type ProjectId } from "./project-id.js";
import { type RevisionPlan } from "./revision-plan.js";
import { type TagId } from "./tag-id.js";
import { type TaskId } from "./task-id.js";
import { type TimeEntryId } from "./time-entry-id.js";
import { type TimeEntry } from "./time-entry.js";

describe("正常系（ドメイン型制約）", () => {
  it("TimeEntry の任意項目がブランド型付きの Option.Option で表現されていること", () => {
    expectTypeOf<TimeEntry["id"]>().toEqualTypeOf<TimeEntryId>();
    expectTypeOf<TimeEntry["taskId"]>().toEqualTypeOf<Option.Option<TaskId>>();
    expectTypeOf<TimeEntry["projectId"]>().toEqualTypeOf<Option.Option<ProjectId>>();
    expectTypeOf<TimeEntry["clientId"]>().toEqualTypeOf<Option.Option<ClientId>>();
  });

  it("TimeEntry の tagIds がブランド型付きの不変配列であること", () => {
    expectTypeOf<TimeEntry["tagIds"]>().toEqualTypeOf<readonly TagId[]>();
  });

  it("RevisionPlan の Aborted 状態の reason が期待するリテラルユニオンと一致すること", () => {
    expectTypeOf<Extract<RevisionPlan, { readonly _tag: "Aborted" }>["reason"]>().toEqualTypeOf<
      "NotDetermine" | "InvalidOrder"
    >();
  });
});

describe("異常系（undefined および未ブランド型の混入防止）", () => {
  it("TimeEntry の任意項目に undefined を代入できないこと", () => {
    expectTypeOf<undefined>().not.toExtend<TimeEntry["taskId"]>();
    expectTypeOf<undefined>().not.toExtend<TimeEntry["projectId"]>();
    expectTypeOf<undefined>().not.toExtend<TimeEntry["clientId"]>();
  });

  it("素の number や別種別のブランド ID を混同して代入できないこと", () => {
    expectTypeOf<number>().not.toExtend<TimeEntryId>();
    expectTypeOf<TimeEntryId>().not.toExtend<ProjectId>();
    expectTypeOf<ProjectId>().not.toExtend<TaskId>();
  });
});

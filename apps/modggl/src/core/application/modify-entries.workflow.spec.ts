import { TimeInstant, TimeInterval } from "@devstone/libs-time-interval";
import { DateTime, Effect, Layer, Option } from "effect";
import { describe, expect, it, vi } from "vitest";

import { type EntryModification } from "../domain/revision-plan.js";
import { TimeEntryId } from "../domain/time-entry-id.js";
import { type TimeEntry } from "../domain/time-entry.js";
import {
  NotificationError,
  NotificationPort,
  type AbortedNotification,
  type CompletedNotification,
  type ErrorNotification,
} from "../port/outbound/notification/notification.port.js";
import {
  TimeEntriesError,
  TimeEntriesPort,
  type ListEntriesParams,
  type ListEntriesResult,
  type QuotaInfo,
} from "../port/outbound/toggl/time-entries.port.js";

import { LookbackDays } from "./lookback-days.input.js";
import { modifyEntriesWorkflow } from "./modify-entries.workflow.js";

const interval = (startSec: number, endSec: number): TimeInterval =>
  TimeInterval.make({
    start: TimeInstant.make(startSec * 1000),
    end: TimeInstant.make(endSec * 1000),
  });

const makeEntry = (
  id: number,
  startSec: number,
  endSec: number,
  description: string,
): TimeEntry => ({
  id: TimeEntryId.make(id),
  interval: interval(startSec, endSec),
  type: "activity",
  taskId: Option.none(),
  projectId: Option.none(),
  clientId: Option.none(),
  description: description,
  tagIds: [],
  billable: false,
  hasScheduleBinding: false,
});

const sinceDate = DateTime.unsafeMake("2026-11-27T00:00:00Z");
const untilDate = DateTime.unsafeMake("2026-11-28T00:00:00Z");
const since = Option.some(sinceDate);
const until = Option.some(untilDate);

const baseInput = {
  since: since,
  until: until,
  days: LookbackDays.make(7),
  dryRun: false,
};

interface MockHarness {
  readonly listSpy: ReturnType<
    typeof vi.fn<(params: ListEntriesParams) => Effect.Effect<ListEntriesResult, TimeEntriesError>>
  >;
  readonly updateSpy: ReturnType<
    typeof vi.fn<
      (
        mods: readonly EntryModification[],
      ) => Effect.Effect<Option.Option<QuotaInfo>, TimeEntriesError>
    >
  >;
  readonly deleteSpy: ReturnType<
    typeof vi.fn<
      (ids: readonly TimeEntryId[]) => Effect.Effect<Option.Option<QuotaInfo>, TimeEntriesError>
    >
  >;
  readonly notifyCompletedSpy: ReturnType<
    typeof vi.fn<(n: CompletedNotification) => Effect.Effect<void, NotificationError>>
  >;
  readonly notifyAbortedSpy: ReturnType<
    typeof vi.fn<(n: AbortedNotification) => Effect.Effect<void, NotificationError>>
  >;
  readonly notifyErrorSpy: ReturnType<
    typeof vi.fn<(n: ErrorNotification) => Effect.Effect<void, NotificationError>>
  >;
  readonly layer: Layer.Layer<TimeEntriesPort | NotificationPort>;
}

const makeHarness = (entries: readonly TimeEntry[], excludedCount = 0): MockHarness => {
  const listSpy = vi.fn<
    (params: ListEntriesParams) => Effect.Effect<ListEntriesResult, TimeEntriesError>
  >(() =>
    Effect.succeed({
      entries: entries,
      fetchedCount: entries.length + excludedCount,
      excludedCount: excludedCount,
      quota: { remaining: Option.some(29), resetsInSeconds: Option.some(3600) },
    }),
  );
  const updateSpy = vi.fn<
    (
      mods: readonly EntryModification[],
    ) => Effect.Effect<Option.Option<QuotaInfo>, TimeEntriesError>
  >(() =>
    Effect.succeed(Option.some({ remaining: Option.some(28), resetsInSeconds: Option.some(3550) })),
  );
  const deleteSpy = vi.fn<
    (ids: readonly TimeEntryId[]) => Effect.Effect<Option.Option<QuotaInfo>, TimeEntriesError>
  >(() =>
    Effect.succeed(Option.some({ remaining: Option.some(27), resetsInSeconds: Option.some(3500) })),
  );
  const notifyCompletedSpy = vi.fn<
    (n: CompletedNotification) => Effect.Effect<void, NotificationError>
  >(() => Effect.void);
  const notifyAbortedSpy = vi.fn<
    (n: AbortedNotification) => Effect.Effect<void, NotificationError>
  >(() => Effect.void);
  const notifyErrorSpy = vi.fn<(n: ErrorNotification) => Effect.Effect<void, NotificationError>>(
    () => Effect.void,
  );

  const layer = Layer.mergeAll(
    Layer.succeed(TimeEntriesPort, {
      listEntries: listSpy,
      updateEntries: updateSpy,
      deleteEntries: deleteSpy,
    }),
    Layer.succeed(NotificationPort, {
      notifyCompleted: notifyCompletedSpy,
      notifyAborted: notifyAbortedSpy,
      notifyError: notifyErrorSpy,
    }),
  );

  return {
    listSpy: listSpy,
    updateSpy: updateSpy,
    deleteSpy: deleteSpy,
    notifyCompletedSpy: notifyCompletedSpy,
    notifyAbortedSpy: notifyAbortedSpy,
    notifyErrorSpy: notifyErrorSpy,
    layer: layer,
  };
};

describe("正常系（更新・削除・ドライラン・変更なし）", () => {
  it("マージと隙間補完の両方が発生したとき updateEntries → deleteEntries の順で呼び出し completed と通知を出力すること", async () => {
    const entries = [
      makeEntry(1, 0, 300, "A"),
      makeEntry(2, 300, 600, "A"),
      makeEntry(3, 900, 1200, "B"),
    ];
    const harness = makeHarness(entries, 2);
    const expectedModifications: readonly EntryModification[] = [
      { id: TimeEntryId.make(1), previousInterval: interval(0, 300), interval: interval(0, 900) },
    ];
    const expectedQuota: QuotaInfo = {
      remaining: Option.some(27),
      resetsInSeconds: Option.some(3500),
    };

    const output = await Effect.runPromise(
      modifyEntriesWorkflow(baseInput).pipe(Effect.provide(harness.layer)),
    );

    expect(harness.listSpy).toHaveBeenCalledWith({ since: sinceDate, until: untilDate });
    expect(harness.updateSpy).toHaveBeenCalledWith(expectedModifications);
    expect(harness.deleteSpy).toHaveBeenCalledWith([TimeEntryId.make(2)]);
    const updateCallOrder = harness.updateSpy.mock.invocationCallOrder[0] ?? 0;
    const deleteCallOrder = harness.deleteSpy.mock.invocationCallOrder[0] ?? 0;
    expect(updateCallOrder).toBeLessThan(deleteCallOrder);
    expect(harness.notifyCompletedSpy).toHaveBeenCalledWith({
      status: "completed",
      since: sinceDate,
      until: untilDate,
      fetchedCount: 5,
      excludedCount: 2,
      modifications: expectedModifications,
      deletedIds: [TimeEntryId.make(2)],
      quota: expectedQuota,
    });
    expect(output.status).toBe("completed");
    expect(output.stats).toStrictEqual({
      fetchedCount: 5,
      excludedCount: 2,
      processedCount: 3,
      modifiedCount: 1,
      deletedCount: 1,
    });
    expect(output.quota).toStrictEqual(expectedQuota);
  });

  it("listEntries が未ソート配列を返しても Core 側で決定論的にソートして計画を適用すること", async () => {
    const entries = [makeEntry(2, 600, 900, "B"), makeEntry(1, 0, 300, "A")];
    const harness = makeHarness(entries);
    const expectedModifications: readonly EntryModification[] = [
      { id: TimeEntryId.make(1), previousInterval: interval(0, 300), interval: interval(0, 600) },
    ];

    const output = await Effect.runPromise(
      modifyEntriesWorkflow(baseInput).pipe(Effect.provide(harness.layer)),
    );

    expect(harness.updateSpy).toHaveBeenCalledWith(expectedModifications);
    expect(output.status).toBe("completed");
  });

  it("更新のみ発生したとき deleteEntries を呼ばず PATCH のクォータを返すこと", async () => {
    const entries = [makeEntry(1, 0, 300, "A"), makeEntry(2, 600, 900, "B")];
    const harness = makeHarness(entries);
    const expectedModifications: readonly EntryModification[] = [
      { id: TimeEntryId.make(1), previousInterval: interval(0, 300), interval: interval(0, 600) },
    ];

    const output = await Effect.runPromise(
      modifyEntriesWorkflow(baseInput).pipe(Effect.provide(harness.layer)),
    );

    expect(harness.updateSpy).toHaveBeenCalledWith(expectedModifications);
    expect(harness.deleteSpy).not.toHaveBeenCalled();
    expect(output.status).toBe("completed");
    expect(output.quota).toStrictEqual({
      remaining: Option.some(28),
      resetsInSeconds: Option.some(3550),
    });
  });

  it("削除のみ発生したとき updateEntries を呼ばないこと", async () => {
    const entries = [makeEntry(1, 0, 600, "A"), makeEntry(2, 0, 600, "A")];
    const harness = makeHarness(entries);

    const output = await Effect.runPromise(
      modifyEntriesWorkflow(baseInput).pipe(Effect.provide(harness.layer)),
    );

    expect(harness.updateSpy).not.toHaveBeenCalled();
    expect(harness.deleteSpy).toHaveBeenCalledWith([TimeEntryId.make(2)]);
    expect(output.status).toBe("completed");
  });

  it("変更がないときは書き込みを行わず status=no_changes で通知すること", async () => {
    const entries = [makeEntry(1, 0, 600, "A"), makeEntry(2, 600, 1200, "B")];
    const harness = makeHarness(entries);

    const output = await Effect.runPromise(
      modifyEntriesWorkflow(baseInput).pipe(Effect.provide(harness.layer)),
    );

    expect(harness.updateSpy).not.toHaveBeenCalled();
    expect(harness.deleteSpy).not.toHaveBeenCalled();
    expect(harness.notifyCompletedSpy).toHaveBeenCalledWith({
      status: "no_changes",
      since: sinceDate,
      until: untilDate,
      fetchedCount: 2,
      excludedCount: 0,
      modifications: [],
      deletedIds: [],
      quota: { remaining: Option.some(29), resetsInSeconds: Option.some(3600) },
    });
    expect(output.status).toBe("no_changes");
  });

  it("dryRun=true のときは差分があっても書き込みを一切行わず status=dry_run で通知すること", async () => {
    const entries = [makeEntry(1, 0, 300, "A"), makeEntry(2, 600, 900, "B")];
    const harness = makeHarness(entries);
    const expectedModifications: readonly EntryModification[] = [
      { id: TimeEntryId.make(1), previousInterval: interval(0, 300), interval: interval(0, 600) },
    ];

    const output = await Effect.runPromise(
      modifyEntriesWorkflow({ ...baseInput, dryRun: true }).pipe(Effect.provide(harness.layer)),
    );

    expect(harness.updateSpy).not.toHaveBeenCalled();
    expect(harness.deleteSpy).not.toHaveBeenCalled();
    expect(harness.notifyCompletedSpy).toHaveBeenCalledWith({
      status: "dry_run",
      since: sinceDate,
      until: untilDate,
      fetchedCount: 2,
      excludedCount: 0,
      modifications: expectedModifications,
      deletedIds: [],
      quota: { remaining: Option.some(29), resetsInSeconds: Option.some(3600) },
    });
    expect(output.status).toBe("dry_run");
    expect(output.stats.modifiedCount).toBe(1);
  });

  it("更新または削除の応答クォータが Option.none のときは一覧取得時のクォータを引き継ぐこと", async () => {
    const entries = [makeEntry(1, 0, 300, "A"), makeEntry(2, 600, 900, "B")];
    const harness = makeHarness(entries);
    harness.updateSpy.mockImplementation(() => Effect.succeed(Option.none()));

    const output = await Effect.runPromise(
      modifyEntriesWorkflow(baseInput).pipe(Effect.provide(harness.layer)),
    );

    expect(output.quota).toStrictEqual({
      remaining: Option.some(29),
      resetsInSeconds: Option.some(3600),
    });
  });

  it("完了通知が失敗しても書き込み成功結果はそのまま返すこと", async () => {
    const entries = [makeEntry(1, 0, 300, "A"), makeEntry(2, 600, 900, "B")];
    const harness = makeHarness(entries);
    harness.notifyCompletedSpy.mockImplementation(() =>
      Effect.fail(new NotificationError({ message: "webhook down", cause: Option.none() })),
    );

    const output = await Effect.runPromise(
      modifyEntriesWorkflow(baseInput).pipe(Effect.provide(harness.layer)),
    );

    expect(output.status).toBe("completed");
  });
});

describe("異常系（全停止・API エラー・不正期間）", () => {
  it("判定不能重複（NotDetermine）のとき書き込みを一切行わず notifyAborted を呼んで失敗すること", async () => {
    const first = makeEntry(1, 0, 600, "A");
    const second = makeEntry(2, 0, 600, "B");
    const harness = makeHarness([first, second]);

    const error = await Effect.runPromise(
      Effect.flip(modifyEntriesWorkflow(baseInput).pipe(Effect.provide(harness.layer))),
    );

    expect(harness.updateSpy).not.toHaveBeenCalled();
    expect(harness.deleteSpy).not.toHaveBeenCalled();
    expect(harness.notifyAbortedSpy).toHaveBeenCalledWith({
      reason: "NotDetermine",
      first: first,
      second: second,
    });
    expect(error._tag).toBe("ModifyEntriesAbortedError");
    if (error._tag === "ModifyEntriesAbortedError") {
      expect(error.reason).toBe("NotDetermine");
      expect(error.stats).toStrictEqual({
        fetchedCount: 2,
        excludedCount: 0,
        processedCount: 2,
      });
      expect(error.quota).toStrictEqual({
        remaining: Option.some(29),
        resetsInSeconds: Option.some(3600),
      });
    }
  });

  it("notifyAborted が失敗しても元の ModifyEntriesAbortedError を返すこと", async () => {
    const entries = [makeEntry(1, 0, 600, "A"), makeEntry(2, 0, 600, "B")];
    const harness = makeHarness(entries);
    harness.notifyAbortedSpy.mockImplementation(() =>
      Effect.fail(new NotificationError({ message: "notify failed", cause: Option.none() })),
    );

    const error = await Effect.runPromise(
      Effect.flip(modifyEntriesWorkflow(baseInput).pipe(Effect.provide(harness.layer))),
    );

    expect(error._tag).toBe("ModifyEntriesAbortedError");
  });

  it("listEntries が TimeEntriesError で失敗したとき notifyError を呼んで失敗すること", async () => {
    const harness = makeHarness([]);
    harness.listSpy.mockImplementation(() =>
      Effect.fail(
        new TimeEntriesError({
          message: "quota exceeded",
          reason: "QuotaExceeded",
          status: Option.some(402),
          resetsInSeconds: Option.some(1800),
          cause: Option.none(),
        }),
      ),
    );

    const error = await Effect.runPromise(
      Effect.flip(modifyEntriesWorkflow(baseInput).pipe(Effect.provide(harness.layer))),
    );

    expect(harness.notifyErrorSpy).toHaveBeenCalledWith({
      message: "quota exceeded",
      reason: "QuotaExceeded",
      status: Option.some(402),
      resetsInSeconds: Option.some(1800),
    });
    expect(error._tag).toBe("TimeEntriesError");
  });

  it("updateEntries が失敗したとき deleteEntries を呼ばずに notifyError を呼んで TimeEntriesError を返すこと", async () => {
    const entries = [
      makeEntry(1, 0, 300, "A"),
      makeEntry(2, 300, 600, "A"),
      makeEntry(3, 900, 1200, "B"),
    ];
    const harness = makeHarness(entries);
    harness.updateSpy.mockImplementation(() =>
      Effect.fail(
        new TimeEntriesError({
          message: "conflict",
          reason: "Conflict",
          status: Option.some(409),
          resetsInSeconds: Option.none(),
          cause: Option.none(),
        }),
      ),
    );

    const error = await Effect.runPromise(
      Effect.flip(modifyEntriesWorkflow(baseInput).pipe(Effect.provide(harness.layer))),
    );

    expect(harness.deleteSpy).not.toHaveBeenCalled();
    expect(harness.notifyErrorSpy).toHaveBeenCalledWith({
      message: "conflict",
      reason: "Conflict",
      status: Option.some(409),
      resetsInSeconds: Option.none(),
    });
    expect(error._tag).toBe("TimeEntriesError");
  });

  it("notifyError が失敗しても元の TimeEntriesError を返すこと", async () => {
    const entries = [makeEntry(1, 0, 600, "A"), makeEntry(2, 0, 600, "A")];
    const harness = makeHarness(entries);
    harness.deleteSpy.mockImplementation(() =>
      Effect.fail(
        new TimeEntriesError({
          message: "server error",
          reason: "ApiError",
          status: Option.some(500),
          resetsInSeconds: Option.none(),
          cause: Option.none(),
        }),
      ),
    );
    harness.notifyErrorSpy.mockImplementation(() =>
      Effect.fail(new NotificationError({ message: "notify error", cause: Option.none() })),
    );

    const error = await Effect.runPromise(
      Effect.flip(modifyEntriesWorkflow(baseInput).pipe(Effect.provide(harness.layer))),
    );

    expect(error._tag).toBe("TimeEntriesError");
  });

  it("since >= until のときは listEntries も通知も呼ばず InvalidDateRangeError を返すこと", async () => {
    const harness = makeHarness([]);

    const error = await Effect.runPromise(
      Effect.flip(
        modifyEntriesWorkflow({
          ...baseInput,
          since: until,
          until: since,
        }).pipe(Effect.provide(harness.layer)),
      ),
    );

    expect(harness.listSpy).not.toHaveBeenCalled();
    expect(harness.notifyErrorSpy).not.toHaveBeenCalled();
    expect(error._tag).toBe("InvalidDateRangeError");
  });
});

import { Effect } from "effect";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { NotificationPort } from "../../../core/port/outbound/slack/notification.port";

import { SlackAdapterLive } from "./slack.adapter";

const webhookUrl = "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX";

const server = setupServer();

beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => {
  server.close();
});

describe("正常系", () => {
  it("正常に通知が送れること", async () => {
    let capturedBody: unknown;
    server.use(
      http.post(webhookUrl, async ({ request }) => {
        capturedBody = await request.json();
        return new HttpResponse(undefined, { status: 200 });
      }),
    );

    const layer = SlackAdapterLive(webhookUrl);
    const program = Effect.gen(function* () {
      const port = yield* NotificationPort;
      yield* port.notifyError("Test Message", { key1: "value1", key2: 123 });
    }).pipe(Effect.provide(layer));

    await Effect.runPromise(program);

    expect(capturedBody).toMatchObject({
      text: /Test Message/,
      attachments: [
        {
          fields: [
            { title: "key1", value: "value1" },
            { title: "key2", value: "123" },
          ],
        },
      ],
    });
  });

  it("details がない場合も正常に通知が送れること", async () => {
    let capturedBody: unknown;

    server.use(
      http.post(webhookUrl, async ({ request }) => {
        capturedBody = await request.json();
        return new HttpResponse(undefined, { status: 200 });
      }),
    );

    const layer = SlackAdapterLive(webhookUrl);
    const program = Effect.gen(function* () {
      const port = yield* NotificationPort;
      yield* port.notifyError("Test Message");
    }).pipe(Effect.provide(layer));

    await Effect.runPromise(program);

    expect(capturedBody).toMatchObject({
      attachments: [],
    });
  });
});

describe("異常系", () => {
  it("ネットワークエラーが発生しても、プログラムが停止しないこと（エラーログが出力されること）", async () => {
    const consoleSpy = vi.spyOn(console, "error");

    server.use(
      http.post(webhookUrl, () => {
        return HttpResponse.error();
      }),
    );

    const layer = SlackAdapterLive(webhookUrl);
    const program = Effect.gen(function* () {
      const port = yield* NotificationPort;
      yield* port.notifyError("Test Message");
    }).pipe(Effect.provide(layer));

    await Effect.runPromise(program);

    expect(consoleSpy).toHaveBeenCalled();
  });
});

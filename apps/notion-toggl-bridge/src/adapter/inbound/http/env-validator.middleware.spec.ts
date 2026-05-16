import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";

import { envValidatorMiddleware, type Env } from "./env-validator.middleware";
import { type Bindings } from "./types";

const mockKv: Bindings["TOGGL_MAPPER"] = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
  getWithMetadata: vi.fn(),
};

const validEnv: Bindings = {
  NOTION_TOGGL_BRIDGE_API_TOKEN: "token",
  NOTION_WEBHOOK_SECRET: "secret",
  SLACK_WEBHOOK_URL: "https://slack.com",
  TOGGL_API_TOKEN: "toggl-token",
  TOGGL_WORKSPACE_ID: "12345",
  TOGGL_MAPPER: mockKv,
};

describe("正常系", () => {
  it("有効な環境変数の場合、next() が呼ばれ env がセットされること", async () => {
    const app = new Hono<{ Variables: { env: Env } }>();
    app.use("*", envValidatorMiddleware);
    app.get("/", (c) => c.json(c.var.env));

    const res = await app.request("/", {}, validEnv);
    expect(res.status).toBe(200);
    expect(await res.json()).toStrictEqual({
      NOTION_TOGGL_BRIDGE_API_TOKEN: "token",
      NOTION_WEBHOOK_SECRET: "secret",
      SLACK_WEBHOOK_URL: "https://slack.com",
      TOGGL_API_TOKEN: "toggl-token",
      TOGGL_WORKSPACE_ID: 12_345,
    });
  });
});

describe("異常系", () => {
  it("環境変数が不足している場合、500 を返しエラーログを出力すること", async () => {
    // REMARKS: NOTION_TOGGL_BRIDGE_API_TOKEN を欠いた環境変数オブジェクトを作成する
    const invalidEnv = {
      NOTION_WEBHOOK_SECRET: "secret",
      SLACK_WEBHOOK_URL: "https://slack.com",
      TOGGL_API_TOKEN: "toggl-token",
      TOGGL_WORKSPACE_ID: "12345",
      TOGGL_MAPPER: mockKv,
    } as Bindings;

    const consoleSpy = vi.spyOn(console, "error");
    const app = new Hono();
    app.use("*", envValidatorMiddleware);
    app.get("/", (c) => c.text("ok"));

    const res = await app.request("/", {}, invalidEnv);
    expect(res.status).toBe(500);
    expect(await res.json()).toStrictEqual({
      message: "Internal Server Error: Invalid Configuration",
    });
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("数値であるべき環境変数が不正な場合、500 を返すこと", async () => {
    const invalidEnv: Bindings = {
      ...validEnv,
      TOGGL_WORKSPACE_ID: "not-a-number",
    };

    const app = new Hono();
    app.use("*", envValidatorMiddleware);
    app.get("/", (c) => c.text("ok"));

    const res = await app.request("/", {}, invalidEnv);
    expect(res.status).toBe(500);
  });
});

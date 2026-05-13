import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import { verifySecretMiddleware } from "./verify-secret.middleware";

const secret = "correct-secret";
const env = { NOTION_WEBHOOK_SECRET: secret };

describe("正常系", () => {
  it("正しいシークレットの場合、next() が呼ばれること", async () => {
    const app = new Hono<{ Bindings: { NOTION_WEBHOOK_SECRET: string } }>();
    app.use("*", verifySecretMiddleware);
    app.get("/", (c) => c.text("ok"));

    const res = await app.request("/", { headers: { "X-Shared-Secret": secret } }, env);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });
});

describe("異常系", () => {
  it("シークレットが不足している場合、401 を返すこと", async () => {
    const app = new Hono<{ Bindings: { NOTION_WEBHOOK_SECRET: string } }>();
    app.use("*", verifySecretMiddleware);
    app.get("/", (c) => c.text("ok"));

    const res = await app.request("/", {}, env);

    expect(res.status).toBe(401);
    expect(await res.json()).toStrictEqual({ message: "Unauthorized" });
  });

  it("シークレットが正しくない場合、401 を返すこと", async () => {
    const app = new Hono<{ Bindings: { NOTION_WEBHOOK_SECRET: string } }>();
    app.use("*", verifySecretMiddleware);
    app.get("/", (c) => c.text("ok"));

    const res = await app.request("/", { headers: { "X-Shared-Secret": "wrong-secret" } }, env);

    expect(res.status).toBe(401);
  });
});

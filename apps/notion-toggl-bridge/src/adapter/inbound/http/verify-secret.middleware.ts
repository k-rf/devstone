import { createMiddleware } from "hono/factory";

import { timingSafeEqual } from "../../../utils/timing-safe-equal";

import { type Env } from "./env-validator.middleware";
import { type Bindings } from "./types";

/**
 * シークレット検証ミドルウェア
 */
export const verifySecretMiddleware = createMiddleware<{
  Bindings: Bindings;
  Variables: { env: Env };
}>(async (c, next) => {
  const receivedSecret = c.req.header("X-Shared-Secret");
  const expectedSecret = c.env.NOTION_WEBHOOK_SECRET;

  if (receivedSecret === undefined || !(await timingSafeEqual(receivedSecret, expectedSecret)))
    return c.json({ message: "Unauthorized" }, 401);

  return next();
});

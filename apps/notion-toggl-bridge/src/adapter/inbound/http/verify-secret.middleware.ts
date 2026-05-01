import { createMiddleware } from "hono/factory";

import { type Env } from "./env-validator.middleware";
import { type Bindings } from "./types";

/**
 * HMAC を使った定数時間比較 — crypto.timingSafeEqual は Workers 環境に存在しないため Web Crypto で代替
 * @param a - 比較する文字列
 * @param b - 比較する文字列
 * @returns 比較結果（等しい場合は true、そうでない場合は false）
 */
const timingSafeEqual = async (a: string, b: string): Promise<boolean> => {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.generateKey({ name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
  const [sigA, sigB] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(a)),
    crypto.subtle.sign("HMAC", key, encoder.encode(b)),
  ]);

  const bytesA = new Uint8Array(sigA);
  const bytesB = new Uint8Array(sigB);

  const result = [...bytesA].reduce((acc, byte, i) => acc | (byte ^ (bytesB[i] ?? 0)), 0);

  return result === 0;
};

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

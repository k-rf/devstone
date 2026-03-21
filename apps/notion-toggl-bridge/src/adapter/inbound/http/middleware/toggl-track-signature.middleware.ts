import { Option } from "effect";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";

import type { HonoEnvironment } from "../hono-environment.js";

const hexToArrayBuffer = (hex: string): Option.Option<ArrayBuffer> => {
  if (hex.length % 2 !== 0) return Option.none();
  const buffer = new ArrayBuffer(hex.length / 2);
  const view = new Uint8Array(buffer);
  for (let index = 0; index < hex.length; index += 2) {
    const byte = Number.parseInt(hex.slice(index, index + 2), 16);
    if (Number.isNaN(byte)) return Option.none();
    view[index / 2] = byte;
  }
  return Option.some(buffer);
};

const verifyHmacSha256 = async (
  body: string,
  secret: string,
  signature: string,
): Promise<boolean> => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const signatureBuffer = hexToArrayBuffer(signature);
  if (Option.isNone(signatureBuffer)) return false;

  return crypto.subtle.verify("HMAC", key, signatureBuffer.value, encoder.encode(body));
};

export const togglTrackSignatureMiddleware = createMiddleware<HonoEnvironment>(
  async (c: Context<HonoEnvironment>, next) => {
    const rawBody = await c.req.text();

    const signature = Option.fromNullable(c.req.header("X-Webhook-Signature-256"));
    if (Option.isNone(signature)) {
      return c.json({ error: "Missing signature" }, 401);
    }

    const isValid = await verifyHmacSha256(
      rawBody,
      c.env.TOGGL_TRACK_WEBHOOK_SECRET,
      signature.value,
    );
    if (!isValid) {
      return c.json({ error: "Invalid signature" }, 401);
    }

    c.set("rawBody", rawBody);
    return next();
  },
);

import { Hono } from "hono";

import { webhookRoute } from "./adapter/inbound/http/webhook.route";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Notion to Toggl Track Bridge is running!");
});

// Webhook ルートのマウント
app.route("/toggl", webhookRoute);

export default app;

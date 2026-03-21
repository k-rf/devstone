import { Hono } from "hono";

import { notionRoute } from "./adapter/inbound/http/notion.route.js";
import { togglTrackRoute } from "./adapter/inbound/http/toggl-track.route.js";
import type { Environment } from "./core/port/environment.js";

const app = new Hono<{ Bindings: Environment }>();

app.get("/health", (c) => c.json({ status: "ok" }, 200));

app.route("/webhooks/notion", notionRoute);
app.route("/webhooks/toggl-track", togglTrackRoute);

export default app;

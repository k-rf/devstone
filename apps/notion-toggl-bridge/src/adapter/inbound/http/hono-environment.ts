import type { Environment } from "../../../core/port/environment.js";

export interface HonoEnvironment {
  Bindings: Environment;
  Variables: { rawBody: string };
}

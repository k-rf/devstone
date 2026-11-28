FROM oven/bun:1.4.4 AS builder

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/agent-analytics/package.json ./apps/agent-analytics/
COPY apps/easel/package.json ./apps/easel/
COPY apps/modggl/package.json ./apps/modggl/
COPY apps/notion-toggl-bridge/package.json ./apps/notion-toggl-bridge/
COPY automations/tasker/package.json ./automations/tasker/
COPY infra/modggl/package.json ./infra/modggl/
COPY packages/configs/commitlint/package.json ./packages/configs/commitlint/
COPY packages/configs/eslint/package.json ./packages/configs/eslint/
COPY packages/configs/typescript/package.json ./packages/configs/typescript/
COPY packages/configs/vitest/package.json ./packages/configs/vitest/
COPY packages/libs/json-canvas-spec/package.json ./packages/libs/json-canvas-spec/
COPY packages/libs/time-interval/package.json ./packages/libs/time-interval/
COPY packages/libs/toggl-2-sdk/package.json ./packages/libs/toggl-2-sdk/
COPY packages/libs/toggl-sdk/package.json ./packages/libs/toggl-sdk/
COPY packages/libs/util/package.json ./packages/libs/util/
COPY packages/plugins/claude/package.json ./packages/plugins/claude/

RUN bun install --frozen-lockfile

COPY . .

RUN bun run --filter "@devstone/libs-*" build
RUN bun run --filter "@devstone/modggl" build:bun

FROM oven/bun:1.4.4-alpine AS runner

WORKDIR /app

COPY --from=builder --chown=bun:bun /usr/src/app/apps/modggl/dist/bun/modggl.js ./modggl.js

USER bun

ENTRYPOINT ["bun", "run", "/app/modggl.js"]

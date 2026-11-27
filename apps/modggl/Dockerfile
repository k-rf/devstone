FROM oven/bun:latest AS builder

WORKDIR /usr/src/app

COPY . .

RUN bun install --frozen-lockfile
RUN bun run --filter "@devstone/libs-*" build
RUN bun run --filter "@devstone/modggl" build:bun

FROM oven/bun:alpine AS runner

WORKDIR /app

COPY --from=builder /usr/src/app/apps/modggl/dist/bun/modggl.js ./modggl.js

ENTRYPOINT ["bun", "run", "/app/modggl.js"]

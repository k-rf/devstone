FROM oven/bun:latest AS builder

WORKDIR /usr/src/app

COPY . .

RUN bun install --frozen-lockfile
RUN bun run --filter "@devstone/libs-*" build
RUN bun run --filter "@devstone/easel" build:bun

FROM oven/bun:alpine AS runner

WORKDIR /app

COPY --from=builder /usr/src/app/apps/easel/dist/bun/easel.js ./easel.js

ENTRYPOINT ["bun", "run", "easel.js"]

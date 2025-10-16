# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY ../../ ./
RUN pnpm install --no-frozen-lockfile
RUN pnpm turbo run build --filter=@neuro-engine/api

FROM node:20-alpine AS runner
WORKDIR /app
RUN corepack enable
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
RUN pnpm install --prod --no-frozen-lockfile
EXPOSE 4000
CMD ["node", "dist/index.js"]

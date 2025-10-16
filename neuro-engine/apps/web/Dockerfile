# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY ../../ ./
RUN pnpm install --no-frozen-lockfile
RUN pnpm turbo run build --filter=@neuro-engine/web

FROM node:20-alpine AS runner
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/apps/web/public ./public
RUN pnpm install --prod --no-frozen-lockfile
EXPOSE 3000
CMD ["pnpm", "start"]

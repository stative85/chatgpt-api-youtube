# @neuro-engine/db

Prisma-backed persistence layer pre-configured for Neuro-Engine BuilderOps flows. Models capture
creative sessions, long-term AI memory, and collaborative projects tuned for websim.ai deployment
pipelines.

## Models

- `User` — identity + notification preferences.
- `Session` — captures conversational context between creators and the AI engine.
- `Memory` — durable recall nodes for the intelligence layer.
- `Project` — higher-level containers for shipping playable artifacts.

## Commands

```bash
pnpm --filter @neuro-engine/db prisma:generate
pnpm --filter @neuro-engine/db prisma:push
```

Point `DATABASE_URL` to a Postgres instance (Supabase works great) before pushing schema changes.

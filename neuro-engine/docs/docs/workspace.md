---
sidebar_position: 2
---

# Workspace Layout

```text
neuro-engine/
├─ apps/
│  ├─ web/       # Next.js experience layer
│  └─ api/       # Fastify GraphQL gateway
├─ packages/
│  ├─ ai/        # Provider-agnostic adapters + memory graph
│  ├─ db/        # Prisma ORM + persistence models
│  ├─ logger/    # Pino logger + Sentry helpers
│  ├─ promptforge/ # Blueprint library for creative prompts
│  └─ cli/       # neuro command wrapper
├─ docs/         # This handbook
└─ turbo.json    # Turborepo pipelines
```

Each package is published as a PNPM workspace module so you can import it from apps without manual
path juggling.

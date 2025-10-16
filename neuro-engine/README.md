# Neuro-Engine

[![CI](https://img.shields.io/github/actions/workflow/status/websim-ai/neuro-engine/ci.yml?label=CI)](./.github/workflows/ci.yml)
[![Deploy](https://img.shields.io/github/actions/workflow/status/websim-ai/neuro-engine/deploy.yml?label=Deploy&logo=vercel)](./.github/workflows/deploy.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Adaptive creative studio for neurodivergent builders, tuned for websim.ai experiments.

## Monorepo Layout

- `apps/web` — Next.js 15 experience layer with Tailwind 4.
- `apps/api` — Fastify GraphQL gateway backed by PromptForge insights.
- `packages/ai` — Intelligence toolkit with LLM adapters, memory graph, and extensions.
- `packages/db` — Prisma schema for users, sessions, memories, and projects.
- `packages/logger` — Pino logger + Sentry helpers for Node and browser runtimes.
- `packages/promptforge` — Reusable creative prompt blueprints.
- `packages/cli` — `neuro` command for dev/test/deploy/seed flows.
- `docs` — Docusaurus handbook documenting BuilderOps rituals.

## Local Development

```bash
pnpm install
pnpm dev
```

The Turborepo dev pipeline runs both the Next.js app (port 3000) and Fastify API (port 4000).

To launch the docs portal:

```bash
pnpm --filter @neuro-engine/docs start
```

## Quality Gates

- `pnpm lint` — Lint everything via Turborepo.
- `pnpm test` — Run Vitest suites across packages and apps.
- `pnpm test:e2e` — Execute Playwright smoke tests against the web app.
- Husky + lint-staged enforce linting before commits.

## Deployment

```bash
bash deploy.sh
```

The script bootstraps a GitHub repo, installs dependencies, runs a build, and pushes `main` which in
turn triggers:

1. **CI Workflow** — caches PNPM/Turbo, runs lint → test → build.
2. **Deploy Workflow** — prunes via Turbo, revalidates lint/test, then deploys to Vercel.

Provide Vercel + Sentry credentials in `.env`/GitHub secrets to light up observability.

## Docker & Compose

```bash
docker compose up --build
```

Produces separate containers for the API and web app, ideal for local integration testing or
websim.ai sandbox deployments.

## Intelligence Layer

The combination of `@neuro-engine/ai` + `@neuro-engine/promptforge` powers modular creativity:

- Adapter wrappers for OpenAI/Anthropic.
- Context manager with in-memory, SQLite, and Redis backends.
- Memory graph linking prompts, sessions, and signals.
- Extension registry for image/audio/plugin experiments.

See the [docs](./docs/docs/intro.md) for advanced BuilderOps workflows.

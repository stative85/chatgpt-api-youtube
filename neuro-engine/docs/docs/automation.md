---
sidebar_position: 3
---

# Automation Recipes

- `pnpm lint` / `pnpm test` — executed by CI on every push.
- `turbo prune` — executed within deploy workflow for minimal artifact uploads.
- `neuro deploy` — CLI helper invoking the GitHub deploy workflow.
- Husky pre-commit — runs lint-staged on staged files before every commit.

See `.github/workflows` and `packages/cli` for implementation details.

# @neuro-engine/cli

Task runner that wraps common Turborepo scripts in a single `neuro` command. Optimised for
websim.ai BuilderOps rituals — from rapid local dev to seeding creative sandboxes.

## Commands

```bash
neuro dev    # runs turbo dev targets for web and api
neuro test   # executes pnpm test across the workspace
neuro deploy # triggers the deploy GitHub Action workflow via gh api
neuro seed   # seeds the database with starter prompts and personas
```

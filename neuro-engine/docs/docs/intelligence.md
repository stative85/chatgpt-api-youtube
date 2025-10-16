---
sidebar_position: 4
---

# Intelligence Layer

The intelligence stack lives in `packages/ai` and `packages/promptforge`.

## Components

- **Adapters** — wrappers for OpenAI + Anthropic with guardrails.
- **Context Manager** — pluggable memory buffers supporting in-memory, SQLite, or Redis backends.
- **Memory Graph** — lightweight relationship tracker to surface contextual inspiration.
- **PromptForge** — shareable templates for rituals, lab notes, and BuilderOps updates.

Integrate them inside Fastify resolvers or Next.js components to generate dynamic experiences tuned
for websim.ai deployments.

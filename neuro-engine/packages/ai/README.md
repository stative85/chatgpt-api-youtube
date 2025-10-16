# @neuro-engine/ai

Intelligence toolkit tailored for websim.ai-driven creative experiments. The package exposes
adapter-friendly LLM clients, memory management utilities, and prompt-forging helpers that can be
shared across the Neuro-Engine stack.

## Features

- Provider-agnostic adapters for OpenAI and Anthropic APIs.
- Context managers with pluggable memory buffers (in-memory, SQLite, Redis).
- PromptForge primitives for composing dynamic, multi-part prompts.
- Creative extensions and a lightweight memory graph for relational recall.

## Usage

```ts
import { OpenAIAdapter, ContextManager } from '@neuro-engine/ai';

const ai = new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY! });
const context = new ContextManager();

await context.append({ role: 'user', content: 'Design a sensory lab for websim.ai' });
const completion = await ai.complete({
  system: 'You are a speculative design assistant',
  messages: context.history
});
```

Each adapter accepts override hooks so you can extend the default behaviour for custom
telemetry or tracing pipelines.

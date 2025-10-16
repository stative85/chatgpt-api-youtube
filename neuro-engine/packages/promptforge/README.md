# @neuro-engine/promptforge

Reusable prompt blueprints curated for the Neuro-Engine creative stack. Designed to integrate with
the `@neuro-engine/ai` package as well as external tooling inside websim.ai sandboxes.

## Example

```ts
import { createPrompt } from '@neuro-engine/promptforge';

const prompt = createPrompt('brainstorm:ritual').compile({
  modality: 'synesthetic sound garden',
  tone: 'playful'
});
```

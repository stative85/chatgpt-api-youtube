import { describe, expect, it } from 'vitest';

import { createPrompt, defaultBlueprints } from './blueprints.js';

describe('promptforge', () => {
  it('compiles template with schema validation', () => {
    const prompt = createPrompt('demo', {
      title: 'Demo',
      description: 'Demo',
      schema: defaultBlueprints[0].schema,
      template: 'Hello {{modality}}'
    });

    const compiled = prompt.compile({ modality: 'sound garden', tone: 'playful' });
    expect(compiled).toBe('Hello sound garden');
  });
});

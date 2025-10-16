import { describe, expect, it } from 'vitest';

import { PromptForge, defaultPrompts } from './templates.js';

describe('PromptForge', () => {
  it('registers defaults and performs substitution', () => {
    const forge = new PromptForge();
    defaultPrompts.forEach((blueprint) => forge.register(blueprint));

    const segments = forge.build('websim:experience-designer', {
      theme: 'neuro-inclusive collaboration',
      modalities: 'haptics, bioluminescent visuals'
    });

    expect(segments).toHaveLength(2);
    expect(segments[1].content).toContain('neuro-inclusive collaboration');
    expect(segments[1].content).toContain('bioluminescent visuals');
  });
});

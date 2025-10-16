import { describe, expect, it } from 'vitest';

import '../package.json';

describe('CLI metadata', () => {
  it('exposes binary entry', async () => {
    const pkg = await import('../package.json', { with: { type: 'json' } });
    expect(pkg.default.bin.neuro).toBeDefined();
  });
});

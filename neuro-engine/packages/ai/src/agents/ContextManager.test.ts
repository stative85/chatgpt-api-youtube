import { describe, expect, it } from 'vitest';

import { ContextManager } from './ContextManager.js';

describe('ContextManager', () => {
  it('stores and returns message history', async () => {
    const context = new ContextManager();
    await context.append({ role: 'user', content: 'Hello websim', metadata: { mood: 'curious' } });
    const history = await context.history;

    expect(history).toHaveLength(1);
    expect(history[0].content).toBe('Hello websim');
  });
});

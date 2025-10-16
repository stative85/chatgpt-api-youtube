import { describe, expect, it } from 'vitest';

import { createLogger } from './index.js';

describe('logger', () => {
  it('creates a logger with defaults', () => {
    const logger = createLogger();
    expect(logger).toBeDefined();
    expect(logger.level).toBeTypeOf('string');
  });
});

import { describe, expect, it } from 'vitest';

import { prisma } from './index.js';

describe('prisma client', () => {
  it('exposes model delegates', () => {
    expect(prisma).toHaveProperty('user');
    expect(prisma).toHaveProperty('session');
  });
});

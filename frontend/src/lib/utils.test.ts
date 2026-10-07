import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins conditional classes and lets later Tailwind classes win', () => {
    const hidden = false;
    expect(cn('p-2', hidden && 'hidden', 'p-4', ['text-sm'])).toBe('p-4 text-sm');
  });
});

import { describe, expect, it } from 'vitest';
import { slideDescription, slidePageCount } from './slides';
import type { Slide } from './types';

function slide(overrides: Partial<Slide>): Slide {
  return {
    id: 1,
    service_id: 1,
    position: 1,
    slide_type: 'welcome',
    psalm_number: null,
    psalm_version: null,
    verse_start: null,
    verse_end: null,
    scripture_reference: null,
    content_data: null,
    ...overrides,
  };
}

describe('slideDescription', () => {
  it('names fixed slides', () => {
    expect(slideDescription(slide({ slide_type: 'welcome' }))).toBe('Welcome');
    expect(slideDescription(slide({ slide_type: 'private_prayer' }))).toBe('Private Prayer');
  });

  it('includes the verse range for a psalm portion', () => {
    const s = slide({ slide_type: 'psalm', psalm_number: 23, verse_start: 1, verse_end: 3, psalm_version: 'first' });
    expect(slideDescription(s)).toBe('Psalm 23:1-3');
  });

  it('marks the second metrical version', () => {
    const s = slide({ slide_type: 'psalm', psalm_number: 6, psalm_version: 'second' });
    expect(slideDescription(s)).toBe('Psalm 6 (2nd)');
  });

  it('treats a missing version as the first, like the backend', () => {
    expect(slideDescription(slide({ slide_type: 'psalm', psalm_number: 100 }))).toBe('Psalm 100');
  });

  it('prefixes key verses', () => {
    const s = slide({ slide_type: 'key_verse', scripture_reference: 'Titus 2:1' });
    expect(slideDescription(s)).toBe('Key Verse: Titus 2:1');
  });
});

describe('slidePageCount', () => {
  it('is 1 for slides without fetched content', () => {
    expect(slidePageCount(slide({ slide_type: 'blank' }))).toBe(1);
  });

  it('counts psalm stanzas and scripture pages', () => {
    expect(slidePageCount(slide({ slide_type: 'psalm', content_data: { stanzas: [{}, {}, {}] } }))).toBe(3);
    expect(slidePageCount(slide({ slide_type: 'scripture', content_data: { pages: [{}, {}] } }))).toBe(2);
  });
});

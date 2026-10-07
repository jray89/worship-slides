import type { RenderedPage } from '@/lib/types';

// One rendered page of every slide type, as returned by preview_data.
export const allPages: RenderedPage[] = [
  { slide_type: 'welcome', content: {} },
  { slide_type: 'psalm', content: { reference: 'Psalm 23:1-3', stanza: { lines: ['The Lord’s my shepherd', 'He makes me down to lie'], verse_numbers: { '0': 1 } } } },
  { slide_type: 'scripture', content: { reference: 'John 3:16', text: ['For God so loved', 'the world'] } },
  { slide_type: 'key_verse', content: { reference: 'Titus 2:1', text: 'But speak thou the things' } },
  { slide_type: 'private_prayer', content: {} },
  { slide_type: 'blank', content: {} },
  { slide_type: 'closing', content: {} },
];

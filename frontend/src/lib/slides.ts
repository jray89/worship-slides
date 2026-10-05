import type { Slide } from './types';

// Label shown for a slide in the editor list.
export function slideDescription(slide: Slide): string {
  switch (slide.slide_type) {
    case 'welcome':
      return 'Welcome';
    case 'closing':
      return 'Closing';
    case 'blank':
      return 'Blank';
    case 'psalm': {
      const ref = slide.verse_start
        ? `${slide.psalm_number}:${slide.verse_start}-${slide.verse_end}`
        : `${slide.psalm_number}`;
      // The backend treats a missing version as "first".
      const versionName = slide.psalm_version === 'second' ? ' (2nd)' : '';
      return `Psalm ${ref}${versionName}`;
    }
    case 'private_prayer':
      return 'Private Prayer';
    case 'scripture':
      return `${slide.scripture_reference}`;
    case 'key_verse':
      return `Key Verse: ${slide.scripture_reference}`;
    default:
      return slide.slide_type;
  }
}

// Number of rendered pages a slide produces.
export function slidePageCount(slide: Slide): number {
  if (!slide.content_data) return 1;
  if (slide.slide_type === 'psalm')
    return slide.content_data.stanzas?.length || 0;
  if (slide.slide_type === 'scripture')
    return slide.content_data.pages?.length || 0;
  return 1;
}

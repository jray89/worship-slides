// Shapes returned by the Rails API (see backend/app/controllers/api and
// backend/app/services/slide_renderer.rb).

export interface Service {
  id: number;
  service_date: string;
  label: string | null;
  sermon_title: string | null;
  sermon_reference: string | null;
}

export type SlideType =
  | 'welcome'
  | 'closing'
  | 'private_prayer'
  | 'blank'
  | 'psalm'
  | 'scripture'
  | 'key_verse';

export interface Slide {
  id: number;
  service_id: number;
  position: number;
  slide_type: SlideType;
  psalm_number: number | null;
  psalm_version: string | null;
  verse_start: number | null;
  verse_end: number | null;
  scripture_reference: string | null;
  content_data: { stanzas?: unknown[]; pages?: unknown[] } | null;
}

export interface Stanza {
  lines: string[];
  // line_index (as string key) => verse_number
  verse_numbers: Record<string, number>;
}

// One rendered 1920x1080 page from GET /services/:id/preview_data.
export type RenderedPage =
  | { slide_type: 'welcome' | 'closing' | 'private_prayer' | 'blank'; content: Record<string, never> }
  | { slide_type: 'psalm'; content: { reference: string; stanza: Stanza } }
  | { slide_type: 'scripture'; content: { reference: string; text: string[] } }
  | { slide_type: 'key_verse'; content: { reference: string; text: string } };

// Data the backend embeds as window.__PRINT_DATA__ for headless-Chrome export
// (see Api::ServicesController#print_html): rendered pages for the slides PDF,
// or the sermon title/reference for the title card PNG.
export interface PrintData {
  pages?: RenderedPage[];
  sermon_title?: string | null;
  sermon_reference?: string | null;
}

declare global {
  interface Window {
    __PRINT_DATA__?: PrintData;
  }
}

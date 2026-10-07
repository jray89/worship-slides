import React, { useState } from 'react';
import { useFitScale } from '@/hooks/useFitScale';
import WelcomeSlide from './slides/WelcomeSlide';
import PsalmSlide from './slides/PsalmSlide';
import ScriptureSlide from './slides/ScriptureSlide';
import KeyVerseSlide from './slides/KeyVerseSlide';
import ClosingSlide from './slides/ClosingSlide';
import PrivatePrayerSlide from './slides/PrivatePrayerSlide';
import BlankSlide from './slides/BlankSlide';
import { Button } from '@/components/ui/button';
import type { RenderedPage } from '@/lib/types';

export default function SlideCarousel({ pages }: { pages: RenderedPage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Design width for slides (adjust as needed)
  const DESIGN_WIDTH = 1920;
  const DESIGN_HEIGHT = 1080; // 16:9

  const [containerRef, scale] = useFitScale<HTMLDivElement>(DESIGN_WIDTH);

  if (pages.length === 0)
    return <p className='text-muted-foreground'>No slides to preview.</p>;

  const page = pages[currentIndex];

  function renderPage(p: RenderedPage) {
    switch (p.slide_type) {
      case 'welcome':
        return <WelcomeSlide />;
      case 'closing':
        return <ClosingSlide />;
      case 'private_prayer':
        return <PrivatePrayerSlide />;
      case 'blank':
        return <BlankSlide />;
      case 'psalm':
        return (
          <PsalmSlide
            reference={p.content.reference}
            stanza={p.content.stanza}
          />
        );
      case 'scripture':
        return (
          <ScriptureSlide
            reference={p.content.reference}
            text={p.content.text}
          />
        );
      case 'key_verse':
        return (
          <KeyVerseSlide
            reference={p.content.reference}
            text={p.content.text}
          />
        );
      default:
        return <div>Unknown: {(p as { slide_type: string }).slide_type}</div>;
    }
  }

  return (
    <div className='text-center'>
      <div className='flex justify-center items-center gap-5 mb-5'>
        <Button
          variant='outline'
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          &larr; Prev
        </Button>
        <span className='text-sm text-muted-foreground'>
          Slide {currentIndex + 1} of {pages.length}
        </span>
        <Button
          variant='outline'
          onClick={() =>
            setCurrentIndex(Math.min(pages.length - 1, currentIndex + 1))
          }
          disabled={currentIndex === pages.length - 1}
        >
          Next &rarr;
        </Button>
      </div>
      {/* Responsive aspect-ratio container for scaling slides */}
      <div
        ref={containerRef}
        className='relative w-full max-w-3xl mx-auto'
        style={{ aspectRatio: '16 / 9' }}
      >
        <div
          className='absolute inset-0 flex items-center justify-center overflow-hidden'
          style={{ width: '100%', height: '100%' }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: DESIGN_WIDTH,
                height: DESIGN_HEIGHT,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              {renderPage(page)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

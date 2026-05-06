import React, { useState } from 'react';
import WelcomeSlide from './slides/WelcomeSlide';
import PsalmSlide from './slides/PsalmSlide';
import ScriptureSlide from './slides/ScriptureSlide';
import KeyVerseSlide from './slides/KeyVerseSlide';
import ClosingSlide from './slides/ClosingSlide';

interface RenderedPage {
  slide_type: string;
  content: any;
}

export default function SlideCarousel({ pages }: { pages: RenderedPage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (pages.length === 0)
    return <p className='text-gray-500'>No slides to preview.</p>;

  const page = pages[currentIndex];

  function renderPage(p: RenderedPage) {
    switch (p.slide_type) {
      case 'welcome':
        return <WelcomeSlide />;
      case 'closing':
        return <ClosingSlide />;
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
        return <div>Unknown: {p.slide_type}</div>;
    }
  }

  return (
    <div className='text-center'>
      <div className='flex justify-center items-center gap-5 mb-5'>
        <button
          className='px-4 py-2 bg-gray-200 text-gray-700 rounded'
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          &larr; Prev
        </button>
        <span className='text-sm'>
          Slide {currentIndex + 1} of {pages.length}
        </span>
        <button
          className='px-4 py-2 bg-gray-200 text-gray-700 rounded'
          onClick={() =>
            setCurrentIndex(Math.min(pages.length - 1, currentIndex + 1))
          }
          disabled={currentIndex === pages.length - 1}
        >
          Next &rarr;
        </button>
      </div>
      <div className='origin-top-center'>{renderPage(page)}</div>
    </div>
  );
}

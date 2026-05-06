import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import WelcomeSlide from './slides/WelcomeSlide';
import ClosingSlide from './slides/ClosingSlide';
import PsalmSlide from './slides/PsalmSlide';
import KeyVerseSlide from './slides/KeyVerseSlide';
import ScriptureSlide from './slides/ScriptureSlide';

interface RenderedPage {
  slide_type: string;
  content: any;
}

function renderPage(p: RenderedPage) {
  switch (p.slide_type) {
    case 'welcome':   return <WelcomeSlide />;
    case 'closing':   return <ClosingSlide />;
    case 'psalm':     return <PsalmSlide reference={p.content.reference} stanza={p.content.stanza} />;
    case 'scripture': return <ScriptureSlide reference={p.content.reference} text={p.content.text} />;
    case 'key_verse': return <KeyVerseSlide reference={p.content.reference} text={p.content.text} />;
    default:          return null;
  }
}

export default function PrintSlidesView() {
  const { id } = useParams<{ id: string }>();
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/services/${id}/preview_data`)
      .then((r) => r.json())
      .then((data) => {
        setPages(data.pages);
        setLoaded(true);
      });
  }, [id]);

  if (!loaded) return <div id='print-loading'>Loading...</div>;

  return (
    <>
      <style>{`
        @page { size: 1920px 1080px; margin: 0; }
        html, body { margin: 0; padding: 0; background: #0e0e0e; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}</style>
      <div id='print-ready'>
        {pages.map((page, i) => (
          <div
            key={i}
            style={{
              width: '1920px',
              height: '1080px',
              overflow: 'hidden',
              pageBreakAfter: i < pages.length - 1 ? 'always' : 'auto',
              breakAfter: i < pages.length - 1 ? 'page' : 'auto',
            }}
          >
            {renderPage(page)}
          </div>
        ))}
      </div>
    </>
  );
}

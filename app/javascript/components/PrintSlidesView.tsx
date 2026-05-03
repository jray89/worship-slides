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

type SlideGroup =
  | { type: 'scripture'; reference: string; text: string }
  | { type: 'other'; page: RenderedPage };

// Merge consecutive scripture slides with the same reference into one flowing block
function groupPages(pages: RenderedPage[]): SlideGroup[] {
  const groups: SlideGroup[] = [];
  let i = 0;
  while (i < pages.length) {
    const page = pages[i];
    if (page.slide_type === 'scripture') {
      const reference = page.content.reference;
      const texts: string[] = [page.content.text];
      let j = i + 1;
      while (
        j < pages.length &&
        pages[j].slide_type === 'scripture' &&
        pages[j].content.reference === reference
      ) {
        texts.push(pages[j].content.text);
        j++;
      }
      groups.push({ type: 'scripture', reference, text: texts.join(' ') });
      i = j;
    } else {
      groups.push({ type: 'other', page });
      i++;
    }
  }
  return groups;
}

function renderOtherPage(p: RenderedPage) {
  switch (p.slide_type) {
    case 'welcome':
      return <WelcomeSlide />;
    case 'closing':
      return <ClosingSlide />;
    case 'psalm':
      return (
        <PsalmSlide reference={p.content.reference} stanza={p.content.stanza} />
      );
    case 'key_verse':
      return (
        <KeyVerseSlide reference={p.content.reference} text={p.content.text} />
      );
    default:
      return null;
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

  const groups = groupPages(pages);

  return (
    <>
      <style>{`
        @page {
          size: 1920px 1080px;
          margin: 0;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: #0e0e0e;
        }
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>

      <div id='print-ready'>
        {groups.map((group, i) => {
          const isLast = i === groups.length - 1;
          const breakStyle: React.CSSProperties = {
            pageBreakAfter: isLast ? 'auto' : 'always',
            breakAfter: isLast ? 'auto' : 'page',
          };

          if (group.type === 'scripture') {
            return (
              <div key={i} style={breakStyle}>
                <ScriptureSlide
                  reference={group.reference}
                  text={group.text}
                  flowing
                />
              </div>
            );
          }

          return (
            <div
              key={i}
              style={{
                width: '1920px',
                height: '1080px',
                overflow: 'hidden',
                ...breakStyle,
              }}
            >
              {renderOtherPage(group.page)}
            </div>
          );
        })}
      </div>
    </>
  );
}

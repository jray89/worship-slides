import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import WelcomeSlide from './slides/WelcomeSlide';
import ClosingSlide from './slides/ClosingSlide';
import PsalmSlide from './slides/PsalmSlide';
import KeyVerseSlide from './slides/KeyVerseSlide';

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

function ScripturePrintBlock({
  reference,
  text,
}: {
  reference: string;
  text: string;
}) {
  return (
    <table
      style={{
        width: '1920px',
        borderCollapse: 'collapse',
        fontFamily: '"Times New Roman", serif',
      }}
    >
      <thead>
        <tr>
          <th
            style={{
              fontWeight: 'normal',
              padding: 0,
              textAlign: 'left',
              backgroundColor: '#000',
            }}
          >
            <div style={{ position: 'relative', padding: '30px 60px 10px' }}>
              <img
                src='/images/logo-white.png'
                alt='RPC'
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '20px',
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain',
                }}
              />
              <h1
                style={{
                  color: '#fff',
                  textAlign: 'center',
                  fontSize: '48px',
                  fontWeight: 'normal',
                  margin: 0,
                  paddingRight: '100px',
                }}
              >
                {reference}
              </h1>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: '#000',
              color: '#fff',
              padding: '10px 60px 40px',
              fontSize: '28px',
              lineHeight: '1.7',
              verticalAlign: 'top',
            }}
          >
            {text}
          </td>
        </tr>
      </tbody>
    </table>
  );
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
          size: 16in 9in;
          margin: 0;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: #000;
        }
        /* Force background colors to print */
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        /*
         * Scale 1920px-wide slides to fit 16in page.
         * 16in × 96dpi = 1536px → zoom = 1536/1920 = 0.8
         */
        @media print {
          .slide-print-scale {
            zoom: 0.8;
          }
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
              <div key={i} className='slide-print-scale' style={breakStyle}>
                <ScripturePrintBlock
                  reference={group.reference}
                  text={group.text}
                />
              </div>
            );
          }

          return (
            <div
              key={i}
              className='slide-print-scale'
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

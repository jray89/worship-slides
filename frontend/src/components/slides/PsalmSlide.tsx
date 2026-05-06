import SlideBase, { SlideLogoCorner } from './SlideBase';
import { SlideHeader } from '../ui/SlideHeader';

interface Stanza {
  lines: string[];
  // verse_numbers is a map: line_index (as string key) => verse_number
  verse_numbers: Record<string, number>;
}

interface PsalmSlideProps {
  reference: string; // e.g. "Psalm 71:15-19"
  stanza: Stanza;
}

export default function PsalmSlide({ reference, stanza }: PsalmSlideProps) {
  return (
    <SlideBase className='psalm-slide'>
      <SlideLogoCorner />

      <SlideHeader>{reference}</SlideHeader>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          marginTop: '40px',
          gap: '44pt',
          position: 'absolute',
          inset: '75px',
        }}
      >
        {stanza.lines.map((line, i) => {
          const verseNum = stanza.verse_numbers[String(i)];
          return (
            <p
              key={i}
              style={{
                fontFamily: 'arial, sans-serif',
                fontSize: '44pt',
                lineHeight: '1',
                margin: '0',
                textAlign: 'center',
              }}
            >
              {verseNum != null && (
                <sup
                  style={{
                    marginRight: '10px',
                    fontSize: '24pt',
                    verticalAlign: 'middle',
                  }}
                >
                  {verseNum}
                </sup>
              )}
              {line}
            </p>
          );
        })}
      </div>
    </SlideBase>
  );
}

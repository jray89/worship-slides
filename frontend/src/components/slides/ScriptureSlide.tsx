import SlideBase, { SlideLogoCorner } from './SlideBase';
import { SlideHeader } from '../ui/SlideHeader';

const FONT = 'Inter, sans-serif';

interface ScriptureSlideProps {
  reference: string;
  text: string | string[];
}

export default function ScriptureSlide({
  reference,
  text,
}: ScriptureSlideProps) {
  const lines = Array.isArray(text) ? text : [text];

  return (
    <SlideBase className='scripture-slide'>
      <SlideLogoCorner />
      <SlideHeader>{reference}</SlideHeader>
      <div
        style={{
          padding: '0 100px 80px 200px',
          fontSize: '34pt',
          lineHeight: '1.7',
          textAlign: 'left',
          fontFamily: FONT,
          fontWeight: '300',
        }}
      >
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </div>
    </SlideBase>
  );
}

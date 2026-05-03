import React from 'react';
import SlideBase, { SlideLogoCorner } from './SlideBase';
import { SlideHeader } from '../ui/SlideHeader';

interface ScriptureSlideProps {
  reference: string; // e.g. "Titus 2"
  text: string; // paginated text for this slide
}

export default function ScriptureSlide({
  reference,
  text,
}: ScriptureSlideProps) {
  return (
    <SlideBase className='scripture-slide'>
      <SlideLogoCorner />

      <SlideHeader>{reference}</SlideHeader>

      {/* Scripture text */}
      <div
        style={{
          padding: '10px 60px 40px',
          fontSize: '28px',
          lineHeight: '1.7',
          textAlign: 'left',
        }}
      >
        {text}
      </div>
    </SlideBase>
  );
}

import React from 'react';
import SlideBase, { SlideLogoCorner } from './SlideBase';
import { SlideHeader } from '../ui/SlideHeader';

interface KeyVerseSlideProps {
  reference: string; // e.g. "Titus 2:1"
  text: string;
}

export default function KeyVerseSlide({ reference, text }: KeyVerseSlideProps) {
  return (
    <SlideBase className='key-verse-slide'>
      <SlideLogoCorner />

      <SlideHeader>{reference}</SlideHeader>

      {/* Verse text */}
      <div
        style={{
          padding: '20px 80px',
          fontSize: '30px',
          lineHeight: '1.7',
          textAlign: 'left',
        }}
      >
        {text}
      </div>
    </SlideBase>
  );
}

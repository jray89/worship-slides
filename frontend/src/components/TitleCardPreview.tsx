import React, { useRef, useState, useEffect } from 'react';
import TitleCard from './slides/TitleCard';

export default function TitleCardPreview({ service }: { service: { sermon_title: string; sermon_reference: string } }) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const DESIGN_WIDTH = 1920;
  const DESIGN_HEIGHT = 1080; // 16:9

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setScale(width / DESIGN_WIDTH);
      }
    }
    requestAnimationFrame(handleResize);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!service.sermon_title) {
    return <p className="text-muted-foreground mt-6">Set a sermon title to preview the title card.</p>;
  }

  return (
    <div className="mt-6 text-center">
      <h3 className="text-lg font-semibold mb-3">Title Card</h3>
      <div
        ref={containerRef}
        className="inline-block border border-dashed border-border relative w-full max-w-2xl"
        style={{ aspectRatio: '16 / 9' }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ width: '100%', height: '100%' }}
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
            <TitleCard sermonTitle={service.sermon_title} sermonReference={service.sermon_reference} />
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

interface TitleCardProps {
  sermonTitle: string;
  sermonReference: string;
}

export default function TitleCard({
  sermonTitle,
  sermonReference,
}: TitleCardProps) {
  return (
    <div
      className='title-card'
      style={{
        width: '1920px',
        height: '1080px',
        position: 'relative',
        fontFamily: '"Times New Roman", serif',
        backgroundColor: 'transparent',
      }}
    >
      {/* Bottom gradient bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '120px',
          background:
            'linear-gradient(to right, #000 0%, #000 40%, #666 70%, #fff 100%)',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '140px',
        }}
      >
        <div>
          <p
            style={{
              color: '#fff',
              fontSize: '40px',
              margin: '0',
              lineHeight: '1.3',
            }}
          >
            {sermonTitle}
          </p>
          <p
            style={{
              color: '#ccc',
              fontSize: '28px',
              margin: '0',
              lineHeight: '1.3',
            }}
          >
            {sermonReference}
          </p>
        </div>
      </div>

      {/* RPC logo on the left, overlapping the bar */}
      <img
        src='/images/rpc-logo.png'
        alt='RPC'
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '20px',
          width: '130px',
          height: '130px',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}

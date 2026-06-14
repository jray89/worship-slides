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
        fontFamily: '"EB Garamond", serif',
        backgroundColor: 'transparent',
      }}
    >
      {/* Bottom gradient bar */}
      <div
        style={{
          position: 'absolute',
          inset: 'auto 120px 65px',
          height: '150px',
          background:
            'linear-gradient(to right, rgb(0, 0, 0) 0%, transparent 100%)',
          display: 'flex',
          alignItems: 'center',
          textAlign: 'left',
          paddingLeft: '150px',
        }}
      >
        <div>
          <p
            style={{
              color: '#fff',
              fontSize: '40pt',
              margin: '0',
              lineHeight: '1.3',
            }}
          >
            {sermonTitle}
          </p>
          <p
            style={{
              color: '#d9d9d9',
              fontSize: '34pt',
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
        src='/images/logo-white.png'
        alt='RPC'
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '40px',
          width: '200px',
          height: '200px',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}

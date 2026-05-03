import React from 'react';

interface SlideBaseProps {
  children: React.ReactNode;
  className?: string;
}

export default function SlideBase({
  children,
  className = '',
}: SlideBaseProps) {
  return (
    <div
      className={`slide ${className}`}
      style={{
        width: '1920px',
        height: '1080px',
        backgroundColor: '#0e0e0e',
        color: '#fff',
        fontFamily: '"Times New Roman", serif',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
}

export function SlideLogoCorner() {
  return (
    <img
      src='/images/logo-white.png'
      alt='RPC'
      style={{
        position: 'absolute',
        top: '50px',
        right: '50px',
        width: '100px',
        height: '100px',
        objectFit: 'contain',
      }}
    />
  );
}

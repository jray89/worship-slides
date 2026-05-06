import SlideBase from './SlideBase';

type LogoSlideProps = {
  includeAddress?: boolean;
  prepend?: string | React.ReactNode;
  append?: string | React.ReactNode;
};

export default function LogoSlide({
  includeAddress = true,
  prepend,
  append,
}: LogoSlideProps) {
  return (
    <SlideBase className='welcome-slide'>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
          gap: '75px',
        }}
      >
        {prepend && (
          <p
            style={{
              fontSize: '40pt',
            }}
          >
            {prepend}
          </p>
        )}

        <img
          src='/images/logo-white.png'
          alt='Reformation Presbyterian Church'
          style={{
            width: '450px',
            height: '450px',
            objectFit: 'contain',
          }}
        />

        {append && (
          <p
            style={{
              fontSize: '40pt',
              color: '#d9d9d9',
            }}
          >
            {append}
          </p>
        )}

        {includeAddress && (
          <div style={{ fontSize: '40pt', lineHeight: '1.2' }}>
            <p style={{ margin: '4px 0' }}>
              Sunday 2pm &amp; 5pm | Wednesday 7pm
            </p>
            <p style={{ margin: '4px 0' }}>
              4182 S Cobb Dr SE, Smyrna, GA 30080
            </p>
            <p style={{ margin: '4px 0' }}>reformationpresbyterianchurch.org</p>
          </div>
        )}
      </div>
    </SlideBase>
  );
}

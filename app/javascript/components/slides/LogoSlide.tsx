import SlideBase from './SlideBase';

type LogoSlideProps = {
  subtitle?: string;
};

export default function LogoSlide({ subtitle }: LogoSlideProps) {
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
        }}
      >
        {subtitle && (
          <p
            style={{
              fontSize: '40pt',
              marginBottom: '75px',
            }}
          >
            {subtitle}
          </p>
        )}

        <img
          src='/images/logo-white.png'
          alt='Reformation Presbyterian Church'
          style={{
            width: '450px',
            height: '450px',
            objectFit: 'contain',
            marginBottom: '75px',
          }}
        />

        <div style={{ fontSize: '40pt', lineHeight: '1.2' }}>
          <p style={{ margin: '4px 0' }}>
            Sunday 2pm &amp; 5pm | Wednesday 7pm
          </p>
          <p style={{ margin: '4px 0' }}>4182 S Cobb Dr SE, Smyrna, GA 30080</p>
          <p style={{ margin: '4px 0' }}>reformationpresbyterianchurch.org</p>
        </div>
      </div>
    </SlideBase>
  );
}

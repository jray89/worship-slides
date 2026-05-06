import LogoSlide from './LogoSlide';

export default function PrivatePrayerSlide() {
  return (
    <LogoSlide
      append={
        <>
          <p>Private prayer is in progress.</p>
          <p>The broadcast will resume shortly.</p>
        </>
      }
      includeAddress={false}
    />
  );
}

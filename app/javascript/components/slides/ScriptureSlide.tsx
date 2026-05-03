import SlideBase, { SlideLogoCorner } from './SlideBase';
import { SlideHeader } from '../ui/SlideHeader';

// Shared style constants — single source of truth
const BG = '#0e0e0e';
const TEXT_COLOR = '#fff';
const FONT = '"Times New Roman", serif';
const HEADER_COLOR = '#d9d9d9';
const LOGO_SIZE = '200px';

interface ScriptureSlideProps {
  reference: string;
  text: string;
  /** flowing=true: overflows naturally across print pages with repeating header */
  flowing?: boolean;
}

export default function ScriptureSlide({ reference, text, flowing }: ScriptureSlideProps) {
  if (flowing) {
    return (
      <table
        style={{
          width: '1920px',
          borderCollapse: 'collapse',
          fontFamily: FONT,
          backgroundColor: BG,
          color: TEXT_COLOR,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                fontWeight: 'normal',
                padding: 0,
                textAlign: 'left',
                backgroundColor: BG,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  paddingTop: '75px',
                  paddingBottom: '25px',
                  height: '200px',
                  boxSizing: 'border-box',
                }}
              >
                <img
                  src='/images/logo-white.png'
                  alt='RPC'
                  style={{
                    position: 'absolute',
                    top: '75px',
                    right: '75px',
                    width: LOGO_SIZE,
                    height: LOGO_SIZE,
                    objectFit: 'contain',
                  }}
                />
                <h1
                  style={{
                    color: HEADER_COLOR,
                    textAlign: 'center',
                    fontSize: '72pt',
                    fontWeight: 'normal',
                    margin: 0,
                    paddingRight: '275px', // clear logo
                  }}
                >
                  {reference}
                </h1>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              style={{
                backgroundColor: BG,
                color: TEXT_COLOR,
                padding: '0 200px 80px',
                fontSize: '36pt',
                lineHeight: '1.7',
                verticalAlign: 'top',
                fontFamily: FONT,
              }}
            >
              {text}
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <SlideBase className='scripture-slide'>
      <SlideLogoCorner />
      <SlideHeader>{reference}</SlideHeader>
      <div
        style={{
          padding: '0 200px 80px',
          fontSize: '36pt',
          lineHeight: '1.7',
          textAlign: 'left',
        }}
      >
        {text}
      </div>
    </SlideBase>
  );
}

import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#04080F',
          borderRadius: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Crossbar */}
          <div
            style={{
              width: '124px',
              height: '28px',
              background: 'linear-gradient(180deg, #00E4BF 0%, #00C9A7 100%)',
              borderRadius: '3px 3px 0 0',
              display: 'flex',
            }}
          />
          {/* Stem */}
          <div
            style={{
              width: '40px',
              height: '82px',
              background: 'linear-gradient(180deg, #00C9A7 0%, #00C9A7 100%)',
              borderRadius: '0 0 3px 3px',
              display: 'flex',
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}

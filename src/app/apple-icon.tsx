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
          background: 'linear-gradient(135deg, #04080F 0%, #07101E 100%)',
          borderRadius: '36px',
        }}
      >
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #00C9A7, #00E4BF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: '80px',
              fontWeight: 700,
              color: '#04080F',
              fontFamily: 'serif',
              lineHeight: 1,
            }}
          >
            T
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}

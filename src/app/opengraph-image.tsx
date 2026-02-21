import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Terrain — Market Opportunity Intelligence for Life Sciences';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#04080F',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage:
              'linear-gradient(rgba(0,201,167,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,201,167,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(0,201,167,0.15), transparent 70%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            position: 'relative',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
            }}
          >
            {/* T icon */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00C9A7, #00E4BF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#04080F',
                fontSize: '28px',
                fontWeight: 700,
                fontFamily: 'serif',
              }}
            >
              T
            </div>
            <span
              style={{
                fontSize: '36px',
                fontWeight: 600,
                color: '#F0F4F8',
                fontFamily: 'serif',
                letterSpacing: '-0.02em',
              }}
            >
              Terrain
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 600,
              color: '#F0F4F8',
              textAlign: 'center',
              lineHeight: 1.15,
              fontFamily: 'serif',
              maxWidth: '900px',
            }}
          >
            Market Opportunity Intelligence
          </div>

          {/* Subheadline */}
          <div
            style={{
              fontSize: '22px',
              color: '#94A3B8',
              textAlign: 'center',
              maxWidth: '700px',
              lineHeight: 1.5,
            }}
          >
            TAM analysis, competitive landscapes, and partner matching for life sciences professionals.
          </div>

          {/* Stats strip */}
          <div
            style={{
              display: 'flex',
              gap: '48px',
              marginTop: '24px',
              padding: '20px 40px',
              borderRadius: '12px',
              border: '1px solid rgba(0,201,167,0.2)',
              background: 'rgba(0,201,167,0.05)',
            }}
          >
            {[
              { val: '150+', label: 'Indications' },
              { val: '300+', label: 'Partners' },
              { val: '<30s', label: 'Time to Insight' },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '28px', fontWeight: 600, color: '#00C9A7', fontFamily: 'monospace' }}>
                  {s.val}
                </span>
                <span style={{ fontSize: '13px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer attribution */}
        <div
          style={{
            position: 'absolute',
            bottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '14px', color: '#64748B' }}>Built by</span>
          <span style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 500 }}>Ambrosia Ventures</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

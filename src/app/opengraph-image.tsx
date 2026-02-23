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
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage:
              'linear-gradient(rgba(0,201,167,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,201,167,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            display: 'flex',
          }}
        />

        {/* Top glow */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            left: '50%',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(0,201,167,0.12), transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '28px',
            position: 'relative',
          }}
        >
          {/* Logo mark + wordmark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '4px',
            }}
          >
            {/* T icon — matches the favicon */}
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                background: '#04080F',
                border: '1.5px solid rgba(0,201,167,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Geometric T mark */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '7px',
                    background: 'linear-gradient(180deg, #00E4BF, #00C9A7)',
                    borderRadius: '1px 1px 0 0',
                    display: 'flex',
                  }}
                />
                <div
                  style={{
                    width: '10px',
                    height: '21px',
                    background: '#00C9A7',
                    borderRadius: '0 0 1px 1px',
                    display: 'flex',
                  }}
                />
              </div>
            </div>
            <span
              style={{
                fontSize: '38px',
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
              fontSize: '58px',
              fontWeight: 700,
              color: '#F0F4F8',
              textAlign: 'center',
              lineHeight: 1.12,
              fontFamily: 'serif',
              maxWidth: '900px',
              letterSpacing: '-0.02em',
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
              maxWidth: '720px',
              lineHeight: 1.5,
              display: 'flex',
            }}
          >
            TAM analysis, competitive landscapes, and partner matching for life sciences professionals.
          </div>

          {/* Stats strip */}
          <div
            style={{
              display: 'flex',
              gap: '48px',
              marginTop: '20px',
              padding: '18px 44px',
              borderRadius: '12px',
              border: '1px solid rgba(0,201,167,0.15)',
              background: 'rgba(0,201,167,0.04)',
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
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: 600,
                    color: '#00C9A7',
                    fontFamily: 'monospace',
                  }}
                >
                  {s.val}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '13px', color: '#475569' }}>Built by</span>
          <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>
            Ambrosia Ventures
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

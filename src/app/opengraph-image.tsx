import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Terrain — Market Opportunity Intelligence for Life Sciences';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: '#04080F',
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
      }}
    >
      {/* Accent line at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: '#00C9A7',
          display: 'flex',
        }}
      />

      {/* Left — branding */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '520px',
          padding: '56px 56px 56px 64px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '36px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#04080F',
              border: '1.5px solid #1a3d35',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '5px',
                  background: '#00C9A7',
                  display: 'flex',
                }}
              />
              <div
                style={{
                  width: '7px',
                  height: '14px',
                  background: '#00C9A7',
                  display: 'flex',
                }}
              />
            </div>
          </div>
          <span
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#F0F4F8',
            }}
          >
            Terrain
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontSize: '44px',
              fontWeight: 700,
              color: '#F0F4F8',
              lineHeight: 1.1,
            }}
          >
            Know the market
          </span>
          <span
            style={{
              fontSize: '44px',
              fontWeight: 700,
              color: '#00C9A7',
              lineHeight: 1.1,
            }}
          >
            before the deal.
          </span>
        </div>

        {/* Sub */}
        <span
          style={{
            fontSize: '16px',
            color: '#94A3B8',
            lineHeight: 1.55,
          }}
        >
          TAM analysis, competitive landscapes, and partner matching for biotech professionals.
        </span>

        {/* Attribution */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '40px',
          }}
        >
          <span style={{ fontSize: '12px', color: '#475569' }}>Built by</span>
          <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>Ambrosia Ventures</span>
        </div>
      </div>

      {/* Right — terminal mock */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '48px 48px 48px 0',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: '#07101E',
            borderRadius: '12px',
            border: '1px solid #102236',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Chrome */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 16px',
              borderBottom: '1px solid #102236',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#F87171',
                opacity: 0.5,
                display: 'flex',
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#FBBF24',
                opacity: 0.5,
                display: 'flex',
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#34D399',
                opacity: 0.5,
                display: 'flex',
              }}
            />
            <span
              style={{
                marginLeft: '8px',
                fontSize: '10px',
                color: '#475569',
              }}
            >
              terrain — market-sizing
            </span>
          </div>

          {/* Body */}
          <div
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '13px',
            }}
          >
            <span style={{ color: '#64748B' }}>&gt; KRAS G12C inhibitor · NSCLC · Phase 2</span>

            <div
              style={{
                height: '1px',
                background: '#102236',
                display: 'flex',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94A3B8' }}>US TAM</span>
              <span style={{ color: '#00C9A7', fontWeight: 500 }}>$24.8B</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94A3B8' }}>US SAM</span>
              <span style={{ color: '#00C9A7', fontWeight: 500 }}>$8.2B</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94A3B8' }}>Peak Revenue</span>
              <span style={{ color: '#F0F4F8', fontWeight: 500 }}>$1.4B</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94A3B8' }}>5-yr CAGR</span>
              <span style={{ color: '#34D399', fontWeight: 500 }}>+12.3%</span>
            </div>

            <div
              style={{
                height: '1px',
                background: '#102236',
                display: 'flex',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94A3B8' }}>Competitive Density</span>
              <span style={{ color: '#FBBF24', fontWeight: 500 }}>7/10</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94A3B8' }}>Top Partner Match</span>
              <span style={{ color: '#00C9A7', fontWeight: 500 }}>Merck (92/100)</span>
            </div>

            <div
              style={{
                height: '1px',
                background: '#102236',
                display: 'flex',
              }}
            />

            <span style={{ color: '#475569', fontSize: '11px' }}>
              Generated in 4.2s · 6 data sources · High confidence
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '16px',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid #102236',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#00C9A7' }}>150+</span>
            <span style={{ fontSize: '10px', color: '#64748B' }}>INDICATIONS</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid #102236',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#00C9A7' }}>300+</span>
            <span style={{ fontSize: '10px', color: '#64748B' }}>PARTNERS</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid #102236',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#00C9A7' }}>30s</span>
            <span style={{ fontSize: '10px', color: '#64748B' }}>RESULTS</span>
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}

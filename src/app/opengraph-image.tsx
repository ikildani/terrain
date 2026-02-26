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
        padding: '0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.035,
          backgroundImage:
            'linear-gradient(rgba(0,201,167,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,201,167,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          display: 'flex',
        }}
      />

      {/* Top-left glow */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          left: '20%',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(0,201,167,0.10), transparent 70%)',
          display: 'flex',
        }}
      />

      {/* Left panel — branding + headline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '520px',
          padding: '56px 56px 56px 64px',
          position: 'relative',
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
              border: '1.5px solid rgba(0,201,167,0.3)',
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
                  background: 'linear-gradient(180deg, #00E4BF, #00C9A7)',
                  borderRadius: '1px 1px 0 0',
                  display: 'flex',
                }}
              />
              <div
                style={{
                  width: '7px',
                  height: '14px',
                  background: '#00C9A7',
                  borderRadius: '0 0 1px 1px',
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
            fontSize: '44px',
            fontWeight: 700,
            color: '#F0F4F8',
            lineHeight: 1.1,
            fontFamily: 'serif',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>Know the market</span>
          <span style={{ color: '#00C9A7' }}>before the deal.</span>
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: '16px',
            color: '#94A3B8',
            lineHeight: 1.55,
            maxWidth: '400px',
            display: 'flex',
          }}
        >
          TAM analysis, competitive landscapes, and partner matching for biotech professionals — in seconds, not weeks.
        </div>

        {/* Bottom tag */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '64px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '12px', color: '#475569' }}>Built by</span>
          <span
            style={{
              fontSize: '12px',
              color: '#94A3B8',
              fontWeight: 500,
            }}
          >
            Ambrosia Ventures
          </span>
        </div>
      </div>

      {/* Right panel — product preview mock */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '40px 48px 40px 0',
          justifyContent: 'center',
        }}
      >
        {/* Terminal card */}
        <div
          style={{
            background: '#07101E',
            borderRadius: '12px',
            border: '1px solid rgba(16,34,54,0.8)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          }}
        >
          {/* Chrome bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(16,34,54,0.8)',
              background: 'rgba(7,16,30,0.6)',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'rgba(248,113,113,0.5)',
                display: 'flex',
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'rgba(251,191,36,0.5)',
                display: 'flex',
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'rgba(52,211,153,0.5)',
                display: 'flex',
              }}
            />
            <span
              style={{
                marginLeft: '8px',
                fontSize: '10px',
                color: '#475569',
                fontFamily: 'monospace',
              }}
            >
              terrain — market-sizing
            </span>
          </div>

          {/* Terminal body */}
          <div
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontFamily: 'monospace',
              fontSize: '13px',
            }}
          >
            {/* Query */}
            <div style={{ color: '#64748B', display: 'flex' }}>{'>'} KRAS G12C inhibitor · NSCLC · Phase 2</div>

            {/* Divider */}
            <div
              style={{
                height: '1px',
                background: 'rgba(16,34,54,0.6)',
                display: 'flex',
                margin: '4px 0',
              }}
            />

            {/* Metrics */}
            {[
              { label: 'US TAM', value: '$24.8B', color: '#00C9A7' },
              { label: 'US SAM', value: '$8.2B', color: '#00C9A7' },
              { label: 'Peak Revenue', value: '$1.4B', color: '#F0F4F8' },
              { label: '5-yr CAGR', value: '+12.3%', color: '#34D399' },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ color: '#94A3B8' }}>{m.label}</span>
                <span style={{ color: m.color, fontWeight: 500 }}>{m.value}</span>
              </div>
            ))}

            {/* Divider */}
            <div
              style={{
                height: '1px',
                background: 'rgba(16,34,54,0.6)',
                display: 'flex',
                margin: '4px 0',
              }}
            />

            {/* Competitive */}
            {[
              {
                label: 'Competitive Density',
                value: '7/10',
                color: '#FBBF24',
              },
              { label: 'Top Partner Match', value: 'Merck (92/100)', color: '#00C9A7' },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ color: '#94A3B8' }}>{m.label}</span>
                <span style={{ color: m.color, fontWeight: 500 }}>{m.value}</span>
              </div>
            ))}

            {/* Footer */}
            <div
              style={{
                height: '1px',
                background: 'rgba(16,34,54,0.6)',
                display: 'flex',
                margin: '4px 0',
              }}
            />
            <div style={{ color: '#475569', fontSize: '11px', display: 'flex' }}>
              Generated in 4.2s · 6 data sources · High confidence
            </div>
          </div>
        </div>

        {/* Mini stats below terminal */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '16px',
            justifyContent: 'center',
          }}
        >
          {[
            { val: '150+', label: 'Indications' },
            { val: '300+', label: 'Partners' },
            { val: '<30s', label: 'Results' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(16,34,54,0.6)',
                background: 'rgba(7,16,30,0.4)',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#00C9A7',
                  fontFamily: 'monospace',
                }}
              >
                {s.val}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}

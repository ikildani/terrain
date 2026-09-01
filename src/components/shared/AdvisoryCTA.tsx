'use client';

interface AdvisoryCTAProps {
  indication?: string;
  module?: string;
}

export function AdvisoryCTA({ indication, module }: AdvisoryCTAProps) {
  const indicationFormatted = indication ? indication.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';
  const subject = encodeURIComponent(`Advisory Inquiry${indicationFormatted ? ` — ${indicationFormatted}` : ''}`);

  return (
    <div
      className="card"
      style={{
        borderLeft: '3px solid var(--teal-500)',
        marginTop: '24px',
        padding: '16px 20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--white)',
              marginBottom: '4px',
            }}
          >
            Planning a transaction in this space?
          </p>
          <p style={{ fontSize: '12px', color: 'var(--slate-300)', lineHeight: '1.5', margin: 0 }}>
            Ambrosia Ventures advises biotech companies on licensing, M&amp;A, and partnering strategy. For deal term
            benchmarking, see{' '}
            <a
              href="https://solidus.ambrosiaventures.co"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--teal-500)', textDecoration: 'none' }}
            >
              Solidus
            </a>
            .
          </p>
        </div>
        <a
          href={`mailto:ikildani@ambrosiaventures.co?subject=${subject}`}
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--teal-500)',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            padding: '6px 14px',
            border: '1px solid var(--teal-500)',
            borderRadius: '4px',
            flexShrink: 0,
          }}
        >
          Speak with our team &rarr;
        </a>
      </div>
    </div>
  );
}

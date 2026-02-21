import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — Terrain',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-300">
      <nav className="border-b border-navy-700/60 bg-navy-950/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="font-display text-xl text-white tracking-tight">
            Terrain
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl text-white mb-8">Terms of Service</h1>

        <div className="space-y-6 text-sm leading-relaxed">
          <p>
            <strong className="text-white">Last updated:</strong>{' '}
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="font-display text-lg text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Terrain (&quot;the Service&quot;), operated by Ambrosia Ventures LLC,
              you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">2. Description of Service</h2>
            <p>
              Terrain is a market intelligence platform for life sciences professionals. It provides
              market sizing, competitive landscape, pipeline intelligence, partner discovery, regulatory
              intelligence, and deal alert services. All analyses are generated using proprietary
              algorithms and publicly available data sources.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">3. Disclaimer</h2>
            <p>
              The information provided by Terrain is for informational purposes only and does not
              constitute financial, investment, legal, or medical advice. While we strive for accuracy,
              we make no guarantees regarding the completeness, reliability, or accuracy of any analysis
              or data provided through the Service. Users should independently verify all data before
              making business decisions.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">4. Subscription & Billing</h2>
            <p>
              Paid plans are billed monthly or annually as selected at checkout. You may cancel at any
              time; cancellation takes effect at the end of the current billing period. Refunds are not
              provided for partial billing periods.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">5. Intellectual Property</h2>
            <p>
              Reports and analyses you generate through Terrain are yours to use. The Service itself,
              including its algorithms, data compilations, design, and code, remains the property of
              Ambrosia Ventures LLC.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">6. Contact</h2>
            <p>
              For questions about these terms, contact us at{' '}
              <a href="mailto:legal@ambrosiaventures.co" className="text-teal-400 hover:text-teal-300">
                legal@ambrosiaventures.co
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

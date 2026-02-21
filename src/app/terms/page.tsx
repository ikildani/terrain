import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — Terrain',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-300">
      <nav className="border-b border-navy-700/60 bg-navy-950/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-white tracking-tight">
            Terrain
          </Link>
          <Link href="/" className="text-xs text-slate-500 hover:text-white transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl text-white mb-2">Terms of Service</h1>
        <p className="text-xs font-mono text-slate-600 mb-10">
          Last updated: February 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="font-display text-lg text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Terrain (&quot;the Service&quot;), operated by Ambrosia Ventures LLC
              (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be bound by these
              Terms of Service (&quot;Terms&quot;). If you are using the Service on behalf of an
              organization, you represent that you have authority to bind that organization to these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">2. Description of Service</h2>
            <p>
              Terrain is a market intelligence platform for life sciences professionals. It provides
              market sizing, competitive landscape, pipeline intelligence, partner discovery, regulatory
              intelligence, and deal alert services. All analyses are generated using proprietary
              algorithms applied to publicly available data sources including ClinicalTrials.gov,
              FDA databases, SEC filings, and published epidemiological literature.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">3. Account Registration</h2>
            <p>
              You must register for an account to use the Service. You agree to provide accurate,
              current, and complete information during registration and to keep your account information
              updated. You are responsible for maintaining the confidentiality of your credentials and
              for all activity under your account. Notify us immediately if you suspect unauthorized
              access.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">4. Subscription Plans & Billing</h2>
            <p>
              The Service offers Free, Pro ($149/month), and Team ($499/month) subscription tiers.
              Each tier provides different access levels and usage limits as described on our pricing page.
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
              <li>Paid subscriptions are billed monthly in advance via Stripe</li>
              <li>You may cancel at any time; access continues until the end of the billing period</li>
              <li>No refunds are provided for partial billing periods</li>
              <li>We reserve the right to change pricing with 30 days&apos; notice</li>
              <li>Free tier usage limits reset on the first of each calendar month (UTC)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 mt-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use automated tools (bots, scrapers) to access the Service without our written consent</li>
              <li>Redistribute, resell, or sublicense access to the Service or its outputs</li>
              <li>Misrepresent Terrain outputs as your own proprietary research without attribution</li>
              <li>Interfere with or disrupt the Service&apos;s infrastructure</li>
              <li>Upload malicious code or content</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">6. Intellectual Property</h2>
            <h3 className="text-sm text-white mt-4 mb-2">Your Content</h3>
            <p>
              Reports and analyses you generate through Terrain are yours to use for your business
              purposes, including internal decision-making, board presentations, investor communications,
              and deal documentation.
            </p>
            <h3 className="text-sm text-white mt-4 mb-2">Our Property</h3>
            <p>
              The Service itself — including its algorithms, data compilations, indication databases,
              pricing benchmarks, design system, and source code — remains the exclusive property of
              Ambrosia Ventures LLC. Nothing in these Terms grants you rights to our underlying
              intellectual property.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">7. Disclaimer of Warranties</h2>
            <p className="uppercase text-xs text-slate-500 tracking-wider mb-3">
              Important — Please Read Carefully
            </p>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES
              OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
              ERROR-FREE, OR COMPLETELY SECURE.
            </p>
            <p className="mt-3">
              The market intelligence, analyses, and data provided through Terrain are for informational
              purposes only and do not constitute financial, investment, legal, medical, or regulatory
              advice. While we strive for accuracy using published data sources, we make no guarantees
              regarding the completeness, reliability, timeliness, or accuracy of any analysis. Market
              conditions, epidemiological data, and regulatory environments change rapidly.
            </p>
            <p className="mt-3">
              <strong className="text-white">You should independently verify all data before making
              business, investment, or regulatory decisions.</strong> Terrain is a decision-support tool,
              not a substitute for professional advisory services, clinical judgment, or regulatory counsel.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, AMBROSIA VENTURES LLC SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS,
              REVENUE, DATA, OR BUSINESS OPPORTUNITIES ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL
              LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING
              THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Ambrosia Ventures LLC, its officers, directors,
              employees, and agents from any claims, damages, losses, or expenses (including reasonable
              attorney&apos;s fees) arising from your use of the Service, your violation of these Terms,
              or your violation of any rights of a third party.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">10. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time, with or without cause,
              with or without notice. You may terminate your account at any time by contacting us. Upon
              termination, your right to use the Service ceases immediately. Provisions that by their
              nature should survive termination (including ownership, warranty disclaimers, indemnification,
              and limitation of liability) will survive.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">11. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of Delaware, without regard to conflict
              of law principles. Any disputes arising under these Terms shall be resolved in the state
              or federal courts located in Delaware.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">12. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. Material changes will be communicated via email or
              platform notification at least 30 days before taking effect. Your continued use of the
              Service after changes take effect constitutes acceptance. If you disagree with the updated
              Terms, you should discontinue use and close your account.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">13. Contact</h2>
            <p>
              For questions about these Terms, contact us at{' '}
              <a href="mailto:legal@ambrosiaventures.co" className="text-teal-400 hover:text-teal-300">
                legal@ambrosiaventures.co
              </a>
              .
            </p>
            <p className="mt-2 text-slate-500">
              Ambrosia Ventures LLC
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

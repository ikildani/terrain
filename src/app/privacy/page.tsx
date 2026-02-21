import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Terrain',
};

export default function PrivacyPage() {
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
        <h1 className="font-display text-3xl text-white mb-2">Privacy Policy</h1>
        <p className="text-xs font-mono text-slate-600 mb-10">
          Last updated: February 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="font-display text-lg text-white mb-3">1. Who We Are</h2>
            <p>
              Terrain is operated by Ambrosia Ventures LLC (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;),
              a Delaware limited liability company. Terrain is a market intelligence platform for life
              sciences professionals. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our platform at terrain.ambrosiaventures.co.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">2. Information We Collect</h2>
            <h3 className="text-sm text-white mt-4 mb-2">Account Information</h3>
            <p>
              When you create an account, we collect your email address, full name, company name, and
              professional role. You may optionally provide therapy areas of interest.
            </p>
            <h3 className="text-sm text-white mt-4 mb-2">Usage Data</h3>
            <p>
              We collect information about how you use the platform, including the analyses you run
              (indication, geography, development stage), reports you save, features you access, and
              your subscription tier. This data is used to enforce usage limits, improve the platform,
              and provide customer support.
            </p>
            <h3 className="text-sm text-white mt-4 mb-2">Payment Information</h3>
            <p>
              Payment processing is handled by Stripe, Inc. We do not store your credit card number,
              CVC, or full card details on our servers. We receive and store your Stripe customer ID,
              subscription status, and billing period dates.
            </p>
            <h3 className="text-sm text-white mt-4 mb-2">Technical Data</h3>
            <p>
              We automatically collect standard technical information including IP address, browser type
              and version, device type, operating system, referral URLs, and pages visited. This data
              is collected via server logs and, where applicable, analytics services.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>Provide, operate, and maintain the Terrain platform</li>
              <li>Process your transactions and manage your subscription</li>
              <li>Enforce usage limits based on your subscription tier</li>
              <li>Send service-related communications (account confirmations, billing receipts, security alerts)</li>
              <li>Improve and personalize your experience on the platform</li>
              <li>Monitor and analyze usage patterns to improve our analytics engines</li>
              <li>Detect and prevent fraud, unauthorized access, or illegal activity</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-3">
              We do <strong className="text-white">not</strong> sell your personal information to third
              parties. We do <strong className="text-white">not</strong> use your analysis inputs or
              outputs to train machine learning models.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">4. Data Sharing</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 mt-2">
              <li><strong className="text-white">Stripe</strong> — for payment processing</li>
              <li><strong className="text-white">Supabase</strong> — for secure data storage and authentication</li>
              <li><strong className="text-white">Vercel</strong> — for application hosting and delivery</li>
              <li><strong className="text-white">Resend</strong> — for transactional email delivery</li>
            </ul>
            <p className="mt-3">
              Each service provider is bound by their own privacy policies and data processing agreements.
              We do not share your data with any other third parties except as required by law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">5. Data Security</h2>
            <p>
              We implement industry-standard security measures including: encryption in transit (TLS 1.3),
              encryption at rest (AES-256 via Supabase), row-level security policies ensuring users can
              only access their own data, secure authentication via Supabase Auth, and regular security
              reviews. No method of transmission over the Internet is 100% secure, but we strive to use
              commercially acceptable means to protect your data.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">6. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. Analysis reports you save
              are retained until you delete them or close your account. Usage event logs are retained for
              12 months for limit enforcement and then aggregated and anonymized. If you delete your
              account, we will delete your personal data within 30 days, except where retention is
              required by law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">7. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate personal data</li>
              <li>Delete your personal data (&quot;right to be forgotten&quot;)</li>
              <li>Export your data in a portable format</li>
              <li>Object to or restrict certain processing</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:privacy@ambrosiaventures.co" className="text-teal-400 hover:text-teal-300">
                privacy@ambrosiaventures.co
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">8. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. These are strictly
              necessary for the platform to function. We do not use advertising or tracking cookies.
              Analytics, where used, rely on privacy-respecting, cookie-free approaches.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">9. International Data Transfers</h2>
            <p>
              Your data may be processed in the United States, where our servers and service providers
              are located. By using Terrain, you consent to the transfer of your information to the
              United States, which may have different data protection laws than your country of residence.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes
              by email or by posting a notice on the platform. Your continued use of Terrain after changes
              are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">11. Contact</h2>
            <p>
              For privacy-related inquiries, contact us at{' '}
              <a href="mailto:privacy@ambrosiaventures.co" className="text-teal-400 hover:text-teal-300">
                privacy@ambrosiaventures.co
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

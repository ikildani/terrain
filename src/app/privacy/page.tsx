import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Terrain',
};

export default function PrivacyPage() {
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
        <h1 className="font-display text-3xl text-white mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-sm leading-relaxed">
          <p>
            <strong className="text-white">Last updated:</strong>{' '}
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="font-display text-lg text-white mb-3">1. Information We Collect</h2>
            <p>
              When you create an account, we collect your email address, name, and company information.
              When you use our platform, we collect usage data including the analyses you run and reports
              you generate. We also collect standard analytics data such as IP address, browser type,
              and pages visited.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">2. How We Use Your Information</h2>
            <p>
              We use your information to provide and improve our services, process payments, send
              service-related communications, and maintain platform security. We do not sell your
              personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including encryption
              in transit and at rest, secure authentication, and regular security audits. Your analysis
              inputs and outputs are stored securely and are only accessible to your account.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">4. Third-Party Services</h2>
            <p>
              We use Stripe for payment processing, Supabase for data storage, and Vercel for hosting.
              Each of these services has their own privacy policies governing their handling of your data.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-white mb-3">5. Contact</h2>
            <p>
              For privacy-related inquiries, contact us at{' '}
              <a href="mailto:privacy@ambrosiaventures.co" className="text-teal-400 hover:text-teal-300">
                privacy@ambrosiaventures.co
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-navy-700/60 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-lg text-white">Terrain</span>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Market Opportunity Intelligence for life sciences. Built by Ambrosia Ventures.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-4">Product</p>
            <ul className="space-y-2.5">
              <li>
                <a href="#modules" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Market Sizing
                </a>
              </li>
              <li>
                <a href="#modules" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Competitive Landscape
                </a>
              </li>
              <li>
                <a href="#modules" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Partner Discovery
                </a>
              </li>
              <li>
                <a href="#modules" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Regulatory Intelligence
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-4">Company</p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://ambrosiaventures.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Ambrosia Ventures
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#faq" className="text-sm text-slate-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-4">Account</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Create account
                </Link>
              </li>
              <li>
                <Link href="/signup?plan=pro" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Start Pro trial
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-navy-700/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Ambrosia Ventures LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getFriendlyAuthError } from '@/lib/utils/auth-errors';
import { ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError(getFriendlyAuthError(error.message));
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-slate-100 mb-2">Terrain</h1>
          <p className="text-slate-400 text-sm">Market Opportunity Intelligence</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="card p-8">
            {sent ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-teal-400" />
                </div>
                <h2 className="font-display text-xl text-slate-100 mb-2">Check your email</h2>
                <p className="text-sm text-slate-400 mb-6">
                  We sent a password reset link to <span className="text-white font-medium">{email}</span>. Click the
                  link to set a new password.
                </p>
                <p className="text-xs text-slate-600">
                  Didn&apos;t receive the email? Check your spam folder or{' '}
                  <button onClick={() => setSent(false)} className="text-teal-400 hover:text-teal-300">
                    try again
                  </button>
                  .
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-xl text-slate-100 mb-2">Reset your password</h2>
                <p className="text-sm text-slate-400 mb-6">
                  Enter the email address associated with your account and we&apos;ll send you a link to reset your
                  password.
                </p>

                <form onSubmit={handleReset} aria-invalid={!!error || undefined} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="input-label">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      placeholder="you@company.com"
                      required
                      autoFocus
                    />
                  </div>

                  <div role="alert" aria-live="assertive" className="min-h-[40px]">
                    {error && (
                      <p className="text-sm text-signal-red bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    aria-busy={loading || undefined}
                    className="btn btn-primary w-full btn-lg"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 pt-4 border-t border-navy-700/60">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

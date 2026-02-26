'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getFriendlyAuthError } from '@/lib/utils/auth-errors';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getPasswordStrength(pw: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-signal-red' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-signal-amber' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-signal-blue' };
  return { score, label: 'Strong', color: 'bg-signal-green' };
}

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const attempts = useRef<number[]>([]);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      setError(getFriendlyAuthError(error.message));
      setGoogleLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side rate limiting (defense in depth — Supabase also rate limits server-side)
    const now = Date.now();
    attempts.current = attempts.current.filter((t) => now - t < WINDOW_MS);
    if (attempts.current.length >= MAX_ATTEMPTS) {
      setError('Too many signup attempts. Please wait a few minutes and try again.');
      setLoading(false);
      return;
    }
    attempts.current.push(now);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      setError(getFriendlyAuthError(error.message));
      setLoading(false);
      return;
    }

    if (!data.session) {
      // Email confirmation required
      setShowVerification(true);
      setLoading(false);
    } else {
      // Auto-confirmed (e.g., during development)
      router.push('/onboarding');
      router.refresh();
    }
  }

  async function handleResendVerification() {
    setResendMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/callback` },
    });
    if (error) {
      setResendMessage(getFriendlyAuthError(error.message));
    } else {
      setResendMessage('Verification email resent. Check your inbox.');
    }
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
            {showVerification ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-teal-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Check your email</h2>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                  We sent a verification link to <span className="text-slate-200 font-medium">{email}</span>. Click the
                  link to activate your account.
                </p>
                {resendMessage && <p className="text-xs text-teal-400">{resendMessage}</p>}
                <p className="text-xs text-slate-500">
                  Didn&apos;t receive it? Check your spam folder or{' '}
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="text-teal-400 hover:text-teal-300 underline"
                  >
                    resend the email
                  </button>
                </p>
              </motion.div>
            ) : (
              <>
                <h2 className="font-display text-xl text-slate-100 mb-6">Create your account</h2>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-navy-700 bg-navy-900 text-slate-200 hover:bg-navy-800 hover:border-navy-600 transition-all duration-200 font-medium text-sm disabled:opacity-50"
                >
                  {googleLoading ? (
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
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-navy-700" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-navy-900 text-slate-500">or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleSignup} aria-invalid={!!error || undefined} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="input-label">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input"
                      placeholder="Jane Smith"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="input-label">
                      Work Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      placeholder="you@company.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="input-label">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input"
                      placeholder="Min. 8 characters"
                      minLength={8}
                      required
                    />
                    {password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                i <= strength.score ? strength.color : 'bg-navy-700'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Password strength: <span className="text-slate-400">{strength.label}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div role="alert" aria-live="assertive" className="min-h-[40px]">
                    {error && (
                      <p className="text-sm text-signal-red bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
                        {error}
                      </p>
                    )}
                  </div>

                  <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 rounded border-navy-600 bg-navy-800 text-teal-500 focus:ring-teal-500/30"
                      required
                    />
                    <span>
                      I agree to the{' '}
                      <Link href="/terms" className="text-teal-400 hover:text-teal-300 underline" target="_blank">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-teal-400 hover:text-teal-300 underline" target="_blank">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading || googleLoading || !agreedToTerms}
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
                        Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </button>
                </form>

                <p className="text-center text-slate-500 text-sm mt-6">
                  Already have an account?{' '}
                  <Link href="/login" className="text-teal-400 hover:text-teal-300">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

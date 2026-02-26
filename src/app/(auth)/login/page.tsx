'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getFriendlyAuthError } from '@/lib/utils/auth-errors';
import { motion } from 'framer-motion';

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const attempts = useRef<number[]>([]);

  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError === 'auth_callback_error') {
      setError('Authentication failed. Please try signing in again.');
    }
  }, [searchParams]);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback${searchParams.get('next') ? `?next=${encodeURIComponent(searchParams.get('next')!)}` : ''}`,
      },
    });

    if (error) {
      setError(getFriendlyAuthError(error.message));
      setGoogleLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side rate limiting (defense in depth — Supabase also rate limits server-side)
    const now = Date.now();
    attempts.current = attempts.current.filter((t) => now - t < WINDOW_MS);
    if (attempts.current.length >= MAX_ATTEMPTS) {
      setError('Too many login attempts. Please wait a few minutes and try again.');
      setLoading(false);
      return;
    }
    attempts.current.push(now);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(getFriendlyAuthError(error.message));
      setLoading(false);
      return;
    }

    // Redirect to the original page if a valid `next` param is present
    const next = searchParams.get('next');
    const safePath = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
    router.push(safePath);
    router.refresh();
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
            <h2 className="font-display text-xl text-slate-100 mb-6">Sign in to your account</h2>

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
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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

            <form onSubmit={handleLogin} aria-invalid={!!error || undefined} className="space-y-4">
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
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="input-label">
                    Password
                  </label>
                  <Link href="/reset-password" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
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
                disabled={loading || googleLoading}
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
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-teal-400 hover:text-teal-300">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl text-slate-100 mb-2">Terrain</h1>
              <p className="text-slate-400 text-sm">Market Opportunity Intelligence</p>
            </div>
            <div className="card p-8 animate-pulse">
              <div className="h-6 bg-navy-700 rounded w-2/3 mb-6" />
              <div className="h-12 bg-navy-700 rounded mb-6" />
              <div className="space-y-4">
                <div className="h-10 bg-navy-700 rounded" />
                <div className="h-10 bg-navy-700 rounded" />
                <div className="h-12 bg-navy-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

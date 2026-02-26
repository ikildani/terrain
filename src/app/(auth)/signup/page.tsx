'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

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
  const router = useRouter();
  const supabase = createClient();
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const attempts = useRef<number[]>([]);

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

    const { error } = await supabase.auth.signUp({
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
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/onboarding');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-slate-100 mb-2">Terrain</h1>
          <p className="text-slate-400 text-sm">Market Opportunity Intelligence</p>
        </div>

        <div className="card p-8">
          <h2 className="font-display text-xl text-slate-100 mb-6">Create your account</h2>

          <form onSubmit={handleSignup} className="space-y-4">
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

            {error && (
              <div className="text-signal-red text-sm bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading || undefined}
              className="btn btn-primary w-full btn-lg"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-400 hover:text-teal-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

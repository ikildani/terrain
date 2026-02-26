'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getFriendlyAuthError } from '@/lib/utils/auth-errors';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(getFriendlyAuthError(error.message));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      router.push('/dashboard');
      router.refresh();
    }, 2000);
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
            {success ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="font-display text-xl text-slate-100 mb-2">Password updated</h2>
                <p className="text-sm text-slate-400">Redirecting you to the dashboard...</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-xl text-slate-100 mb-2">Set a new password</h2>
                <p className="text-sm text-slate-400 mb-6">Choose a strong password for your account.</p>

                <form onSubmit={handleUpdate} aria-invalid={!!error || undefined} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="input-label">
                      New password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input"
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                      autoFocus
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

                  <div>
                    <label htmlFor="confirm-password" className="input-label">
                      Confirm password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input"
                      placeholder="Re-enter your password"
                      required
                      minLength={8}
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
                        Updating...
                      </>
                    ) : (
                      'Update password'
                    )}
                  </button>
                </form>
              </>
            )}

            {!success && (
              <p className="text-center text-slate-500 text-sm mt-6">
                Remember your password?{' '}
                <Link href="/login" className="text-teal-400 hover:text-teal-300">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

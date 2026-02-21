'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Check } from 'lucide-react';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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
      setError(error.message);
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
          <h1 className="font-display text-3xl text-slate-100 mb-2">
            Terrain
          </h1>
          <p className="text-slate-400 text-sm">
            Market Opportunity Intelligence
          </p>
        </div>

        <div className="card p-8">
          {success ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="font-display text-xl text-slate-100 mb-2">
                Password updated
              </h2>
              <p className="text-sm text-slate-400">
                Redirecting you to the dashboard...
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl text-slate-100 mb-2">
                Set a new password
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Choose a strong password for your account.
              </p>

              <form onSubmit={handleUpdate} className="space-y-4">
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

                {error && (
                  <div className="text-signal-red text-sm bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full btn-lg"
                >
                  {loading ? 'Updating...' : 'Update password'}
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
      </div>
    </div>
  );
}

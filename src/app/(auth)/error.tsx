'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function AuthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);

    if (process.env.NODE_ENV === 'development') {
      console.error('[Auth Error Boundary]', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm rounded-lg border border-navy-700 bg-navy-900 p-8 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-400/10 border border-red-400/20">
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2 className="font-display text-xl text-white mb-2">Authentication Error</h2>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">Something went wrong. Please try again.</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full rounded-md bg-teal-500 px-4 py-2.5 text-sm font-medium text-navy-950 transition-colors hover:bg-teal-400"
          >
            Try again
          </button>
          <Link href="/login" className="text-sm text-slate-300 transition-colors hover:text-teal-400">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

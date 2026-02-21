'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-6xl text-slate-100 mb-4">500</h1>
          <p className="text-slate-400 text-lg mb-8">
            Something went wrong.
          </p>
          <button onClick={() => reset()} className="btn btn-primary">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

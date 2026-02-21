import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-mono text-teal-500 text-sm tracking-widest mb-3">404</p>
        <h1 className="font-display text-3xl text-slate-100 mb-4">Page not found</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

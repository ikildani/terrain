export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-navy-950">
      <div className="text-center">
        <h1 className="font-display text-5xl text-white mb-4">Terrain</h1>
        <p className="text-slate-400 text-lg max-w-lg mx-auto">
          Market Opportunity Intelligence Platform
        </p>
        <p className="text-slate-500 text-sm mt-3">
          Built by Ambrosia Ventures
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <a href="/login" className="btn btn-primary">
            Get Started
          </a>
          <a href="/dashboard" className="btn btn-secondary">
            Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}

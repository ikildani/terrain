export function ConfidentialFooter() {
  return (
    <footer className="mt-12 pt-6 border-t border-navy-700 flex items-center justify-between">
      <span className="font-mono text-2xs text-slate-600 tracking-wider">
        CONFIDENTIAL — Prepared by Terrain / Ambrosia Ventures
      </span>
      <span className="font-mono text-2xs text-slate-600">
        {new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </span>
    </footer>
  );
}

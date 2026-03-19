export function CredibilityStrip() {
  return (
    <section className="py-12 px-6 border-t border-navy-700/60 bg-navy-900/30 noise">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="font-mono text-2xl text-teal-400 font-medium mb-1">10,000+</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Transactions in database</div>
            <div className="text-2xs text-slate-600 mt-1">Ambrosia Ventures deal library</div>
          </div>
          <div>
            <div className="font-mono text-2xl text-teal-400 font-medium mb-1">18</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Therapeutic areas</div>
            <div className="text-2xs text-slate-600 mt-1">Oncology to rare disease</div>
          </div>
          <div>
            <div className="font-mono text-2xl text-teal-400 font-medium mb-1">236</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Indications covered</div>
            <div className="text-2xs text-slate-600 mt-1">With epidemiology &amp; pricing data</div>
          </div>
          <div>
            <div className="font-mono text-2xl text-teal-400 font-medium mb-1">4</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Product categories</div>
            <div className="text-2xs text-slate-600 mt-1">Pharma, device, CDx, nutraceutical</div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-navy-700/60 text-center">
          <p className="text-sm text-slate-500">
            Built by{' '}
            <a
              href="https://ambrosiaventures.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Ambrosia Ventures
            </a>{' '}
            &mdash; life sciences M&amp;A and strategy advisory. Our deal experience is embedded in every calculation.
          </p>
        </div>
      </div>
    </section>
  );
}

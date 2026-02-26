'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { posthog, POSTHOG_KEY } from '@/lib/posthog';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
);

const ROLES = [
  { value: 'founder', label: 'Biotech Founder / CEO', desc: 'Building or leading a biotech company' },
  { value: 'bd_executive', label: 'BD / Licensing Executive', desc: 'Sourcing and structuring partnerships' },
  { value: 'investor', label: 'Investor / VC', desc: 'Evaluating life sciences opportunities' },
  { value: 'corp_dev', label: 'Corporate Development', desc: 'M&A, strategy, and integration' },
  { value: 'analyst', label: 'Analyst / Consultant', desc: 'Research and advisory for life sciences' },
  { value: 'consultant', label: 'Strategy Consultant', desc: 'Advising biopharma on commercial strategy' },
];

const THERAPY_AREAS = [
  'Oncology',
  'Neurology',
  'Immunology',
  'Rare Disease',
  'Cardiovascular',
  'Metabolic',
  'Infectious Disease',
  'Ophthalmology',
  'Dermatology',
  'Respiratory',
  'Hematology',
  'Gene Therapy',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [therapyAreas, setTherapyAreas] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  // Check if onboarding already done
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

      if (profile?.role) {
        router.push('/dashboard');
        return;
      }
      setChecking(false);
    })();
  }, [router]);

  function toggleTherapyArea(area: string) {
    setTherapyAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  }

  async function handleComplete() {
    setSaving(true);
    setError('');
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role,
        company: company || null,
        therapy_areas: therapyAreas.length > 0 ? therapyAreas : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      setSaving(false);
      setError('Something went wrong saving your profile. Please try again.');
      return;
    }

    if (POSTHOG_KEY) {
      posthog.capture('onboarding_completed', {
        role,
        company: company || null,
        therapy_areas_count: therapyAreas.length,
      });
    }

    router.push('/dashboard');
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalSteps = 3;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      {/* Progress */}
      <div className="w-full bg-navy-900 border-b border-navy-700/60">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display text-lg text-white">Terrain</span>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? 'w-8 bg-teal-500' : 'w-4 bg-navy-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {step + 1} / {totalSteps}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {/* Step 0: Role */}
            {step === 0 && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="font-display text-3xl text-white mb-2">What best describes your role?</h1>
                <p className="text-slate-400 mb-8">This helps us tailor Terrain to your workflow.</p>

                <div className="grid gap-3">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRole(r.value)}
                      className={`text-left p-4 rounded-lg border transition-all ${
                        role === r.value
                          ? 'border-teal-500/40 bg-teal-500/5 ring-1 ring-teal-500/20'
                          : 'border-navy-700 bg-navy-900/50 hover:border-navy-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-sm font-medium ${role === r.value ? 'text-teal-400' : 'text-white'}`}>
                            {r.label}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{r.desc}</div>
                        </div>
                        {role === r.value && <Check className="w-4 h-4 text-teal-500 shrink-0" />}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStep(1)}
                  disabled={!role}
                  className="btn btn-primary w-full mt-8 py-3 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Step 1: Company */}
            {step === 1 && (
              <motion.div
                key="company"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="font-display text-3xl text-white mb-2">Where do you work?</h1>
                <p className="text-slate-400 mb-8">Optional — helps us personalize your experience.</p>

                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company name (optional)"
                  className="input w-full text-base py-3"
                />

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setStep(0)}
                    className="btn btn-secondary py-3 px-6 text-sm inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="btn btn-primary flex-1 py-3 text-sm inline-flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Therapy Areas */}
            {step === 2 && (
              <motion.div
                key="therapy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="font-display text-3xl text-white mb-2">What therapy areas interest you?</h1>
                <p className="text-slate-400 mb-8">Select all that apply — you can change these later.</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {THERAPY_AREAS.map((area) => {
                    const selected = therapyAreas.includes(area);
                    return (
                      <button
                        key={area}
                        onClick={() => toggleTherapyArea(area)}
                        className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                          selected
                            ? 'border-teal-500/40 bg-teal-500/10 text-teal-400'
                            : 'border-navy-700 bg-navy-900/50 text-slate-300 hover:border-navy-600'
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>

                {error && (
                  <div className="mt-6 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="btn btn-secondary py-3 px-6 text-sm inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={saving}
                    className="btn btn-primary flex-1 py-3 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Get started
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useUser } from '@/hooks/useUser';
import { useProfile } from '@/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Save, Check, AlertTriangle } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'founder', label: 'Biotech Founder / CEO' },
  { value: 'bd_executive', label: 'BD & Licensing Executive' },
  { value: 'investor', label: 'Life Sciences Investor' },
  { value: 'corp_dev', label: 'Corporate Development' },
  { value: 'analyst', label: 'Research Analyst' },
  { value: 'consultant', label: 'Strategy Consultant' },
  { value: 'other', label: 'Other' },
];

const THERAPY_AREAS = [
  'Oncology',
  'Neurology',
  'Immunology',
  'Rare Disease',
  'Cardiovascular',
  'Infectious Disease',
  'Ophthalmology',
  'Hematology',
  'Metabolic',
  'Pulmonology',
  'Medical Devices',
  'Diagnostics',
];

export default function SettingsPage() {
  const { user } = useUser();
  const { refresh: refreshProfile } = useProfile();
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    if (!supabase) return;

    async function loadProfile() {
      const { data } = await supabase!
        .from('profiles')
        .select('full_name, company, role, therapy_areas')
        .eq('id', user!.id)
        .single();
      if (data) {
        const row = data as Record<string, string | string[] | null>;
        setFullName((row.full_name as string) ?? '');
        setCompany((row.company as string) ?? '');
        setRole((row.role as string) ?? '');
        setSelectedAreas((row.therapy_areas as string[]) ?? []);
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    if (!supabase) {
      toast.error('Unable to connect to database.');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        company,
        role,
        therapy_areas: selectedAreas,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      toast.error('Failed to save profile: ' + error.message);
      return;
    }

    refreshProfile();
    setSaved(true);
    toast.success('Profile saved');
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleArea(area: string) {
    setSelectedAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Settings" subtitle="Manage your account and preferences." />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-4 w-24 mb-4" />
              <div className="skeleton h-10 w-full" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences."
        actions={
          <Button variant="primary" onClick={handleSave} isLoading={saving} disabled={saving}>
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved' : 'Save Changes'}
          </Button>
        }
      />

      <div className="space-y-6 max-w-2xl">
        {/* Profile */}
        <div className="card noise p-6 space-y-5">
          <h2 className="text-sm font-medium text-white">Profile</h2>

          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />

          <Input label="Email" value={user?.email ?? ''} disabled className="opacity-60" />

          <Input
            label="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Your company or organization"
          />

          <Select label="Role" options={ROLE_OPTIONS} value={role} onChange={(e) => setRole(e.target.value)} />
        </div>

        {/* Therapy Areas */}
        <div className="card noise p-6">
          <h2 className="text-sm font-medium text-white mb-1">Therapy Areas of Interest</h2>
          <p className="text-xs text-slate-500 mb-4">
            Select the areas relevant to your work. This helps personalize your dashboard.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {THERAPY_AREAS.map((area) => {
              const selected = selectedAreas.includes(area);
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={`px-3 py-2 rounded text-xs font-medium border transition-colors text-left ${
                    selected
                      ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                      : 'bg-navy-800 border-navy-700 text-slate-400 hover:border-navy-600'
                  }`}
                >
                  {area}
                </button>
              );
            })}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card noise p-6 border-signal-red/20">
          <h2 className="text-sm font-medium text-signal-red mb-1">Danger Zone</h2>
          <p className="text-xs text-slate-500 mb-4">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
            Delete Account
          </Button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowDeleteModal(false);
              setDeleteConfirm('');
            }
          }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteConfirm('');
            }}
          />
          <div className="relative card noise p-6 max-w-md w-full border-signal-red/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-signal-red/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-signal-red" />
              </div>
              <div>
                <h3 id="delete-modal-title" className="text-sm font-medium text-white">
                  Delete Account
                </h3>
                <p className="text-xs text-slate-400">This action is permanent and irreversible.</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              All your saved reports, analyses, and profile data will be permanently deleted. Your subscription will be
              canceled immediately with no refund.
            </p>
            <div className="mb-4">
              <label className="block text-xs text-slate-500 mb-1.5">
                Type <span className="font-mono text-signal-red">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-signal-red/50"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={deleteConfirm !== 'DELETE' || deleting}
                isLoading={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    const res = await fetch('/api/account/delete', { method: 'POST' });
                    const data = await res.json();
                    if (data.success) {
                      const supabase = createClient();
                      if (supabase) await supabase.auth.signOut();
                      router.push('/login');
                    } else {
                      toast.error(data.error || 'Failed to delete account');
                    }
                  } catch {
                    toast.error('Failed to delete account');
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                Delete My Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

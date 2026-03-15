'use client';

import { useState } from 'react';
import { UserPlus, X, Crown } from 'lucide-react';
import { toast } from 'sonner';
import type { ProjectMember, WorkspaceMember } from '@/types';

interface ProjectMemberManagerProps {
  projectId: string;
  workspaceId: string;
  members: ProjectMember[];
  workspaceMembers: WorkspaceMember[];
  canManage: boolean;
  onChanged: () => void;
}

export function ProjectMemberManager({
  projectId,
  workspaceId,
  members,
  workspaceMembers,
  canManage,
  onChanged,
}: ProjectMemberManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'lead' | 'member'>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Filter workspace members not already in the project
  const projectMemberIds = new Set(members.map((m) => m.user_id));
  const availableMembers = workspaceMembers.filter((wm) => !projectMemberIds.has(wm.user_id));

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUserId, role: selectedRole }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Failed to add member');
        return;
      }

      toast.success('Member added to project');
      setIsAdding(false);
      setSelectedUserId('');
      setSelectedRole('member');
      onChanged();
    } catch {
      toast.error('Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!window.confirm('Remove this member from the project?')) return;
    setRemovingId(memberId);

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}/members?memberId=${memberId}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Failed to remove member');
        return;
      }

      toast.success('Member removed from project');
      onChanged();
    } catch {
      toast.error('Failed to remove member');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300">Project Members</h3>
        {canManage && availableMembers.length > 0 && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Member
          </button>
        )}
      </div>

      {/* Add member form */}
      {isAdding && (
        <div className="card noise p-4 mb-4 border border-teal-500/20">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-2xs text-slate-500 uppercase tracking-wider mb-1 block">Workspace Member</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input w-full text-sm"
              >
                <option value="">Select a member...</option>
                {availableMembers.map((wm) => (
                  <option key={wm.user_id} value={wm.user_id}>
                    {wm.full_name || wm.email || wm.user_id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-2xs text-slate-500 uppercase tracking-wider mb-1 block">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'lead' | 'member')}
                className="input text-sm"
              >
                <option value="member">Member</option>
                <option value="lead">Lead</option>
              </select>
            </div>
            <button onClick={handleAdd} disabled={!selectedUserId || isSubmitting} className="btn btn-primary btn-sm">
              {isSubmitting ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setSelectedUserId('');
              }}
              className="btn btn-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Member list */}
      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No members yet.</p>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-navy-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-navy-700 flex items-center justify-center text-xs font-mono text-slate-400">
                  {(member.full_name || member.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-slate-300">{member.full_name || member.email || member.user_id}</p>
                  {member.full_name && member.email && <p className="text-2xs text-slate-500">{member.email}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                    member.role === 'lead'
                      ? 'bg-teal-500/15 text-teal-400 border-teal-500/20'
                      : 'bg-slate-500/15 text-slate-400 border-slate-500/20'
                  } inline-flex items-center gap-1`}
                >
                  {member.role === 'lead' && <Crown className="w-2.5 h-2.5" />}
                  {member.role}
                </span>
                {canManage && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    disabled={removingId === member.id}
                    className="p-1 rounded hover:bg-navy-800 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove member"
                  >
                    <X className="w-3.5 h-3.5 text-slate-500 hover:text-red-400 transition-colors" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

'use client';

import { FolderLock } from 'lucide-react';
import type { WorkspaceProject } from '@/types';

interface ProjectSelectorProps {
  projects: WorkspaceProject[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
}

export function ProjectSelector({ projects, selectedId, onChange }: ProjectSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <FolderLock className="w-4 h-4 text-slate-500 shrink-0" />
      <select
        value={selectedId ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="input text-sm flex-1"
      >
        <option value="">No project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
            {project.is_restricted ? ' (restricted)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

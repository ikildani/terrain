'use client';

import { ShieldCheck, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import type { WorkspaceProject } from '@/types';

interface ProjectCardProps {
  project: WorkspaceProject;
  reportCount: number;
  memberCount: number;
  canManage: boolean;
}

export function ProjectCard({ project, reportCount, memberCount, canManage }: ProjectCardProps) {
  return (
    <Link
      href={`/workspace/projects/${project.id}`}
      className="card noise group hover:border-teal-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-teal-sm cursor-pointer block"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {project.is_restricted && (
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded border bg-amber-500/15 text-amber-400 border-amber-500/20 inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Restricted
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <h4 className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors line-clamp-2 mb-1">
        {project.name}
      </h4>

      {/* Description */}
      {project.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{project.description}</p>}

      {/* Stats */}
      <div className="flex items-center gap-4 mt-auto pt-2 border-t border-navy-700/30">
        <div className="flex items-center gap-1.5 text-2xs text-slate-500">
          <Users className="w-3 h-3" />
          <span className="font-mono">{memberCount}</span>
          <span>{memberCount === 1 ? 'member' : 'members'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-2xs text-slate-500">
          <FileText className="w-3 h-3" />
          <span className="font-mono">{reportCount}</span>
          <span>{reportCount === 1 ? 'report' : 'reports'}</span>
        </div>
      </div>
    </Link>
  );
}

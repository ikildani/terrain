'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MemberUsage {
  user_id: string;
  name: string;
  analysis_count: number;
  report_count: number;
}

interface MemberUsageTableProps {
  members: MemberUsage[];
}

type SortKey = 'name' | 'analysis_count' | 'report_count';

export function MemberUsageTable({ members }: MemberUsageTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('analysis_count');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...members].sort((a, b) => {
      let cmp: number;
      if (sortKey === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else {
        cmp = (a[sortKey] ?? 0) - (b[sortKey] ?? 0);
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [members, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const columns: { key: SortKey; label: string; align: 'left' | 'right' }[] = [
    { key: 'name', label: 'Member', align: 'left' },
    { key: 'analysis_count', label: 'Analyses', align: 'right' },
    { key: 'report_count', label: 'Reports', align: 'right' },
  ];

  return (
    <div className="card noise">
      <div className="p-4 border-b border-navy-700/30">
        <h3 className="label text-slate-400">Usage by Member</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy-700/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-2xs font-mono uppercase text-slate-600 cursor-pointer hover:text-slate-400 transition-colors select-none',
                    col.align === 'right' ? 'text-right' : 'text-left',
                  )}
                  onClick={() => handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown className={cn('w-3 h-3', sortKey === col.key ? 'text-teal-500' : 'text-slate-700')} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length > 0 ? (
              sorted.map((member, idx) => (
                <tr
                  key={member.user_id}
                  className={cn(
                    'border-b border-navy-700/20 hover:bg-navy-800/40 transition-colors',
                    idx % 2 === 0 ? 'bg-navy-900/30' : '',
                  )}
                >
                  <td className="px-4 py-3 text-sm text-slate-300">{member.name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-300 text-right">{member.analysis_count}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-300 text-right">{member.report_count}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-600">
                  No member data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

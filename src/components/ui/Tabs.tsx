'use client';

import { cn } from '@/lib/utils/cn';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 border-b border-navy-700 pb-px', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-t-md transition-colors',
            activeTab === tab.id
              ? 'text-teal-400 bg-navy-800 border-b-2 border-teal-500'
              : 'text-slate-500 hover:text-slate-300 hover:bg-navy-800/50'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

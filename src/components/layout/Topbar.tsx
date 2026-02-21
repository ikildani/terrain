'use client';

import { Search, User } from 'lucide-react';

export function Topbar() {
  return (
    <header className="topbar">
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search indications, companies, mechanisms..."
            className="input pl-9 py-2 text-sm bg-navy-800 border-transparent focus:border-teal-500"
          />
        </div>
      </div>
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-navy-800 transition-colors">
        <div className="w-7 h-7 rounded-full bg-navy-700 flex items-center justify-center">
          <User className="w-4 h-4 text-slate-400" />
        </div>
        <span className="text-sm text-slate-400 hidden sm:inline">Account</span>
      </button>
    </header>
  );
}

'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-layout">
        <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main id="main-content" className="page-content">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </>
  );
}

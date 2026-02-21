import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <>
      <Sidebar />
      <div className="dashboard-layout">
        <Topbar />
        <main className="page-content">{children}</main>
      </div>
    </>
  );
}

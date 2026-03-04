import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../ui/ToastContainer';
import { DeleteModal } from '../ui/DeleteModal';

interface AppShellProps {
  children: ReactNode;
  breadcrumbs: string[];
}

export function AppShell({ children, breadcrumbs }: AppShellProps) {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1280px] mx-auto px-8 py-6">
            {children}
          </div>
        </main>
      </div>
      <ToastContainer />
      <DeleteModal />
    </div>
  );
}

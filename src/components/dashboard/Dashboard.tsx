'use client';

import { Sidebar } from '../layout/Sidebar';
import { TerminalPanel } from '../terminal/TerminalPanel';
import { useTerminalStore } from '@/stores/terminal-store';

export function Dashboard() {
  const toast = useTerminalStore((s) => s.toast);
  const clearToast = useTerminalStore((s) => s.clearToast);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <TerminalPanel />

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-sm font-medium z-50 cursor-pointer ${
            toast.type === 'success'
              ? 'bg-success text-white'
              : toast.type === 'error'
              ? 'bg-danger text-white'
              : 'bg-accent text-white'
          }`}
          onClick={clearToast}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

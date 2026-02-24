'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTerminalStore } from '@/stores/terminal-store';
import { PushConfirmDialog } from './PushConfirmDialog';

interface PushEnvironmentMenuProps {
  siteId: string;
  siteName: string;
}

export function PushEnvironmentMenu({ siteId, siteName }: PushEnvironmentMenuProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmDirection, setConfirmDirection] = useState<'staging-to-live' | 'live-to-staging' | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useTerminalStore();

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const pollOperation = useCallback(async (operationId: string, direction: string) => {
    setPolling(true);
    const poll = async () => {
      try {
        const res = await fetch(`/api/operations/${operationId}`);
        if (!res.ok) throw new Error('Failed to check operation status');
        const data = await res.json();

        if (data.status === 'completed' || data.status === 'successful') {
          showToast(`Push ${direction.replace('-', ' ').replace('-', ' ')} completed`, 'success');
          setPolling(false);
          return;
        }

        if (data.status === 'failed' || data.status === 'error') {
          showToast(`Push failed: ${data.message || 'Unknown error'}`, 'error');
          setPolling(false);
          return;
        }

        // Still in progress — poll again
        setTimeout(poll, 3000);
      } catch {
        showToast('Failed to check push status', 'error');
        setPolling(false);
      }
    };
    setTimeout(poll, 3000);
  }, [showToast]);

  const handleConfirm = async () => {
    if (!confirmDirection) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: confirmDirection }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Push failed', 'error');
        return;
      }

      showToast(`Push started: ${data.source} → ${data.target}`, 'info');
      setConfirmDirection(null);
      pollOperation(data.operation_id, confirmDirection);
    } catch {
      showToast('Failed to start push', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDropdownOpen((prev) => !prev);
        }}
        className={`text-text-muted hover:text-text-primary flex-shrink-0 text-sm transition-colors ${
          polling ? 'animate-pulse text-info' : ''
        }`}
        title="Push environment"
      >
        {polling ? '⟳' : '⇅'}
      </button>

      {dropdownOpen && (
        <div className="absolute top-full left-0 mt-1 bg-bg-secondary border border-border rounded shadow-lg z-50 whitespace-nowrap">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(false);
              setConfirmDirection('staging-to-live');
            }}
            className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
          >
            Push Staging → Live
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(false);
              setConfirmDirection('live-to-staging');
            }}
            className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
          >
            Push Live → Staging
          </button>
        </div>
      )}

      {confirmDirection && (
        <PushConfirmDialog
          direction={confirmDirection}
          siteName={siteName}
          loading={loading}
          onConfirm={handleConfirm}
          onCancel={() => {
            if (!loading) setConfirmDirection(null);
          }}
        />
      )}
    </div>
  );
}

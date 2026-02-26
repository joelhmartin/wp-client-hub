'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface TerminalInstanceHandle {
  writeToTerminal: (text: string) => void;
}

interface TerminalInstanceProps {
  siteId: string;
  envId: string;
  type: 'claude' | 'ssh';
  visible: boolean;
  claudeMode?: string | null;
  agentType?: string;
}

export const TerminalInstance = forwardRef<TerminalInstanceHandle, TerminalInstanceProps>(
  function TerminalInstance({ siteId, envId, type, visible, claudeMode, agentType }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const connectedKeyRef = useRef<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  useImperativeHandle(ref, () => ({
    writeToTerminal: (text: string) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', data: text }));
      }
    },
  }));

  const sendFile = useCallback((file: File) => {
    const ws = wsRef.current;
    const term = terminalRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      term?.write('\r\n\x1b[31m[Upload failed: not connected]\x1b[0m\r\n');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      term?.write(`\r\n\x1b[31m[Upload failed: ${file.name} exceeds 10MB limit]\x1b[0m\r\n`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      ws.send(JSON.stringify({ type: 'file', filename: file.name, data: base64 }));
    };
    reader.onerror = () => {
      term?.write(`\r\n\x1b[31m[Upload failed: could not read ${file.name}]\x1b[0m\r\n`);
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#0f172a',
        foreground: '#f1f5f9',
        cursor: '#f1f5f9',
        selectionBackground: '#334155',
        black: '#0f172a',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#f1f5f9',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(containerRef.current);
    fitAddon.fit();

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;

    const resizeObserver = new ResizeObserver(() => {
      try { fitAddon.fit(); } catch {}
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      wsRef.current?.close();
      term.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
      connectedKeyRef.current = null;
    };
  }, []);

  // Connect WebSocket when component mounts with site/env info
  useEffect(() => {
    if (!siteId || !envId || !terminalRef.current) return;
    // For claude type, wait until mode is chosen
    if (type === 'claude' && !claudeMode) return;

    const connectionKey = `${siteId}-${envId}-${type}-${claudeMode || ''}-${agentType || ''}`;
    if (connectedKeyRef.current === connectionKey) return;

    // Close previous connection
    wsRef.current?.close();

    const term = terminalRef.current;
    term.clear();

    const params = new URLSearchParams({ siteId, envId, type });
    if (type === 'claude' && claudeMode) {
      params.set('claudeMode', claudeMode);
    }
    if (agentType) {
      params.set('agentType', agentType);
    }
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const ws = new WebSocket(`${wsUrl}?${params}`);
    wsRef.current = ws;
    connectedKeyRef.current = connectionKey;

    ws.onopen = () => {
      const fitAddon = fitAddonRef.current;
      if (fitAddon) {
        try { fitAddon.fit(); } catch {}
      }
      ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'output') {
          term.write(msg.data);
        } else if (msg.type === 'exit') {
          term.write('\r\n\x1b[33m[Session ended]\x1b[0m\r\n');
        } else if (msg.type === 'file-saved') {
          term.write(`\r\n\x1b[32m[Uploaded: ${msg.filename}]\x1b[0m\r\n`);
        } else if (msg.type === 'file-error') {
          term.write(`\r\n\x1b[31m[Upload failed: ${msg.reason}]\x1b[0m\r\n`);
        }
      } catch {
        term.write(event.data);
      }
    };

    ws.onclose = () => {
      if (connectedKeyRef.current === connectionKey) {
        term.write('\r\n\x1b[31m[Disconnected]\x1b[0m\r\n');
      }
    };

    const dataHandler = term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', data }));
      }
    });

    const resizeHandler = term.onResize(({ cols, rows }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'resize', cols, rows }));
      }
    });

    return () => {
      dataHandler.dispose();
      resizeHandler.dispose();
    };
  }, [siteId, envId, type, claudeMode, agentType]);

  // Re-fit on visibility change
  useEffect(() => {
    if (visible && fitAddonRef.current) {
      setTimeout(() => {
        try { fitAddonRef.current?.fit(); } catch {}
      }, 50);
    }
  }, [visible]);

  // Drag-and-drop file upload
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current++;
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current--;
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);
      const files = e.dataTransfer?.files;
      if (files) {
        for (let i = 0; i < files.length; i++) {
          sendFile(files[i]);
        }
      }
    };

    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('dragenter', handleDragEnter);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('drop', handleDrop);

    return () => {
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('dragenter', handleDragEnter);
      container.removeEventListener('dragleave', handleDragLeave);
      container.removeEventListener('drop', handleDrop);
    };
  }, [sendFile]);

  // Clipboard paste for image files (capture phase, before xterm)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const fileItems: DataTransferItem[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          fileItems.push(items[i]);
        }
      }

      // Only intercept if there are file items
      if (fileItems.length === 0) return;

      e.preventDefault();
      e.stopPropagation();
      for (const item of fileItems) {
        const file = item.getAsFile();
        if (file) sendFile(file);
      }
    };

    // Capture phase so we run before xterm's paste handler
    container.addEventListener('paste', handlePaste, true);
    return () => {
      container.removeEventListener('paste', handlePaste, true);
    };
  }, [sendFile]);

  return (
    <div className={`relative w-full h-full ${visible ? '' : 'hidden'}`}>
      <div
        ref={containerRef}
        className="terminal-container w-full h-full"
      />
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 border-2 border-dashed border-blue-400 rounded-lg pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-sm font-medium">Drop file to upload</span>
          </div>
        </div>
      )}
    </div>
  );
});

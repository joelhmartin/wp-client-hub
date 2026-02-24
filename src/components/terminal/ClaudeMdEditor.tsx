'use client';

import { useState, useEffect, useCallback } from 'react';

interface ClaudeMdEditorProps {
  siteId: string;
  siteName: string;
}

type InnerTab = 'site' | 'global';

export function ClaudeMdEditor({ siteId, siteName }: ClaudeMdEditorProps) {
  const [innerTab, setInnerTab] = useState<InnerTab>('site');
  const [siteContent, setSiteContent] = useState('');
  const [globalContent, setGlobalContent] = useState('');
  const [siteOriginal, setSiteOriginal] = useState('');
  const [globalOriginal, setGlobalOriginal] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDirty = innerTab === 'site'
    ? siteContent !== siteOriginal
    : globalContent !== globalOriginal;

  const fetchContent = useCallback(async () => {
    setLoadError(null);
    try {
      const [siteRes, globalRes] = await Promise.all([
        fetch(`/api/claude-md/sites/${siteId}`),
        fetch('/api/claude-md/global'),
      ]);
      const siteData = await siteRes.json();
      const globalData = await globalRes.json();
      setSiteContent(siteData.content ?? '');
      setSiteOriginal(siteData.content ?? '');
      setGlobalContent(globalData.content ?? '');
      setGlobalOriginal(globalData.content ?? '');
    } catch (err) {
      setLoadError('Failed to load CLAUDE.md files');
      console.error(err);
    }
  }, [siteId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (innerTab === 'site') {
        const res = await fetch(`/api/claude-md/sites/${siteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: siteContent }),
        });
        if (!res.ok) throw new Error('Save failed');
        setSiteOriginal(siteContent);
      } else {
        const res = await fetch('/api/claude-md/global', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: globalContent }),
        });
        if (!res.ok) throw new Error('Save failed');
        setGlobalOriginal(globalContent);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const content = innerTab === 'site' ? siteContent : globalContent;
  const setContent = innerTab === 'site' ? setSiteContent : setGlobalContent;

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Inner tab bar */}
      <div className="flex items-center justify-between border-b border-border bg-bg-secondary px-3">
        <div className="flex">
          <button
            onClick={() => setInnerTab('site')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              innerTab === 'site'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Site Instructions
          </button>
          <button
            onClick={() => setInnerTab('global')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              innerTab === 'global'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Global Instructions
          </button>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs text-warning">Unsaved changes</span>
          )}
          <button
            onClick={fetchContent}
            className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
            title="Reload from disk"
          >
            Reload
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              isDirty && !saving
                ? 'bg-accent text-white hover:bg-accent/80'
                : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="px-3 py-2 text-xs text-text-muted border-b border-border">
        {innerTab === 'site' ? (
          <>Instructions loaded only for <strong>{siteName}</strong> Claude Code sessions.</>
        ) : (
          <>Instructions loaded into <strong>every</strong> Claude Code session across all sites.</>
        )}
      </div>

      {/* Editor */}
      {loadError ? (
        <div className="flex-1 flex items-center justify-center text-danger text-sm">
          {loadError}
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            innerTab === 'site'
              ? `# Instructions for ${siteName}\n\nAdd site-specific instructions here...`
              : '# Global Instructions\n\nAdd instructions for all Claude Code sessions...'
          }
          className="flex-1 w-full p-3 bg-bg-primary text-text-primary font-mono text-sm resize-none outline-none placeholder:text-text-muted/50"
          spellCheck={false}
        />
      )}
    </div>
  );
}

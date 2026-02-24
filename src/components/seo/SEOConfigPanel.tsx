'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SEOSiteConfig, EnabledFeatures } from '@/lib/seo/types';

interface SEOConfigPanelProps {
  siteId: string;
  envId: string;
}

const DEFAULT_FEATURES: EnabledFeatures = {
  title_optimization: true,
  meta_description: true,
  internal_linking: true,
  schema_markup: false,
  redirect_management: false,
};

export function SEOConfigPanel({ siteId, envId }: SEOConfigPanelProps) {
  const [config, setConfig] = useState<SEOSiteConfig | null>(null);
  const [semrushDomain, setSemrushDomain] = useState('');
  const [features, setFeatures] = useState<EnabledFeatures>(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/seo/config/${siteId}?envId=${envId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
          setSemrushDomain(data.config.semrush_domain || '');
          setFeatures(data.config.enabled_features || DEFAULT_FEATURES);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [siteId, envId]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/seo/config/${siteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          envId,
          semrush_domain: semrushDomain || null,
          enabled_features: features,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = (key: keyof EnabledFeatures) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return <div className="text-sm text-text-muted">Loading config...</div>;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-lg font-semibold text-text-primary">SEO Configuration</h2>

      {/* SEMrush Domain */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">SEMrush Domain</label>
        <input
          type="text"
          value={semrushDomain}
          onChange={(e) => setSemrushDomain(e.target.value)}
          placeholder="example.com"
          className="w-full text-sm bg-bg-secondary border border-border rounded px-3 py-2 text-text-primary placeholder:text-text-muted"
        />
        <p className="text-xs text-text-muted">
          Domain for SEMrush keyword data. Leave empty to skip SEMrush integration.
        </p>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-text-primary">Enabled Features</label>
        {(Object.keys(features) as (keyof EnabledFeatures)[]).map((key) => (
          <label key={key} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={features[key]}
              onChange={() => toggleFeature(key)}
              className="accent-accent"
            />
            <span className="text-text-secondary">
              {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 text-sm font-medium bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving...' : 'Save Configuration'}
      </button>
    </div>
  );
}

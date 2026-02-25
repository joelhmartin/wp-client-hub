'use client';

import type { SiteListItem } from '@/lib/types';

interface SidebarSiteItemProps {
  site: SiteListItem;
  isActive: boolean;
  onSelect: (site: SiteListItem, envId: string, envName: string, primaryDomain?: string | null) => void;
}

export function SidebarSiteItem({ site, isActive, onSelect }: SidebarSiteItemProps) {
  const liveEnv = site.environments.find((e) => e.is_live);
  const hasMultipleEnvs = site.environments.length > 1;

  const handleClick = () => {
    if (hasMultipleEnvs) return; // handled by env buttons
    const env = liveEnv || site.environments[0];
    if (env) onSelect(site, env.id, env.environment_name, env.primary_domain);
  };

  return (
    <div
      className={`px-3 py-2 cursor-pointer border-l-2 transition-colors ${
        isActive
          ? 'border-accent bg-bg-tertiary/50'
          : 'border-transparent hover:bg-bg-tertiary/30'
      }`}
      onClick={handleClick}
    >
      <div
        className="text-sm font-medium text-text-primary truncate"
        title={site.site_name}
      >
        {site.site_name}
      </div>
      {hasMultipleEnvs ? (
        <div className="flex gap-1 mt-1">
          {site.environments.map((env) => (
            <button
              key={env.id}
              onClick={() => onSelect(site, env.id, env.environment_name, env.primary_domain)}
              className={`text-xs px-1.5 py-0.5 rounded ${
                env.is_live
                  ? 'bg-success/20 text-success hover:bg-success/30'
                  : 'bg-warning/20 text-warning hover:bg-warning/30'
              }`}
            >
              {env.environment_name}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex gap-1 mt-1">
          {site.environments.map((env) => (
            <span
              key={env.id}
              className={`text-xs px-1.5 py-0.5 rounded ${
                env.is_live ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
              }`}
            >
              {env.environment_name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

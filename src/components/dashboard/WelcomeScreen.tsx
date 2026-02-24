'use client';

export function WelcomeScreen() {
  return (
    <div className="flex-1 flex items-center justify-center bg-bg-primary">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-text-primary mb-2">WP Client Hub</h2>
        <p className="text-text-secondary mb-6">
          Select a site from the sidebar to open terminals.
        </p>
        <div className="text-text-muted text-sm space-y-2">
          <p>Click a site name to connect to its Live environment</p>
          <p>For sites with multiple environments, click the environment badge</p>
          <p>Each connection opens Claude Code and SSH terminal tabs</p>
        </div>
      </div>
    </div>
  );
}

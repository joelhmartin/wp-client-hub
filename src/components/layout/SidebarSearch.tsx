'use client';

interface SidebarSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function SidebarSearch({ value, onChange }: SidebarSearchProps) {
  return (
    <div className="p-3">
      <input
        type="text"
        placeholder="Search sites..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-bg-tertiary text-text-primary placeholder-text-muted rounded-md border border-border focus:outline-none focus:border-accent text-sm"
      />
    </div>
  );
}

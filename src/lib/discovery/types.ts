// ─── Site Discovery Types ───

export interface SiteDiscoveryData {
  // Basic info
  siteUrl: string;
  siteTitle: string;
  wpVersion: string;
  phpVersion: string;
  isMultisite: boolean;

  // Theme info
  themes: ThemeInfo;

  // Plugins
  plugins: PluginInfo[];

  // Custom post types (non-built-in only)
  customPostTypes: CustomPostType[];

  // Debugging
  debugging: DebuggingInfo;

  // SSH/hosting details
  sshDetails: SSHDetails;

  // Scan metadata
  scannedAt: string;
  scanDurationMs: number;
}

export interface ThemeInfo {
  activeTheme: string;
  parentTheme: string | null;    // non-null if child theme is active
  childTheme: string | null;     // the child theme slug
  isDivi: boolean;
  diviVersion: string | null;
  childThemePath: string | null; // e.g., /wp-content/themes/child-theme/
}

export interface PluginInfo {
  name: string;
  status: 'active' | 'inactive' | 'must-use' | 'dropin';
  version: string;
  updateAvailable: boolean;
}

export interface CustomPostType {
  name: string;
  label: string;
  isPublic: boolean;
  hasArchive: boolean;
}

export interface DebuggingInfo {
  wpDebug: boolean;
  wpDebugLog: boolean;
  wpDebugDisplay: boolean;
}

export interface SSHDetails {
  host: string;
  port: number;
  username: string;
  wpPath: string;
}

// Scan metadata stored in DB
export interface ScanMetadata {
  site_id: string;
  last_scan_at: string | null;
  last_scan_status: 'pending' | 'running' | 'completed' | 'failed';
  last_scan_error: string | null;
  scan_data_json: string | null;
}

// Scan progress tracking
export interface ScanProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: string | null; // site name currently scanning
  startedAt: string;
}

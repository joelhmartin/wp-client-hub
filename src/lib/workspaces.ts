import path from 'path';
import fs from 'fs';

const WORKSPACES_DIR = path.join(process.cwd(), 'data', 'workspaces');

export function getWorkspacesDir(): string {
  return WORKSPACES_DIR;
}

export function getSiteWorkspaceDir(siteId: string): string {
  return path.join(WORKSPACES_DIR, siteId);
}

export function ensureSiteWorkspace(siteId: string): string {
  const dir = getSiteWorkspaceDir(siteId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getGlobalClaudeMdPath(): string {
  return path.join(WORKSPACES_DIR, 'CLAUDE.md');
}

export function getSiteClaudeMdPath(siteId: string): string {
  return path.join(getSiteWorkspaceDir(siteId), 'CLAUDE.md');
}

export function readClaudeMd(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

export function writeClaudeMd(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

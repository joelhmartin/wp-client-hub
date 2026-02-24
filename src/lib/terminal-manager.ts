import * as pty from 'node-pty';
import { v4 as uuidv4 } from 'uuid';
import { ensureSiteWorkspace, readClaudeMd, getGlobalClaudeMdPath, getSiteClaudeMdPath } from './workspaces';

export interface TerminalProcess {
  sessionId: string;
  siteId: string;
  envId: string;
  type: 'claude' | 'ssh';
  siteName: string;
  envName: string;
  ptyProcess: pty.IPty;
  createdAt: Date;
}

class TerminalManager {
  private sessions: Map<string, TerminalProcess> = new Map();

  spawn(opts: {
    siteId: string;
    envId: string;
    type: 'claude' | 'ssh';
    siteName: string;
    envName: string;
    sshHost: string;
    sshPort: number;
    sshUsername: string;
    sshPassword: string;
  }): string {
    const sessionId = uuidv4();
    const env = {
      ...process.env,
      SSHPASS: opts.sshPassword,
      TERM: 'xterm-256color',
    };

    let shell: string;
    let args: string[];

    if (opts.type === 'claude') {
      const systemPrompt = [
        `You are connected to the WordPress site "${opts.siteName}" (${opts.envName} environment).`,
        `To SSH into this server, run: sshpass -e ssh -o StrictHostKeyChecking=no -p ${opts.sshPort} ${opts.sshUsername}@${opts.sshHost}`,
        `The SSHPASS environment variable is already set with the SSH password.`,
        `Once connected, you can use WP-CLI commands like: wp plugin list, wp theme list, wp option get siteurl, etc.`,
        `Always use the full sshpass command above to connect - do not ask the user for credentials.`,
      ].join('\n');

      shell = '/Users/bif/.local/bin/claude';
      args = ['--system-prompt', systemPrompt];

      // Inject global CLAUDE.md instructions
      const globalContent = readClaudeMd(getGlobalClaudeMdPath());
      if (globalContent) {
        args.push('--append-system-prompt', globalContent);
      }

      // Inject site-specific CLAUDE.md instructions
      const siteContent = readClaudeMd(getSiteClaudeMdPath(opts.siteId));
      if (siteContent) {
        args.push('--append-system-prompt', siteContent);
      }
    } else {
      shell = '/opt/homebrew/bin/sshpass';
      args = [
        '-e', 'ssh',
        '-o', 'StrictHostKeyChecking=no',
        '-p', String(opts.sshPort),
        `${opts.sshUsername}@${opts.sshHost}`,
      ];
    }

    const cwd = opts.type === 'claude'
      ? ensureSiteWorkspace(opts.siteId)
      : process.env.HOME || '/tmp';

    const ptyProcess = pty.spawn(shell, args, {
      name: 'xterm-256color',
      cols: 120,
      rows: 30,
      cwd,
      env: env as Record<string, string>,
    });

    const session: TerminalProcess = {
      sessionId,
      siteId: opts.siteId,
      envId: opts.envId,
      type: opts.type,
      siteName: opts.siteName,
      envName: opts.envName,
      ptyProcess,
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);

    ptyProcess.onExit(() => {
      this.sessions.delete(sessionId);
    });

    return sessionId;
  }

  get(sessionId: string): TerminalProcess | undefined {
    return this.sessions.get(sessionId);
  }

  kill(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.ptyProcess.kill();
    this.sessions.delete(sessionId);
    return true;
  }

  listSessions(): Omit<TerminalProcess, 'ptyProcess'>[] {
    return Array.from(this.sessions.values()).map(({ ptyProcess, ...rest }) => rest);
  }

  killAll(): void {
    for (const [id, session] of this.sessions) {
      try { session.ptyProcess.kill(); } catch {}
      this.sessions.delete(id);
    }
  }

  resize(sessionId: string, cols: number, rows: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.ptyProcess.resize(cols, rows);
    return true;
  }
}

// Singleton
export const terminalManager = new TerminalManager();

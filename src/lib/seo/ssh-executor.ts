import { execFile } from 'child_process';
import { getEnvironment, setEnvironmentPassword } from '../db/sites';
import { encryptPassword } from '../db';
import { getSSHPassword } from '../kinsta-api';
import type { SSHExecResult, SSHConnectionInfo } from './types';

const SSHPASS_PATH = '/opt/homebrew/bin/sshpass';
const DEFAULT_TIMEOUT_MS = 30000;

export async function sshExec(
  conn: SSHConnectionInfo,
  remoteCommand: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<SSHExecResult> {
  const startTime = Date.now();

  return new Promise((resolve) => {
    const child = execFile(
      SSHPASS_PATH,
      [
        '-e',
        'ssh',
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'ConnectTimeout=10',
        '-p', String(conn.port),
        `${conn.username}@${conn.host}`,
        remoteCommand,
      ],
      {
        env: { ...process.env, SSHPASS: conn.password },
        timeout: timeoutMs,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      },
      (error, stdout, stderr) => {
        const durationMs = Date.now() - startTime;
        const exitCode = error ? (error as NodeJS.ErrnoException & { code?: number | string }).code === 'ETIMEDOUT'
          ? 124
          : (error as { code?: number }).code ?? 1
          : 0;

        resolve({
          stdout: typeof stdout === 'string' ? stdout : '',
          stderr: typeof stderr === 'string' ? stderr : '',
          exitCode: typeof exitCode === 'number' ? exitCode : 1,
          durationMs,
        });
      }
    );

    // Safety: kill on timeout
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
    }, timeoutMs + 1000);

    child.on('close', () => clearTimeout(timer));
  });
}

export function buildSSHConnection(env: {
  ssh_host: string;
  ssh_ip: string;
  ssh_port: number;
  ssh_username: string;
  ssh_password: string | null;
}): SSHConnectionInfo {
  const password = env.ssh_password || process.env.KINSTA_USER_PASSWORD || '';
  return {
    host: env.ssh_ip || env.ssh_host,
    port: env.ssh_port,
    username: env.ssh_username,
    password,
  };
}

/**
 * Resolves SSH connection for an environment, fetching password from Kinsta API if needed.
 */
export async function resolveSSHConnection(envId: string): Promise<SSHConnectionInfo> {
  const env = getEnvironment(envId);
  if (!env) throw new Error(`Environment ${envId} not found`);

  if (!env.ssh_password) {
    try {
      const password = await getSSHPassword(envId);
      if (password) {
        env.ssh_password = password;
        setEnvironmentPassword(envId, encryptPassword(password));
        console.log(`[SEO SSH] Fetched and cached password for ${envId}`);
      }
    } catch (err) {
      console.error(`[SEO SSH] Failed to fetch password for ${envId}:`, err);
    }
  }

  return buildSSHConnection(env);
}

import { WebSocketServer, WebSocket } from 'ws';
import * as pty from 'node-pty';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { getDb } from '../src/lib/db';
import { getEnvironment, getSiteWithEnvironments, setEnvironmentPassword } from '../src/lib/db/sites';
import { encryptPassword } from '../src/lib/db';
import { getSSHPassword } from '../src/lib/kinsta-api';
import { ensureSiteWorkspace, readClaudeMd, getGlobalClaudeMdPath, getSiteClaudeMdPath } from '../src/lib/workspaces';
import { composeAgentSystemPrompt, isAgentType } from '../src/lib/agent-prompts';
import 'dotenv/config';

const PORT = 3001;
const wss = new WebSocketServer({ port: PORT, host: 'localhost' });

// Track active pty processes for cleanup
const activePtys = new Map<string, pty.IPty>();

// Track uploaded files per session for cleanup on disconnect
const sessionUploadedFiles = new Map<WebSocket, string[]>();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function handleFileUpload(
  ws: WebSocket,
  siteId: string,
  filename: string,
  base64Data: string,
  ptyProcess: pty.IPty
): void {
  try {
    // Sanitize filename
    const basename = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(basename);
    const name = path.basename(basename, ext);
    const uniqueSuffix = crypto.randomBytes(4).toString('hex');
    const safeFilename = `${name}-${uniqueSuffix}${ext}`;

    // Decode base64
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length > MAX_FILE_SIZE) {
      ws.send(JSON.stringify({ type: 'file-error', reason: 'File exceeds 10MB limit' }));
      return;
    }

    // Write to uploads dir inside site workspace
    const uploadsDir = path.join(ensureSiteWorkspace(siteId), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, safeFilename);
    fs.writeFileSync(filePath, buffer);

    // Track for cleanup
    const files = sessionUploadedFiles.get(ws) || [];
    files.push(filePath);
    sessionUploadedFiles.set(ws, files);

    // Type the escaped path into the PTY (like iTerm2 drag-drop)
    const escapedPath = filePath.replace(/ /g, '\\ ');
    ptyProcess.write(escapedPath);

    ws.send(JSON.stringify({ type: 'file-saved', filename: safeFilename, path: filePath }));
    console.log(`[WS] File uploaded: ${filePath} (${buffer.length} bytes)`);
  } catch (err) {
    console.error(`[WS] File upload error:`, err);
    ws.send(JSON.stringify({ type: 'file-error', reason: String(err) }));
  }
}

function cleanupSessionFiles(ws: WebSocket): void {
  const files = sessionUploadedFiles.get(ws);
  if (!files) return;

  for (const filePath of files) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[WS] Cleaned up uploaded file: ${filePath}`);
      }
      // Try to remove empty uploads dir
      const dir = path.dirname(filePath);
      if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
      }
    } catch {}
  }
  sessionUploadedFiles.delete(ws);
}

console.log(`[WS] WebSocket server listening on ws://localhost:${PORT}`);

// Ensure DB is initialized
getDb();

wss.on('connection', async (ws: WebSocket, req) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const siteId = url.searchParams.get('siteId');
  const envId = url.searchParams.get('envId');
  const termType = url.searchParams.get('type') as 'claude' | 'ssh';
  const claudeMode = url.searchParams.get('claudeMode') || 'regular';
  const agentTypeParam = url.searchParams.get('agentType');

  if (!siteId || !envId || !termType) {
    ws.close(1008, 'Missing siteId, envId, or type');
    return;
  }

  // Look up site and environment from DB
  const site = getSiteWithEnvironments(siteId);
  if (!site) {
    ws.send(JSON.stringify({ type: 'output', data: '\r\n\x1b[31mSite not found\x1b[0m\r\n' }));
    ws.close(1008, 'Site not found');
    return;
  }

  const env = getEnvironment(envId);
  if (!env) {
    ws.send(JSON.stringify({ type: 'output', data: '\r\n\x1b[31mEnvironment not found\x1b[0m\r\n' }));
    ws.close(1008, 'Environment not found');
    return;
  }

  // Get password - try cached first, then Kinsta API
  let password = env.ssh_password;
  if (!password) {
    try {
      password = await getSSHPassword(envId);
      if (password) {
        setEnvironmentPassword(envId, encryptPassword(password));
      }
    } catch (err) {
      console.error(`[WS] Failed to fetch password for ${envId}:`, err);
    }
  }
  if (!password) {
    console.error(`[WS] No SSH password available for ${envId}`);
    ws.send(JSON.stringify({ type: 'output', data: '\r\n\x1b[31mNo SSH password available. Try pulling credentials first.\x1b[0m\r\n' }));
    ws.close(1008, 'No password');
    return;
  }

  // Build spawn command
  let shell: string;
  let args: string[];

  if (termType === 'claude') {
    const sshCommand = `sshpass -e ssh -o StrictHostKeyChecking=no -p ${env.ssh_port} ${env.ssh_username}@${env.ssh_host}`;

    let systemPrompt: string;
    if (isAgentType(agentTypeParam)) {
      // Specialized agent: compose base + agent-specific + site context prompt
      systemPrompt = composeAgentSystemPrompt(agentTypeParam, {
        siteName: site.site_name,
        envName: env.environment_name,
        sshCommand,
      });
      console.log(`[WS] Using ${agentTypeParam} agent prompt (${systemPrompt.length} chars)`);
    } else {
      // Default Claude Code tab: original system prompt
      systemPrompt = [
        `You are connected to the WordPress site "${site.site_name}" (${env.environment_name} environment).`,
        `To SSH into this server, run: ${sshCommand}`,
        `The SSHPASS environment variable is already set with the SSH password.`,
        `Once connected, you can use WP-CLI commands like: wp plugin list, wp theme list, wp option get siteurl, etc.`,
        `Always use the full sshpass command above to connect - do not ask the user for credentials.`,
      ].join('\n');
    }

    shell = '/Users/bif/.local/bin/claude';
    args = ['--system-prompt', systemPrompt];

    if (claudeMode === 'skip-permissions') {
      args.push('--dangerously-skip-permissions');
    }

    // Inject global CLAUDE.md instructions
    const globalPath = getGlobalClaudeMdPath();
    const globalContent = readClaudeMd(globalPath);
    if (globalContent) {
      args.push('--append-system-prompt', globalContent);
      console.log(`[WS] Injected global CLAUDE.md (${globalContent.length} chars) from ${globalPath}`);
    } else {
      console.warn(`[WS] No global CLAUDE.md found at ${globalPath}`);
    }

    // Inject site-specific CLAUDE.md instructions
    const sitePath = getSiteClaudeMdPath(siteId);
    const siteContent = readClaudeMd(sitePath);
    if (siteContent) {
      args.push('--append-system-prompt', siteContent);
      console.log(`[WS] Injected site CLAUDE.md (${siteContent.length} chars) from ${sitePath}`);
    }
  } else {
    shell = '/opt/homebrew/bin/sshpass';
    args = [
      '-e', 'ssh',
      '-o', 'StrictHostKeyChecking=no',
      '-p', String(env.ssh_port),
      `${env.ssh_username}@${env.ssh_host}`,
    ];
  }

  const termLabel = agentTypeParam ? `${termType}:${agentTypeParam}` : termType;
  console.log(`[WS] Spawning ${termLabel} terminal for ${site.site_name} (${env.environment_name})`);

  // Set cwd to site workspace for Claude spawns so it picks up CLAUDE.md
  const cwd = termType === 'claude'
    ? ensureSiteWorkspace(siteId)
    : process.env.HOME || '/tmp';

  let ptyProcess: pty.IPty;
  try {
    ptyProcess = pty.spawn(shell, args, {
      name: 'xterm-256color',
      cols: 120,
      rows: 30,
      cwd,
      env: {
        ...process.env,
        SSHPASS: password,
        TERM: 'xterm-256color',
      } as Record<string, string>,
    });
  } catch (err) {
    console.error(`[WS] Failed to spawn pty:`, err);
    ws.send(JSON.stringify({ type: 'output', data: `\r\n\x1b[31mFailed to spawn terminal: ${err}\x1b[0m\r\n` }));
    ws.close(1011, 'Spawn failed');
    return;
  }

  const ptyId = `${siteId}-${envId}-${termType}${agentTypeParam ? `-${agentTypeParam}` : ''}`;
  activePtys.set(ptyId, ptyProcess);

  // PTY → Browser
  const dataHandler = ptyProcess.onData((data: string) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'output', data }));
    }
  });

  // Browser → PTY
  ws.on('message', (msg: Buffer | string) => {
    try {
      const parsed = JSON.parse(msg.toString());
      if (parsed.type === 'input') {
        ptyProcess.write(parsed.data);
      } else if (parsed.type === 'resize') {
        ptyProcess.resize(parsed.cols, parsed.rows);
      } else if (parsed.type === 'file') {
        handleFileUpload(ws, siteId, parsed.filename, parsed.data, ptyProcess);
      }
    } catch {
      ptyProcess.write(msg.toString());
    }
  });

  const exitHandler = ptyProcess.onExit(({ exitCode }) => {
    console.log(`[WS] PTY exited for ${site.site_name} (${termType}) with code ${exitCode}`);
    activePtys.delete(ptyId);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'exit', exitCode }));
      ws.close();
    }
  });

  ws.on('close', () => {
    console.log(`[WS] Client disconnected from ${site.site_name} (${termType})`);
    dataHandler.dispose();
    exitHandler.dispose();
    // Kill the pty when browser disconnects
    try { ptyProcess.kill(); } catch {}
    activePtys.delete(ptyId);
    cleanupSessionFiles(ws);
  });
});

// Graceful shutdown
function shutdown() {
  console.log('[WS] Shutting down...');
  for (const [id, p] of activePtys) {
    try { p.kill(); } catch {}
  }
  activePtys.clear();
  for (const ws of sessionUploadedFiles.keys()) {
    cleanupSessionFiles(ws);
  }
  wss.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

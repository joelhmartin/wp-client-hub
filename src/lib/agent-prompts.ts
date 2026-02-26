import fs from 'fs';
import path from 'path';

export type AgentType = 'security' | 'seo-agent' | 'divi';

const AGENT_PROMPTS_DIR = path.join(process.cwd(), 'data', 'agent-prompts');

const AGENT_FILE_MAP: Record<AgentType, string> = {
  security: 'wordpress-security.md',
  'seo-agent': 'seo-expert.md',
  divi: 'divi-expert.md',
};

function readPromptFile(filename: string): string {
  try {
    return fs.readFileSync(path.join(AGENT_PROMPTS_DIR, filename), 'utf-8');
  } catch {
    return '';
  }
}

export function composeAgentSystemPrompt(
  agentType: AgentType,
  siteContext: {
    siteName: string;
    envName: string;
    sshCommand: string;
  }
): string {
  const base = readPromptFile('base.md');
  const agent = readPromptFile(AGENT_FILE_MAP[agentType]);

  const context = [
    `## Active Site Context`,
    `- **Site**: ${siteContext.siteName}`,
    `- **Environment**: ${siteContext.envName}`,
    `- **SSH Command**: \`${siteContext.sshCommand}\``,
    `- The SSHPASS environment variable is already set with the SSH password.`,
    `- Always use the full sshpass command above to connect — do not ask the user for credentials.`,
  ].join('\n');

  return [base, agent, context].filter(Boolean).join('\n\n---\n\n');
}

const VALID_AGENT_TYPES = new Set<string>(['security', 'seo-agent', 'divi']);

export function isAgentType(value: string | null | undefined): value is AgentType {
  return typeof value === 'string' && VALID_AGENT_TYPES.has(value);
}

const KINSTA_API_BASE = 'https://api.kinsta.com/v2';

function getHeaders(): Record<string, string> {
  const apiKey = process.env.KINSTA_API_KEY;
  if (!apiKey) throw new Error('KINSTA_API_KEY not set');
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

export interface KinstaListSite {
  id: string;
  name: string;
  display_name: string;
  environments: {
    id: string;
    name: string;
    display_name: string;
    is_premium: boolean;
  }[];
}

export async function listAllSites(): Promise<KinstaListSite[]> {
  const agencyId = process.env.KINSTA_AGENCY_ID;
  if (!agencyId) throw new Error('KINSTA_AGENCY_ID not set');

  const res = await fetch(
    `${KINSTA_API_BASE}/sites?company=${agencyId}`,
    { headers: getHeaders() }
  );

  if (!res.ok) {
    throw new Error(`Kinsta API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.company?.sites || [];
}

export interface KinstaEnvDetail {
  id: string;
  name: string;
  display_name: string;
  is_premium: boolean;
  primary_domain?: { name: string };
  ssh_connection?: {
    ssh_ip: { external_ip: string };
    ssh_port: number;
  };
  container_info?: {
    ssh_username: string;
  };
}

export async function getEnvironmentDetail(envId: string): Promise<KinstaEnvDetail> {
  const res = await fetch(
    `${KINSTA_API_BASE}/sites/environments/${envId}`,
    { headers: getHeaders() }
  );

  if (!res.ok) {
    throw new Error(`Kinsta API error getting env ${envId}: ${res.status}`);
  }

  const data = await res.json();
  return data.site?.environment || data.environment;
}

export interface PushEnvironmentResponse {
  operation_id: string;
  message: string;
  status: number;
}

export async function pushEnvironment(
  siteId: string,
  sourceEnvId: string,
  targetEnvId: string
): Promise<PushEnvironmentResponse> {
  const res = await fetch(
    `${KINSTA_API_BASE}/sites/${siteId}/environments`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        source_environment: sourceEnvId,
        target_environment: targetEnvId,
        push_db: true,
        push_files: true,
        run_search_and_replace: true,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Kinsta push failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    operation_id: data.operation_id,
    message: data.message || 'Push started',
    status: res.status,
  };
}

export interface OperationStatusResponse {
  status: string;
  message: string;
}

export async function getOperationStatus(operationId: string): Promise<OperationStatusResponse> {
  const res = await fetch(
    `${KINSTA_API_BASE}/operations/${operationId}`,
    { headers: getHeaders() }
  );

  // Kinsta delays operation registration by a few seconds — treat 404 as in-progress
  if (res.status === 404) {
    return { status: 'in_progress', message: 'Operation pending registration' };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Kinsta operation status failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    status: data.status || 'unknown',
    message: data.message || '',
  };
}

export async function getSSHPassword(envId: string, retries = 3): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(
        `${KINSTA_API_BASE}/sites/environments/${envId}/ssh/password`,
        { headers: getHeaders() }
      );

      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        console.warn(`[Kinsta API] ${res.status} for ${envId}, retrying in ${delay}ms (attempt ${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error(`[Kinsta API] Failed to get SSH password for ${envId}: ${res.status} ${text}`);
        return null;
      }

      const data = await res.json();
      return data.environment?.sftp_password ||
             data.password ||
             null;
    } catch (err) {
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        console.warn(`[Kinsta API] Network error for ${envId}, retrying in ${delay}ms (attempt ${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      console.error(`[Kinsta API] Error fetching SSH password for ${envId} after ${retries} attempts:`, err);
      return null;
    }
  }
  return null;
}

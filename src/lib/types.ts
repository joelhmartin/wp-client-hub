export interface Site {
  id: string;
  site_name: string;
  created_at: string;
  updated_at: string;
  environments: Environment[];
}

export interface Environment {
  id: string;
  site_id: string;
  environment_name: string;
  primary_domain: string | null;
  ssh_host: string;
  ssh_ip: string;
  ssh_port: number;
  ssh_username: string;
  ssh_password: string | null;
  ssh_command: string;
  is_live: number;
}

export interface SiteListItem {
  id: string;
  site_name: string;
  environments: Pick<Environment, 'id' | 'environment_name' | 'is_live'>[];
}

export interface TerminalSession {
  sessionId: string;
  siteId: string;
  envId: string;
  type: 'claude' | 'ssh';
  siteName: string;
  envName: string;
}

export interface SpawnRequest {
  siteId: string;
  envId: string;
  type: 'claude' | 'ssh';
}

export interface SpawnResponse {
  sessionId: string;
  type: 'claude' | 'ssh';
}

export interface KinstaSiteResponse {
  company: {
    sites: KinstaSite[];
  };
}

export interface KinstaSite {
  id: string;
  name: string;
  environments: KinstaEnvironment[];
}

export interface KinstaEnvironment {
  id: string;
  name: string;
  is_premium: boolean;
  primary_domain?: {
    name: string;
  };
  ssh_connection?: {
    ssh_ip: {
      external_ip: string;
    };
    ssh_port: number;
  };
}

export interface KinstaSSHInfo {
  environment: {
    ssh_connection: {
      ssh_ip: {
        external_ip: string;
      };
      ssh_port: number;
    };
    container_info: {
      ssh_username: string;
    };
    primary_domain: {
      name: string;
    };
  };
}

export interface KinstaSFTPPassword {
  environment: {
    container_info: {
      ssh_username: string;
    };
    ssh_connection: {
      sftp_password: string;
    };
  };
}

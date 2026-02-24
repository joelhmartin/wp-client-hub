import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3', 'node-pty', 'pg'],
};

export default nextConfig;

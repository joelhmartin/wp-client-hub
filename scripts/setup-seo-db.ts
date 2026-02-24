import 'dotenv/config';
import { runMigrations } from '../src/lib/seo/migrations';
import { closePool } from '../src/lib/seo/postgres';

async function main() {
  console.log('[SEO Setup] Starting database setup...');
  console.log(`[SEO Setup] Host: ${process.env.POSTGRES_HOST || 'localhost'}`);
  console.log(`[SEO Setup] Port: ${process.env.POSTGRES_PORT || '5432'}`);
  console.log(`[SEO Setup] Database: ${process.env.POSTGRES_DB || 'wp_seo_engine'}`);

  try {
    await runMigrations();
    console.log('[SEO Setup] Database setup complete!');
  } catch (err) {
    console.error('[SEO Setup] Failed:', err);
    process.exit(1);
  } finally {
    await closePool();
  }
}

main();

/**
 * Run migrations 013+ individually (skipping seed files 012, 054).
 * Each migration gets its own connection to avoid cascade failures.
 */
import pg from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

const connectionString = process.env.DATABASE_URL || '';

const SKIP = new Set(['012_seed_data.sql', '054_seed_demo_and_defaults.sql']);

async function main() {
  if (!connectionString) {
    console.error('Missing DATABASE_URL in .env');
    process.exit(1);
  }

  const migrationsDir = join(__dirname, '..', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .filter((f) => {
      const num = parseInt(f.replace(/^0*/, ''), 10);
      return num >= 13 && !SKIP.has(f);
    });

  console.log(`Running ${files.length} migrations individually...\n`);

  let ok = 0;
  let failed = 0;

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
    client.on('error', () => {}); // prevent unhandled error crash
    try {
      await client.connect();
      await client.query(sql);
      console.log(`  ✓ ${file}`);
      ok++;
    } catch (err: any) {
      console.error(`  ✗ ${file}: ${err.message}`);
      failed++;
    } finally {
      await client.end().catch(() => {});
    }
  }

  console.log(`\nDone. ${ok} applied, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main();

/**
 * Run all migrations in order against the database in DATABASE_URL.
 * Usage: npx tsx scripts/run-all-migrations-pg.ts
 * Requires: .env with DATABASE_URL (or SUPABASE_URL + SUPABASE_DB_PASSWORD)
 */
import pg from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
const connectionString =
  process.env.DATABASE_URL ||
  (projectRef
    ? `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.${projectRef}.supabase.co:5432/postgres`
    : '');

async function main() {
  if (!connectionString) {
    console.error('Missing DATABASE_URL or SUPABASE_URL+SUPABASE_DB_PASSWORD in .env');
    process.exit(1);
  }

  const migrationsDir = join(__dirname, '..', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.error('No .sql files in migrations/');
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected.\n');
  } catch (err: any) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }

  let run = 0;
  let failed = 0;
  for (const file of files) {
    const path = join(migrationsDir, file);
    let sql: string;
    try {
      sql = readFileSync(path, 'utf-8');
    } catch {
      console.error(`Skip (unreadable): ${file}`);
      continue;
    }
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`  ✓ ${file}`);
      run++;
    } catch (err: any) {
      await client.query('ROLLBACK').catch(() => {});
      console.error(`  ✗ ${file}: ${err.message}`);
      failed++;
      // Continue to next migration after rolling back the failed one
    }
  }

  await client.end();
  console.log(`\nDone. ${run} applied, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main();

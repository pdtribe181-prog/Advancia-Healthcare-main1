import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not set in .env');
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  const tables = await client.query(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name
  `);
  console.log('\nTables in database (schema.table):\n');
  const bySchema = {};
  for (const r of tables.rows) {
    if (!bySchema[r.table_schema]) bySchema[r.table_schema] = [];
    bySchema[r.table_schema].push(r.table_name);
  }
  for (const [schema, names] of Object.entries(bySchema).sort()) {
    console.log(`  ${schema}: ${names.join(', ')}`);
  }
  console.log('\nRow counts (public schema, approximate):');
  const counts = await client.query(`
    SELECT schemaname, relname AS table_name, n_live_tup AS rows
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY relname
  `);
  for (const row of counts.rows) {
    console.log(`  ${row.table_name}: ${row.rows}`);
  }
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

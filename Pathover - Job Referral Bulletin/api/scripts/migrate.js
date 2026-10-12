import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env');
  process.exit(1);
}

const migrationsDir = path.resolve(__dirname, '../migrations');
const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
    if (isNaN(numA)) return 1; // a has no numeric prefix, run later
    if (isNaN(numB)) return -1;
    return numA - numB;
  });

if (!files.length) {
  console.log('No migration files found');
  process.exit(0);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

console.log('Running migrations...');

try {
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    process.stdout.write(`  → ${file} ... `);
    await pool.query(sql);
    console.log('done');
  }
  console.log('✅ All migrations applied');
} catch (err) {
  console.error('\n❌ Migration failed:', err);
  process.exitCode = 1;
} finally {
  await pool.end();
} 
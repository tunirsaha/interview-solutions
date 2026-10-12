import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  console.error('❌  DATABASE_URL not set in .env');
  process.exit(1);
}

// Parse JSDoc comments from entity files to extract column definitions
function parseEntityFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const columns = [];
    
    for (const line of lines) {
      const match = line.match(/@property\s+\{[^}]+\}\s+(\w+)/);
      if (match) {
        columns.push(match[1]);
      }
    }
    
    return columns;
  } catch (error) {
    console.error(`Error reading entity file ${filePath}:`, error.message);
    return [];
  }
}

// Expected schema based on entity files and migrations
const expected = {
  users: parseEntityFile(path.resolve(__dirname, '../src/entities/user.entity.js')),
  job_lists: ['id', 'user_id', 'title', 'public', 'status', 'created_at', 'updated_at'], // Updated schema
  jobs: ['id', 'job_list_id', 'title', 'apply_link', 'status', 'created_at', 'updated_at'], // Updated schema
  invites: parseEntityFile(path.resolve(__dirname, '../src/entities/invite.entity.js'))
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

let ok = true;

console.log('🔍 Schema sanity-check');
console.log('Cross-checking entity definitions with database schema...\n');

for (const [table, expectedColumns] of Object.entries(expected)) {
  try {
    /* eslint-disable no-await-in-loop */
    const res = await pool.query(
      `SELECT column_name, data_type, is_nullable, column_default 
       FROM information_schema.columns 
       WHERE table_name = $1 
       ORDER BY ordinal_position`,
      [table]
    );
    
    const existingColumns = res.rows.map(r => r.column_name);
    const missing = expectedColumns.filter(c => !existingColumns.includes(c));
    const extra = existingColumns.filter(c => !expectedColumns.includes(c));
    
    if (missing.length || extra.length) {
      ok = false;
      console.error(`❌ ${table}`);
      if (missing.length) {
        console.error(`   Missing columns: ${missing.join(', ')}`);
      }
      if (extra.length) {
        console.error(`   Extra columns: ${extra.join(', ')}`);
      }
    } else {
      console.log(`✅ ${table} (${existingColumns.length} columns)`);
    }
    
    // Show column details for debugging
    if (process.env.DEBUG_SCHEMA) {
      console.log(`   Columns: ${existingColumns.join(', ')}`);
    }
    
  } catch (err) {
    ok = false;
    console.error(`❌ ${table} check failed ->`, err.message);
  }
}

// Additional checks
console.log('\n🔍 Additional checks...');

// Check if required tables exist
const requiredTables = Object.keys(expected);
try {
  const res = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = ANY($1)
  `, [requiredTables]);
  
  const existingTables = res.rows.map(r => r.table_name);
  const missingTables = requiredTables.filter(t => !existingTables.includes(t));
  
  if (missingTables.length) {
    ok = false;
    console.error(`❌ Missing tables: ${missingTables.join(', ')}`);
  } else {
    console.log(`✅ All required tables exist`);
  }
} catch (err) {
  ok = false;
  console.error(`❌ Table existence check failed:`, err.message);
}

// Check foreign key constraints
try {
  const res = await pool.query(`
    SELECT 
      tc.table_name, 
      kcu.column_name, 
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name
  `);
  
  console.log(`✅ Foreign key constraints: ${res.rows.length} found`);
  if (process.env.DEBUG_SCHEMA) {
    res.rows.forEach(row => {
      console.log(`   ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
    });
  }
} catch (err) {
  console.error(`❌ Foreign key check failed:`, err.message);
}

await pool.end();

console.log('\n' + (ok ? '🎉 All schema checks passed!' : '💥 Schema issues found!'));
if (!ok) process.exit(1); 
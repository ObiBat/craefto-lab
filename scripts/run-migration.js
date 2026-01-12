const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'db.vugaieeadequzuplvcqp.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '27u6uhsGIwVwJGIo',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Connecting to database...');

  try {
    const client = await pool.connect();
    console.log('Connected! Running migration...');

    await client.query(sql);
    console.log('Migration completed successfully!');

    client.release();
    await pool.end();
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();

import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? true : false
});

export async function verifyDBConnection() {
  const client = await pool.connect();
  await client.query('SELECT NOW()');
  client.release();
  return true;
}

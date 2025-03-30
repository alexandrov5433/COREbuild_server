import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? true : false,
  idleTimeoutMillis: 10000,  // number of milliseconds a client must sit idle in the pool and not be checked out
  // before it is disconnected from the backend and discarded
  // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle client
  // ---->>> check pg_error_1.txt
});

export async function verifyDBConnection() {
  const client = await pool.connect();
  await client.query('SELECT NOW()');
  client.release();
  return true;
}

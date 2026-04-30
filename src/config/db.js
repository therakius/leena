import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

export const pg = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pg.on('error', (err) => {
  console.error('Unexpected DB pool error:', err);
});

// Patch pg.query with retry logic
const originalQuery = pg.query.bind(pg);
pg.query = async (text, params, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await originalQuery(text, params);
    } catch (err) {
      const isLastAttempt = i === retries - 1;
      const isConnectionError = err.message.includes('timeout') ||
                                err.message.includes('terminated') ||
                                err.message.includes('Connection');
      if (isLastAttempt || !isConnectionError) throw err;
      console.warn(`DB query failed, retrying (${i + 1}/${retries})...`);
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
};
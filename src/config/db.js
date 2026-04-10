import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client: PGClient } = pkg;

export const pg = new PGClient({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// função heartbeat
export const startHeartbeat = (intervalMs = 4 * 60 * 1000) => {
  setInterval(async () => {
    try {
      await pg.query('SELECT 1'); // mantém a conexão viva
      // console.log('DB heartbeat OK');
    } catch (err) {
      console.error('DB heartbeat falhou:', err);
    }
  }, intervalMs);
};
// await pg.connect()
// console.log("connected to the database")
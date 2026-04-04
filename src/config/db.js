import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client: PGClient } = pkg;

export const pg = new PGClient({
    connectionString: process.env.DATABASE_URL
});
// await pg.connect()
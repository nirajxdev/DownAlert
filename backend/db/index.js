import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on("error", (error) => {
    console.error("Error in PostgreSQL connection", error)
});

export default pool;
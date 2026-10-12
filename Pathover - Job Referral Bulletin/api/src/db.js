import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const config = {
  connectionString: process.env.DATABASE_URL,
};

if (process.env.DATABASE_SSL === 'true') {
  config.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(config);

export const query = (text, params) => pool.query(text, params);

export default pool; 
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const client = drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;

export const db = { client, schema };
export default db;

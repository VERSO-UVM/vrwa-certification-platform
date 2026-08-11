import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { relations } from "./relations";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const client = drizzle({ client: pool, relations });

export const db = { client, schema };
export type Database = typeof db;
export default db;

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as tables from "./schema";
import * as views from "./views";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Define one schema object with all DB objects for Drizzle
const schema = {
  ...tables,
  ...views,
};

const client = drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;

export const db = { client, schema };
export type Database = typeof db;
export default db;

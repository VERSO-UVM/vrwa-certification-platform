import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql, { type Pool, type PoolOptions } from "mysql2";
import fs from "node:fs";
import * as schema from "./schema";
import { relations } from "./relations";

function poolOptionsFromDatabaseUrl(urlString: string): PoolOptions {
  const url = new URL(urlString);
  if (url.protocol !== "mysql:" && url.protocol !== "mysql2:") {
    throw new Error(
      `DATABASE_URL must use mysql:// (got ${url.protocol}). ` +
        `URL-encode special characters in the password (e.g. < → %3C, ) → %29).`,
    );
  }

  const options: PoolOptions = {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    // Store and read TIMESTAMP values as UTC
    timezone: "Z",
  };

  // Match ~/.my.cnf ssl-ca for hosted MySQL (e.g. UVM webdb)
  const sslCaPath =
    process.env.DATABASE_SSL_CA || url.searchParams.get("ssl-ca");
  if (sslCaPath) {
    options.ssl = {
      ca: fs.readFileSync(sslCaPath),
      rejectUnauthorized: true,
    };
  }

  return options;
}

// Use the callback-style pool: Drizzle calls .promise() and needs pool.config.
const pool: Pool = mysql.createPool(
  poolOptionsFromDatabaseUrl(process.env.DATABASE_URL!),
);

const client: MySql2Database<typeof relations> = drizzle({
  client: pool,
  relations,
});

export const db: { client: typeof client; schema: typeof schema } = {
  client,
  schema,
};
export type Database = typeof db;
export default db;

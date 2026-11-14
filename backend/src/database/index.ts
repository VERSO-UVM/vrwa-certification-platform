import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql, { type Pool, type PoolOptions } from "mysql2";
import fs from "node:fs";
import * as schema from "./schema";
import { relations } from "./relations";

function poolOptionsFromDatabaseUrl(urlString: string): PoolOptions {
  const url = new URL(urlString);
  if (url.protocol !== "mysql:" && url.protocol !== "mysql2:") {
    throw new Error("Expected mysql, got " + url.protocol);
  }

  const options: PoolOptions = {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    timezone: "Z", // UTC
  };

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

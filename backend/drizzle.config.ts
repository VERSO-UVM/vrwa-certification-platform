import "dotenv/config";
import fs from "node:fs";
import { defineConfig } from "drizzle-kit";

const url = new URL(process.env.DATABASE_URL!);
const sslCaPath = process.env.DATABASE_SSL_CA || url.searchParams.get("ssl-ca");

export default defineConfig({
  out: "./drizzle",
  schema: "./src/database/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ...(sslCaPath
      ? {
          ssl: {
            // drizzle-kit expects string CA contents, not a Buffer
            ca: fs.readFileSync(sslCaPath, "utf8"),
            rejectUnauthorized: true,
          },
        }
      : {}),
  },
});

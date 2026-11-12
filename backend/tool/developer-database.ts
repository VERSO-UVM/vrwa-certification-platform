import { $ } from "bun";
import { existsSync, rmSync, cpSync } from "node:fs";
import { exit } from "node:process";
import { styleText } from "node:util";

const LOCAL_DATABASE_URL =
  process.env.LOCAL_DATABASE_URL ??
  "mysql://root:verso@localhost:13306/vrwa";

assertLocalDatabaseUrl(LOCAL_DATABASE_URL);

if ((await verbose`docker info`.quiet().nothrow()).exitCode !== 0) {
  console.error("It looks like your docker daemon is not running.");
  exit(1);
}

await verbose`docker compose -f compose.dev.yml down --remove-orphans`;

if (existsSync(".tmp/db-data")) {
  info("NOTE: Moving .tmp/db-data => .tmp/db-data-OLD");
  cpSync(".tmp/db-data", ".tmp/db-data-OLD", { recursive: true });
  rmSync(".tmp/db-data", { recursive: true });
}

await verbose`docker compose -f compose.dev.yml up -d --wait`.catch((err) => {
  error(err, "ERROR running docker compose");
});

// Force migrate/seed against the local Docker MySQL, never the remote DATABASE_URL.
const localEnv = {
  ...process.env,
  DATABASE_URL: LOCAL_DATABASE_URL,
};

await $`bun db:gen`.env(localEnv).catch((err) => {
  error(err, "ERROR generating SQL migrations\nDiagnose bun db:gen");
});

await $`sleep 1`.env(localEnv);

await $`bun db:migrate`.env(localEnv).catch((err) => {
  error(err, "ERROR applying SQL migrations\nDiagnose bun db:migrate");
});

await $`bun db:seed`.env(localEnv).text().catch((err) => {
  error(err, "ERROR loading seed data into DB\nDiagnose bun db:seed");
});

info(`Local database ready at ${LOCAL_DATABASE_URL}`);

function assertLocalDatabaseUrl(url: string) {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    console.error(`Invalid LOCAL_DATABASE_URL: ${url}`);
    exit(1);
  }
  if (host !== "localhost" && host !== "127.0.0.1") {
    console.error(
      `Refusing to run db:dev against non-local host "${host}".\n` +
        `Set LOCAL_DATABASE_URL to a localhost MySQL URL.`,
    );
    exit(1);
  }
}

function verbose(command: TemplateStringsArray) {
  info("--\n$ " + command.join(""));
  return $(command);
}
function info(text: string) {
  console.log(styleText("green", text));
}
function error(err: any, msg: string) {
  console.log(styleText("red", msg));
  console.log(err.stderr?.toString?.() ?? err);
  console.log(styleText("red", msg));
  exit(1);
}

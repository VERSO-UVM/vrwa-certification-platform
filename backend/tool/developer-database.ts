import { $ } from "bun";
import { existsSync, rmSync, cpSync } from "node:fs";
import { exit } from "node:process";
import { styleText } from "node:util";

if ((await verbose`docker info`.quiet().nothrow()).exitCode !== 0) {
  console.error("It looks like your docker daemon is not running.");
  exit(1);
}

await verbose`docker compose -f compose.dev.yml down`;

if (existsSync(".tmp/db-data")) {
  info("NOTE: Moving .tmp/db-data => .tmp/db-data-OLD");
  cpSync(".tmp/db-data", ".tmp/db-data-OLD", { recursive: true });
  rmSync(".tmp/db-data", { recursive: true });
}

await verbose`docker compose -f compose.dev.yml up -d --wait`;
await verbose`sleep 1`; // RZ: db is not always ready immediately even with --wait
await verbose`bun db:gen`;
await verbose`bun db:migrate`;
await verbose`bun db:seed`;

function verbose(command: TemplateStringsArray) {
  info("--\n$ " + command.join(""));
  return $(command);
}
function info(text: string) {
  console.log(styleText("green", text));
}

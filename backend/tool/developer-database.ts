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

await verbose`docker compose -f compose.dev.yml up -d --wait`.catch((err) => {
  error(err, "ERROR running docker compose");
});

await verbose`bun db:gen`.catch((err) => {
  error(err, "ERROR generating SQL migrations\nDiagnose bun db:gen");
});

await verbose`sleep 1`;

await verbose`bun db:migrate`.catch((err) => {
  error(err, "ERROR applying SQL migrations\nDiagnose bun db:migrate");
});

await verbose`bun db:seed`.text().catch((err) => {
  error(err, "ERROR loading seed data into DB\nDiagnose bun db:seed");
});

function verbose(command: TemplateStringsArray) {
  info("--\n$ " + command.join(""));
  return $(command);
}
function info(text: string) {
  console.log(styleText("green", text));
}
function error(err: any, msg: string) {
  console.log(styleText("red", msg));
  console.log(err.stderr.toString());
  console.log(styleText("red", msg));
  exit(1);
}

# VRWA TrainingDB Backend

## Development Instructions

### Project setup

Use `bun install` to install all necessary dependencies for the project backend.

### Compile and run the project
When running either of the following commands in a Unix-like operating system, make sure you stop them afterwards with `ctrl` + `C` instead of `ctrl` + `Z`! They must be fully terminated for other processes to run properly.
```bash
# run without watch
# (runs the project backend without automatically restarting when files are modified)
$ bun start

# watch mode
# (runs the project backend and automatically restarts when files are modified)
$ bun dev
```

#### Authentication Database Schema

Better-Auth uses its own configuration to generate the database schema. This is derived automatically from the plugins. This generates the auth schema to its own file, so that it doesn't mix with the other database tables. It must be run whenever the Better-Auth configuration is changed, but does not need to be run otherwise.

```sh
bunx auth generate --config src/auth/server.ts --output drizzle/auth-schema.ts
```

### Database

The TrainingDB uses MySQL 8 (Percona Server compatible). For local development, a Docker Compose environment is provided (`compose.dev.yml`). Production / shared hosting uses the `DATABASE_URL` in `.env`.

#### DB Quickstart

Use the command `bun db:dev` to (re)start the **local** Docker MySQL container and create/seed the database. It always uses `LOCAL_DATABASE_URL` (must be `localhost` / `127.0.0.1`) and will refuse to run against a remote host.

Any previous local database content will be archived in `.tmp/db-data-OLD` and a new one will be created.

#### DB Management Commands

```bash
# Generates SQL migration files for schema changes
bun db:gen

# Applies migrations to DATABASE_URL (hosted or local)
bun db:migrate

# Connects to DATABASE_URL with Drizzle Studio
bun db:studio

# Populates DATABASE_URL with seed data (destructive to app tables)
bun db:seed

# Reset/recreate/seed the local Docker MySQL only
bun db:dev
```

#### Environment URLs

See `.env.example`:

- `DATABASE_URL` — app, `db:migrate`, `db:seed`, `db:studio` (may point at hosted MySQL such as UVM `webdb`)
- `LOCAL_DATABASE_URL` — used only by `bun db:dev` (Docker Percona on port 13306)
- `DATABASE_SSL_CA` — optional path to a CA cert (UVM webdb: same as `ssl-ca` in `~/.my.cnf`)

Percent-encode special characters in the password (`<` → `%3C`, `)` → `%29`, etc.). A wrong or unencoded password produces `ER_ACCESS_DENIED_ERROR` even when `mariadb` works with interactively typed credentials.

#### Starting a development database with Docker Compose

A connection string example is provided in `.env.example`. In this directory, make a new file called `.env` and copy the contents of `.env.example` into it.

To start the database container: `docker compose -f compose.dev.yml up -d`. Make sure you have Docker Desktop running first, or this will not work! See the [main README](../README.md) for more details on this.

To stop the database container: `docker compose -f compose.dev.yml down`.

Make sure to also apply migrations (see the DB Management Commands section above)! If you need to reset/wipe the local database, use `rm -rf .tmp/db-data`.

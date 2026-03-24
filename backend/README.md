# VRWA TrainingDB Backend

## Development Instructions

### Project setup

```bash
$ bun install
```

### Compile and run the project

```bash
# run without watch
$ bun start

# watch mode
$ bun start:dev
# orrr...
$ bun dev

# production mode
$ bun start:prod
```

### Run tests

```bash
# unit tests
$ bun run test

# e2e tests
$ bun run test:e2e

# test coverage
$ bun run test:cov
```

### Database

The TrainingDB uses a vanilla PostgreSQL database. For development purposes, a docker compose environment is provided but you are free to provide your own credentials.

#### DB Quickstart

To (re)start the development DB container and create and seed database:
```bash
bun db:dev
```
Any previous database content will be archived in `.tmp/db-data-OLD` and a new one will be created.

#### DB Management Commands

```bash
# Create migrations
bun db:gen

# Apply migrations
bun db:migrate

# View the data studio
bun db:studio

# Seed the database
bun db:seed
```

#### Starting a development database with Docker Compose

A connection string example is provided in `.env.example`.

To start the db container: `docker compose -f compose.dev.yml up -d`
To stop the db container: `docker compose -f compose.dev.yml down`

Make sure to also apply migrations! If you need to reset/wipe the database: `rm -rf .tmp/db-data`

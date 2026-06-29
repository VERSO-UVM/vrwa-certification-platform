# VRWA TrainingDB Backend

## Development Instructions

### Project setup

```bash
$ bun install
```

### Compile and run the project

When running either of the following commands in a Unix-like operating system, make sure you stop them afterwards with `ctrl` + `c` instead of `ctrl` + `z`! They must be fully terminated for other processes to run properly.
```bash
# run without watch
# (runs the project backend without automatically restarting when files are modified)
$ bun start

# watch mode
# (runs the project backend and automatically restarts when files are modified)
$ bun dev
```

### Database

The TrainingDB uses a vanilla PostgreSQL database. For development purposes, a Docker Compose environment is provided, but you are free to provide your own credentials.

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

### Future commands

As this project progresses, we will add functionality for more terminal commands:
<!--
Do we need start:dev since we already have dev?
What is production mode?
What do e2e and coverage tests actually do?
-->
```bash
# Running the project:
$ bun start:dev # this will be another way to run the backend in watch mode
$ bun start:prod # this will run the project in production mode

# Testing the project:
$ bun run test # this will run all unit tests
$ bun run test:e2e # this will run all e2e tests
$ bun run test:cov # this will test coverage
```

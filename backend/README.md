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

#### Authentication Database Schema

Better-Auth uses it's own configuration to generate the database schema. This is derived automatically from the plugins.

```sh
bunx @better-auth/cli generate --config src/auth/server.ts --output src/database/auth.ts
```

This generates the auth schema to it's own file, so that it doesn't mix with the other database tables.

#### Starting a development database with Docker Compose

A connection string example is provided in `.env.example`.

To start the db container: `docker compose -f compose.dev.yml up -d`
To stop the db container: `docker compose -f compose.dev.yml down`

Make sure to also apply migrations! If you need to reset/wipe the database: `rm -rf .tmp/db-data`

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).

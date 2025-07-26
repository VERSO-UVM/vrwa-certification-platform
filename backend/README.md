# VRWA TrainingDB Backend

## Development Instructions

### Docker quick start

1. Create .env file in project root for secrets based on [.env.example](.env.example)

2. Ensure [Docker Desktop](https://docs.docker.com/get-started/get-docker/) is installed and the daemon is running

3. Run docker compose in project root

```bash
docker compose up --build --watch
```

4. Shut down in project root

```
docker compose down
```

### Project setup

```bash
$ bun install
```

### Compile and run the project

```bash
# development
$ bun start

# watch mode
$ bun start:dev

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

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).

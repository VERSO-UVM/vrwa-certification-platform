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

### Bulk email sending development testing

Set all the SMTP variables in `.env`, following `.env.example`.

#### Email config for GMail

You'll need to [create an app password](https://support.google.com/mail/answer/185833?hl=en).

#### Email dev config for UVM affiliates

UVM's in-house outgoing mail server doesn't have security features so it's very easy. SMTP_FROM can also be basically anything.

```sh
SMTP_HOST=smtp.uvm.edu
SMTP_PORT=587
SMTP_USER=rzia@uvm.edu
SMTP_PASS=<your_password>
SMTP_FROM=vrwa-certifications-DEV@uvm.edu
```

### Stripe development testing

1. [Create a stripe account](https://dashboard.stripe.com/register) and create a **testing sandbox**
2. From your _sandbox dashboard_, copy the "Publishable key" and the "Secret key"
3. Update the STRIPE_PUBLIC_KEY and STRIPE_SECRET variables respectively in your .env file in the backend project, as modeled in .env.example
4. For the payment portal, you need to configure the webhook. To make NOT-payments in a local development server, do the following.
   1. [Install the Stripe CLI](https://docs.stripe.com/stripe-cli/install)
   2. Run the local webhook forwarder in the background: `stripe listen --forward-to localhost:3000/webhook`
   3. It will print the secret to use. Set this as `STRIPE_WEBHOOK_SECRET` in your `.env`. Alternatively, you can run the following to set the environment variable in the running shell:

      ```bash
      export STRIPE_WEBHOOK_SECRET=$(stripe listen --forward-to localhost:3000/webhook --print-secret)
      ```

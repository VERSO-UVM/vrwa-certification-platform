import fastifyCookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import type { FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastifyRawBody from "fastify-raw-body";

import Fastify from "fastify";
import { createContext } from "~/utils/trpc/ctx";
import type { AppRouter } from "~/trpc";
import { appRouter } from "~/trpc";
import { auth } from "~/auth/server";
import {
  handleStripeWebhook,
  processStripeWebhookEvent,
} from "~/webhooks/stripe";

const app = Fastify({
  logger: true,
});

// Keep up to date to not get CORB errors
void app.register(cors, {
  origin: ["http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

void app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET, // for cookies signature
});
void app.register(helmet);

async function start() {
  await app.register(fastifyRawBody, {
    field: "rawBody",
    global: false,
    encoding: false,
    runFirst: true,
  });

  // Mount better-auth
  app.all("/api/auth/*", async (request, reply) => {
    const protocol = request.protocol;
    const host = request.headers.host;
    const url = new URL(request.url, `${protocol}://${host}`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else if (value !== undefined) {
        headers.set(key, value);
      }
    }

    const body =
      request.method === "POST" ||
      request.method === "PATCH" ||
      request.method === "PUT"
        ? typeof request.body === "string"
          ? request.body
          : JSON.stringify(request.body)
        : undefined;

    const req = new Request(url.toString(), {
      method: request.method,
      headers,
      body,
    });

    const res = await auth.handler(req);

    reply.status(res.status);
    res.headers.forEach((value, key) => {
      reply.header(key, value);
    });

    return reply.send(await res.text());
  });

  app.post(
    "/webhook",
    {
      config: {
        rawBody: true,
      },
    },
    async (request, reply) => {
      const raw = request.rawBody;
      if (!Buffer.isBuffer(raw)) {
        return reply.status(400).send({ error: "Invalid webhook payload" });
      }
      try {
        const sig = request.headers["stripe-signature"];
        const event = await handleStripeWebhook(
          raw,
          typeof sig === "string" ? sig : sig?.[0],
        );
        await processStripeWebhookEvent(event);
        return reply.send({ received: true });
      } catch (err) {
        app.log.error(err);
        return reply.status(400).send({ error: "Webhook signature failed" });
      }
    },
  );

  // Set up tRPC
  app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }) {
        // report to error monitoring
        console.error(`Error in tRPC handler on path '${path}':`, error);
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
  });

  const port = parseInt(process.env.PORT || "", 10) || 3000;
  await app.listen({
    host: "0.0.0.0",
    port,
  });
}

void start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});

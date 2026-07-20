import fastifyCookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import type { FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";

import Fastify from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "~/auth/server";
import { createContext } from "~/utils/trpc/ctx";
import type { AppRouter } from "~/trpc";
import { appRouter } from "~/trpc";
import { TRUSTED_ORIGINS } from "./constants";
const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: TRUSTED_ORIGINS,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET, // for cookies signature
});
app.register(helmet);

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

// Mount Better-auth.
// Source: https://better-auth.com/docs/integrations/fastify
app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`);

      // Convert Fastify headers to standard Headers object
      const headers = fromNodeHeaders(request.headers);

      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });

      // Process authentication request
      const response = await auth.handler(req);

      // Forward response to client
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      return reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error("Authentication Error: " + error);
      return reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  },
});

const port = parseInt(process.env.PORT || "") || 3000;
const host = process.env.HOST || '0.0.0.0';
void app.listen({ host, port });

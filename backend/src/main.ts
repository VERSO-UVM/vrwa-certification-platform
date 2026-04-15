import fastifyCookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import type { FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";

import Fastify from "fastify";
import { createContext } from "~/utils/trpc/ctx";
import type { AppRouter } from "~/trpc";
import { appRouter } from "~/trpc";
import { auth } from "~/auth/server";
import { toNodeHandler } from "better-auth/node";

const app = Fastify({
  logger: true,
});

// Keep up to date to not get CORB errors
app.register(cors, {
  origin: ["http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET, // for cookies signature
});
app.register(helmet);

// Mount better-auth
app.all("/api/auth/*", async (request, reply) => {
  const protocol = request.protocol;
  const host = request.headers.host;
  const url = new URL(request.url, `${protocol}://${host}`);
  
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      value.forEach(v => headers.append(key, v));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  const body = (request.method === "POST" || request.method === "PATCH" || request.method === "PUT") 
    ? (typeof request.body === 'string' ? request.body : JSON.stringify(request.body))
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

void app.listen({ host: "0.0.0.0", port: parseInt(process.env.PORT || "") || 3000 });


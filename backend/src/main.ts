import fastifyCookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import type { FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';

import Fastify from 'fastify';
import { createContext } from './utils/trpc/ctx';
import type { AppRouter } from './trpc';
import { appRouter } from './trpc';
const app = Fastify({
  logger: true,
});

app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET, // for cookies signature
});
app.register(helmet);

// Set up tRPC
app.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      // report to error monitoring
      console.error(`Error in tRPC handler on path '${path}':`, error);
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
});

void app.listen({ port: parseInt(process.env.PORT ?? '') ?? 3000 });

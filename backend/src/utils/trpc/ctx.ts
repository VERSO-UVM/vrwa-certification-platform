import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
export function createContext({ req, res }: CreateFastifyContextOptions) {
  // TODO: add some db and other stuff to this
  return { req, res };
}
export type Context = Awaited<ReturnType<typeof createContext>>;

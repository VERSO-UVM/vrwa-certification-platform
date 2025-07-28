import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import db from '../../database';

export function createContext({ req, res }: CreateFastifyContextOptions) {
  return { req, res, db };
}
export type Context = Awaited<ReturnType<typeof createContext>>;

import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import db from "~/database";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "~/auth/server";

/**
 * We can return whatever we want from here and it is passsed as the "ctx"
 * field in the tRPC router procedure callback.
 */
export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const headers = fromNodeHeaders(req.headers);
  const sessionUser = await auth.api.getSession({
    headers,
  });
  const account = sessionUser?.user;
  const session = sessionUser?.session;

  return { req, res, db, account, session };
}
export type Context = Awaited<ReturnType<typeof createContext>>;

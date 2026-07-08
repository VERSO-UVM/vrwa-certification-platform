import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import db from "~/database";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "~/auth/server";

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const headers = fromNodeHeaders(req.headers);
  const authCookie = headers.getSetCookie();
  const sessionUser = await auth.api.getSession({
    headers,
  });
  const account = sessionUser?.user;
  const session = sessionUser?.session;

  return { req, res, db, account, session };
}
export type Context = Awaited<ReturnType<typeof createContext>>;

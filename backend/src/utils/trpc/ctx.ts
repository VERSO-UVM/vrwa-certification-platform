import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import db from "~/database";
import { auth } from "~/auth/server";
import { toNodeHandler } from "better-auth/node";

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  // Use better-auth to get the session from the raw node request
  const sessionUser = await auth.api.getSession({ headers: req.headers as Record<string, string | string[] | undefined> as unknown as Headers });

  const account = sessionUser?.user ?? null;
  const session = sessionUser?.session ?? null;

  return { req, res, db, account, session };
}
export type Context = Awaited<ReturnType<typeof createContext>>;


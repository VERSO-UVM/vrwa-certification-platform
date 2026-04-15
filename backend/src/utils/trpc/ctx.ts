import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import db from "~/database";
import { auth } from "~/auth/server";
import { toNodeHandler } from "better-auth/node";

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  // Use better-auth to get the session from the raw node request
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach((v) => headers.append(key, v));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  console.log("Creating tRPC context for path:", req.url);
  console.log("Headers cookie:", req.headers.cookie || "none");
  const sessionUser = await auth.api.getSession({
    headers,
  });
  console.log("Session user found:", sessionUser?.user?.email || "none");

  const account = sessionUser?.user ?? null;
  const session = sessionUser?.session ?? null;

  return { req, res, db, account, session };
}
export type Context = Awaited<ReturnType<typeof createContext>>;


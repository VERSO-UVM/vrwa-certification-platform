import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./ctx";
import { ZodError } from "zod";
import { checkRolePermission } from "~/auth/permissions";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  // transformer: superjson,

  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceAcctIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.account || !ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `account` and `session` as non-nullable
      account: ctx.account,
      session: ctx.session,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceAcctIsAuthed);

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.account.role || !checkRolePermission({ roles: ctx.account.role, permissions: { admin: ["admin"] } })) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const instructorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.account.role || !checkRolePermission({ roles: ctx.account.role, permissions: { classes: ["update"] } })) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const traineeProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.account.role || !checkRolePermission({ roles: ctx.account.role, permissions: { classes: ["register"] } })) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const basicProcedure = t.procedure;

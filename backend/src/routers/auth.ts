import { TRPCError } from '@trpc/server';
import { protectedProcedure, publicProcedure, router } from 'src/utils/trpc';
import { eq } from 'drizzle-orm';
import z from 'zod';
import * as argon2 from 'argon2';
import { addDays } from 'date-fns/addDays';
import { SESSION_COOKIE_NAME } from 'src/constants';
import { Roles } from 'src/database/schema';
import type { Database } from 'src/database';
import type { Context } from 'src/utils/trpc/ctx';

export const authRouter = router({
  getMe: protectedProcedure.query(({ ctx }) => {
    return ctx.account;
  }),
  getOrganization: protectedProcedure.query(async ({ ctx: { db, ...ctx } }) => {
    if (ctx.account.orgId === null)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Organization not found',
      });

    const [org] = await db.client
      .select({
        orgDetails: db.schema.organization,
        memberCount: db.client.$count(
          db.schema.account,
          eq(db.schema.account.orgId, db.schema.organization.id),
        ),
      })
      .from(db.schema.organization)
      .where(eq(db.schema.organization.id, ctx.account.orgId));

    if (!org)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Organization not found',
      });

    return org;
  }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const acct = await ctx.db.client.query.account.findFirst({
        where: (accounts, { eq, and }) =>
          and(eq(accounts.email, input.email), eq(accounts.hasRegistered, true)),
      });

      if (!acct || !acct.passwordHash) {
        // FIXME: Setup logging
        // this.logger.warn(
        //   `Login User: could not find user ${email} or user has null password`,
        // );
        return null;
      }

      // FIXME: Setup logging
      // this.logger.log(`Login User: user ${email} comparing passwords`);

      // FIXME: This damn thing never returns, even when I use a different argon2 implementation. Both impls are bindings to the rust version; is that one bad?
      if (await comparePasswordHashes(acct.passwordHash, input.password)) {
        await issueSessionToken(ctx.db, acct.id, ctx.res);

        return { success: true };
      }

      // FIXME: Setup logging
      // this.logger.warn(`Login User: user ${email} entered incorrect password`);
      return null;
    }),

  register: publicProcedure
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input: details, ctx: { db, ...ctx } }) => {
      const [account] = await db.client
        .select()
        .from(db.schema.account)
        .where(eq(db.schema.account.email, details.email.trim()));

      if (!account) {
        // FIXME: Setup logging
        // this.logger.warn(
        //   `Register User: could not find user ${details.email} who isn't registered`,
        // );
        return null;
      }

      const [regAcct] = await db.client
        .update(db.schema.account)
        .set({
          //firstName: details.firstName,
          //lastName: details.lastName,
          passwordHash: await hashPassword(details.password),
          role: Roles.Trainee,
          hasRegistered: true,
        })
        .where(eq(db.schema.account.email, account.email))
        .returning();

      await issueSessionToken(db, regAcct.id, ctx.res);

      return { success: true };
    }),

  logout: protectedProcedure.mutation(async ({ ctx: { db, ...ctx } }) => {
    await db.client
      .delete(db.schema.session)
      .where(eq(db.schema.session.id, ctx.session.id));

    await ctx.res.clearCookie(SESSION_COOKIE_NAME);
  }),
});

async function issueSessionToken(
  db: Database,
  accountId: string,
  res: Context['res'],
) {
  const expiry = addDays(new Date(), 14);

  const [session] = await db.client
    .insert(db.schema.session)
    .values({ accountId, expiresAt: expiry })
    .returning();

  await res.setCookie(SESSION_COOKIE_NAME, session.id);
}

// Password hashing functions are split out to make it easier to swap hashing implementations
async function comparePasswordHashes(hash: string, password: string) {
  return argon2.verify(hash, password);
}

async function hashPassword(password: string) {
  return argon2.hash(password);
}

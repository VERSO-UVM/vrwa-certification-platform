import { and, eq } from "drizzle-orm";

import db from "~/database";
import { profile } from "~/database/schema";
import { protectedProcedure, router } from "~/utils/trpc";

import { createUpdateSchema } from "drizzle-zod";
import z from "zod";

const updateSchema = createUpdateSchema(profile, {
  id: z.string(),
});

export const profileRouter = router({
  update: protectedProcedure.input(updateSchema).mutation(({ input }) => {
    const { id, ...changes } = input;
    return db.client
      .update(profile)
      .set({
        ...changes,
      })
      .where(and(eq(profile.id, id)))
      .returning();
  }),

  getUserProfiles: protectedProcedure.query(async ({ ctx }) => {
    const profiles = await db.client
      .select()
      .from(profile)
      .where(eq(profile.userId, ctx.account.id));
    return profiles;
  }),

  getActiveProfile: protectedProcedure.query(async ({ ctx }) => {
    const profiles = await db.client
      .select()
      .from(profile)
      .where(eq(profile.id, ctx.session.activeProfileId));
    return profiles[0] ?? null;
  }),
});

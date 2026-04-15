import { and, eq } from "drizzle-orm";

import db from "~/database";
import { profile } from "~/database/schema";
import { protectedProcedure, router } from "~/utils/trpc";
import * as schema from "~/database/schema";

import { createUpdateSchema } from "drizzle-zod";
import z from "zod";

const updateSchema = createUpdateSchema(profile, {
  id: z.string(),
});

export const profileRouter = router({
  getMyProfiles: protectedProcedure.query(async ({ ctx }) => {
    const profiles = await db.client
      .select()
      .from(profile)
      .where(eq(profile.accountId, ctx.account.id));
    return profiles;
  }),

  switchProfile: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.client
        .update(schema.session)
        .set({ activeProfileId: input.profileId })
        .where(eq(schema.session.id, ctx.session.id));
      return { success: true };
    }),

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
});

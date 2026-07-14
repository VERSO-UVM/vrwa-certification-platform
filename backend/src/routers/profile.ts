import { and, eq } from "drizzle-orm";

import db from "~/database";
import { profile, type Profile } from "~/database/schema";
import { adminProcedure, protectedProcedure, router } from "~/utils/trpc";

import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";

const updateSchema = createUpdateSchema(profile, {
  id: z.string(),
});

const insertSchema = createInsertSchema(profile).omit({
  userId: true,
  id: true,
});

export const profileRouter = router({
  /**
   * Update the profile information associated with a user.
   * This is an admin procedure.
   */
  update: adminProcedure.input(updateSchema).mutation(({ input }) => {
    const { id, ...changes } = input;
    return db.client
      .update(profile)
      .set({
        ...changes,
      })
      .where(and(eq(profile.id, id)))
      .returning();
  }),

  /**
   * Create a new profile associated with a user.
   */
  create: protectedProcedure.input(insertSchema).mutation(({ ctx, input }) => {
    const { ...fields } = input;
    return db.client.insert(profile).values({
      userId: ctx.account.id,
      ...fields,
    });
  }),

  /**
   * Get all profiles associated with the logged-in user.
   */
  getProfiles: protectedProcedure.query(async ({ ctx }) => {
    const profiles = await db.client
      .select()
      .from(profile)
      .where(eq(profile.userId, ctx.account.id));
    return profiles;
  }),

  /**
   * Get the entry for the currently active profile.
   */
  getActiveProfile: protectedProcedure.query(async ({ ctx }) => {
    const profiles = await db.client
      .select()
      .from(profile)
      .where(eq(profile.id, ctx.session.activeProfileId));
    return profiles[0] ?? null;
  }),
});

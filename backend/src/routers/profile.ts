import { and, eq } from "drizzle-orm";

import db from "~/database";
import { profile } from "~/database/schema";
import { protectedProcedure, router } from "~/utils/trpc";
import * as schema from "~/database/schema";

import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";
import { TRPCError } from "@trpc/server";

const updateSchema = createUpdateSchema(profile, {
  id: z.string(),
});

const createProfileInputSchema = createInsertSchema(profile).omit({
  id: true,
  accountId: true,
});

export const profileRouter = router({
  getMyProfiles: protectedProcedure.query(async ({ ctx }) => {
    const profiles = await db.client
      .select()
      .from(profile)
      .where(eq(profile.accountId, ctx.account.id));
    return profiles;
  }),

  createProfile: protectedProcedure
    .input(createProfileInputSchema)
    .mutation(async ({ ctx, input }) => {
      const [created] = await db.client
        .insert(profile)
        .values({
          ...input,
          accountId: ctx.account.id,
        })
        .returning();
      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create profile.",
        });
      }
      return created;
    }),

  switchProfile: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [owned] = await db.client
        .select({ id: profile.id })
        .from(profile)
        .where(
          and(
            eq(profile.id, input.profileId),
            eq(profile.accountId, ctx.account.id),
          ),
        );
      if (!owned) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid profile.",
        });
      }
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

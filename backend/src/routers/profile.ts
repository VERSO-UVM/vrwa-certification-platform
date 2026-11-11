import { and, eq } from "drizzle-orm";

import db from "~/database";
import { profile, reservation, user } from "~/database/schema";
import { adminProcedure, protectedProcedure, router } from "~/utils/trpc";

import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod";
import z from "zod";
import { profilesQuery } from "~/database/queries";
import { TRPCError } from "@trpc/server";
import type { ProfileDto } from "~/database/dtos";

const updateSchema = createUpdateSchema(profile, {
  id: z.string(),
});

const insertSchema = createInsertSchema(profile).omit({
  userId: true,
  id: true,
});

const adminInsertSchema = createInsertSchema(profile).omit({
  id: true,
});

export const profileRouter = router({
  admin: router({
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

    get: adminProcedure
      .input(z.object({ profileId: z.string() }))
      .query(async ({ input }) => {
        const profiles = await profilesQuery().where(
          eq(profile.id, input.profileId),
        );
        const p = profiles[0];
        if (p == null) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Profile does not exist.",
          });
        }
        return p;
      }),

    /**
     * Create a new profile associated with a user.
     */
    create: adminProcedure.input(adminInsertSchema).mutation(({ input }) => {
      return db.client.insert(profile).values(input).returning();
    }),

    listTrainees: adminProcedure.query((): Promise<ProfileDto[]> => {
      return profilesQuery().where(eq(user.role, "user"));
    }),
  }),

  /**
   * Create a new profile associated with the active user.
   */
  create: protectedProcedure.input(insertSchema).mutation(async ({ ctx, input }) => {
    const { ...fields } = input;
    const [created] = await db.client
      .insert(profile)
      .values({
        userId: ctx.account.id,
        ...fields,
      })
      .returning();
    if (!created) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to create profile.",
      });
    }
    return created;
  }),

  /**
   * Get all profiles associated with the logged-in user.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const profiles = await db.client
      .select()
      .from(profile)
      .where(eq(profile.userId, ctx.account.id));
    return profiles;
  }),

  /**
   * Profile ids under this account that already have a reservation for a course.
   */
  listForCourse: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await db.client
        .select({ profileId: reservation.profileId })
        .from(reservation)
        .innerJoin(profile, eq(reservation.profileId, profile.id))
        .where(
          and(
            eq(reservation.courseId, input.courseId),
            eq(profile.userId, ctx.account.id),
          ),
        );
      return rows.map((r) => r.profileId);
    }),

  /**
   * Get the entry for the currently active profile.
   */
  getActiveProfile: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.activeProfileId == null) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No currently active profile.",
      });
    }
    const profiles = await db.client
      .select()
      .from(profile)
      .where(eq(profile.id, ctx.session.activeProfileId));
    return profiles[0] ?? null;
  }),
});

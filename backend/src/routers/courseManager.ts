import { asc, eq, and } from "drizzle-orm";
import db from "~/database";
import { courseEvent, course, reservation, profile } from "~/database/schema";
import type { Course } from "~/database/schema";
import { basicProcedure, router } from "~/utils/trpc";
import { z } from "zod";

const adminProcedure = basicProcedure;

export const courseManagerRouter = router({
  //addTrainee
  addReservation: adminProcedure
    .input(
      z.object({
        profileId: z.string(),
        courseEventId: z.string(),
        creditHours: z.number().positive(),
        paymentStatus: z.enum(["paid", "unpaid"]),
      }),
    )
    .mutation(async ({ input }) => {
      const [newReservation] = await db.client
        .insert(reservation)
        .values({
          ...input,
          creditHours: input.creditHours.toString(),
        })
        .returning();

      return newReservation;
    }),

  //removeTrainee
  deleteReservation: adminProcedure
    .input(
      z.object({
        profileId: z.string(),
        courseEventId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const deletedRows = await db.client
        .delete(reservation)
        .where(
          and(
            eq(reservation.courseEventId, input.courseEventId),
            eq(reservation.profileId, input.profileId),
          ),
        )
        .returning();

      return { success: true };
    }),

  //getCourseRoster

  //getCourseStats
});

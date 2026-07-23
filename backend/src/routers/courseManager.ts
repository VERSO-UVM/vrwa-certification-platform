import { asc, eq, and } from "drizzle-orm";
import db from "~/database";
import { courseEvent, course, reservation, profile } from "~/database/schema";
import type { Course } from "~/database/schema";
import { basicProcedure, router } from "~/utils/trpc";
import { z } from "zod";

const adminProcedure = basicProcedure;

export const courseManagerRouter = router({

  //deleteCourse
  deleteCourse: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const deletedRows = await db.client
        .delete(course)
        .where(eq(course.id, input.id))
        .returning();

      if (deletedRows.length === 0) {
        throw new Error("No matching Course Event found!");
      }
      return { success: true };
    }),

  //updateCourse
  updateCourse: adminProcedure
    .input(
      z.object({
        id: z.string(),
        courseName: z.string(),
        description: z.string().nullable(),
        creditHours: z.number().int().positive(),
        priceCents: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...update } = input;

      const cleanUpdate = Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value !== undefined),
      );

      if (Object.keys(cleanUpdate).length === 0) {
        throw new Error("No fields provided to update");
      }

      const [updatedCourse] = await db.client
        .update(course)
        .set(cleanUpdate)
        .where(eq(course.id, id))
        .returning();

      return updatedCourse;
    }),

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

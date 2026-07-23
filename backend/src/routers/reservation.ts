import { and, eq } from "drizzle-orm";

import db from "~/database";
import {
  course,
  courseEvent,
  profile,
  reservation,
  type PaymentStatus,
} from "~/database/schema";
import { adminProcedure, instructorProcedure, router } from "~/utils/trpc";

import { createUpdateSchema } from "drizzle-zod";
import z from "zod";
import { reservationQuery } from "~/database/queries";
import type { ReservationDto } from "~/database/dtos";
import { TRPCError } from "@trpc/server";

const updateSchema = createUpdateSchema(reservation, {
  courseEventId: z.string(),
  profileId: z.string(),
});

export const reservationRouter = router({
  admin: router({
    update: adminProcedure.input(updateSchema).mutation(({ input }) => {
      return db.client
        .update(reservation)
        .set({
          creditHours: input.creditHours,
          paymentStatus: input.paymentStatus as PaymentStatus,
        })
        .where(
          and(
            eq(reservation.profileId, input.profileId),
            eq(reservation.courseEventId, input.courseEventId),
          ),
        )
        .returning();
    }),

    list: adminProcedure.query(() =>
      reservationQuery().orderBy(
        courseEvent.classStartDatetime,
        profile.firstName,
      ),
    ),

    listTrainee: adminProcedure
      .input(
        z.object({
          profileId: z.string(),
        }),
      )
      .query(({ input }): Promise<ReservationDto[]> => {
        return reservationQuery()
          .orderBy()
          .where(eq(reservation.profileId, input.profileId));
      }),

    listCourse: adminProcedure
      .input(z.object({ courseId: z.string() }))
      .query(({ input }) =>
        reservationQuery()
          .where(eq(course.id, input.courseId))
          .orderBy(courseEvent.classStartDatetime),
      ),

    create: adminProcedure
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

    delete: adminProcedure
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

    instructor: router({
      updateCreditHours: instructorProcedure
        .input(
          z.object({
            courseEventId: z.string(),
            profileId: z.string(),
            creditHours: z.number().min(0).max(24),
          }),
        )
        .mutation(async ({ input, ctx }) => {
          const [event] = await db.client
            .select({ instructorId: courseEvent.instructorId })
            .from(courseEvent)
            .where(eq(courseEvent.id, input.courseEventId));
          if (!event || event.instructorId !== ctx.account.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Unauthorized event access.",
            });
          }

          const updated = await db.client
            .update(reservation)
            .set({
              creditHours: input.creditHours.toString(),
            })
            .where(
              and(
                eq(reservation.courseEventId, input.courseEventId),
                eq(reservation.profileId, input.profileId),
              ),
            )
            .returning();

          if (updated.length === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Reservation not found.",
            });
          }
          return updated[0];
        }),
    }),
  }),
});

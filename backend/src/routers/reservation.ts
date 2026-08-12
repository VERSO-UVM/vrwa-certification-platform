import { and, asc, desc, eq, gt, lt } from "drizzle-orm";

import db from "~/database";
import {
  course,
  courseEvent,
  PaymentStatus,
  profile,
  reservation,
  ReservationStatus,
} from "~/database/schema";
import {
  adminProcedure,
  instructorProcedure,
  traineeProcedure,
  router,
} from "~/utils/trpc";
import { createUpdateSchema } from "drizzle-orm/zod";
import z from "zod";
import { courseStartQuery, reservationQuery } from "~/database/queries";
import type { ReservationDto } from "~/database/dtos";
import { TRPCError } from "@trpc/server";
import { hasAttended } from "~/database/filters";

function isFutureClass() {
  return gt(courseStartQuery.courseStart, new Date());
}

function isPastClass() {
  return lt(courseStartQuery.courseStart, new Date());
}

const updateSchema = createUpdateSchema(reservation, {
  courseId: z.string(),
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
            eq(reservation.courseId, input.courseId),
          ),
        )
        .returning();
    }),

    list: adminProcedure.query(() =>
      reservationQuery().orderBy(
        desc(courseStartQuery.courseStart),
        asc(profile.lastName),
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
          .orderBy(courseStartQuery.courseStart)
          .where(eq(reservation.profileId, input.profileId));
      }),

    listCourse: adminProcedure
      .input(z.object({ courseId: z.string() }))
      .query(({ input }) =>
        reservationQuery()
          .where(eq(course.id, input.courseId))
          .orderBy(courseStartQuery.courseStart),
      ),

    create: adminProcedure
      .input(
        z.object({
          profileId: z.string(),
          courseId: z.string(),
          creditHours: z.number().positive(),
          paymentStatus: z.enum(PaymentStatus),
        }),
      )
      .mutation(async ({ input }) => {
        const [newReservation] = await db.client
          .insert(reservation)
          .values({
            ...input,
            creditHours: input.creditHours.toString(),
            reservationStatus: ReservationStatus.Accepted,
          })
          .returning();

        return newReservation;
      }),

    delete: adminProcedure
      .input(
        z.object({
          profileId: z.string(),
          courseId: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const deletedRows = await db.client
          .delete(reservation)
          .where(
            and(
              eq(reservation.courseId, input.courseId),
              eq(reservation.profileId, input.profileId),
            ),
          )
          .returning();

        return { success: true };
      }),
  }),

  instructor: router({
    listCourse: instructorProcedure
      .input(
        z.object({
          courseId: z.string(),
        }),
      )
      .query(async ({ input: { courseId } }) => {
        return await reservationQuery()
          .where(eq(reservation.courseId, courseId))
          .orderBy(asc(profile.lastName));
      }),

    updateCreditHours: instructorProcedure
      .input(
        z.object({
          courseId: z.string(),
          profileId: z.string(),
          creditHours: z.number().min(0).max(24),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const course = await db.client.query.course.findFirst({
          where: { id: input.courseId },
        });
        if (!course || course.instructorId !== ctx.session.activeProfileId) {
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
              eq(reservation.courseId, course.id),
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
  trainee: router({
    listUpcoming: traineeProcedure.query(
      ({ ctx }): Promise<ReservationDto[]> => {
        if (ctx.session.activeProfileId == null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No currently active profile.",
          });
        }
        return reservationQuery()
          .where(
            and(
              isFutureClass(),
              eq(reservation.profileId, ctx.session.activeProfileId),
            ),
          )
          .orderBy(asc(courseEvent.classStartDatetime));
      },
    ),

    listCompleted: traineeProcedure.query(
      ({ ctx }): Promise<ReservationDto[]> => {
        if (ctx.session.activeProfileId == null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No currently active profile.",
          });
        }
        return reservationQuery()
          .where(
            and(
              isPastClass(),
              hasAttended(),
              eq(reservation.profileId, ctx.session.activeProfileId),
            ),
          )
          .orderBy(desc(courseEvent.classStartDatetime));
      },
    ),
  }),
});

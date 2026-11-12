import { and, asc, desc, eq, gt, lt } from "drizzle-orm";

import db from "~/database";
import {
  course,
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
  paymentStatus: z.enum(PaymentStatus).optional(),
  reservationStatus: z.enum(ReservationStatus).optional(),
}).pick({
  courseId: true,
  profileId: true,
  paymentStatus: true,
  reservationStatus: true,
  creditHours: true,
});

export const reservationRouter = router({
  admin: router({
    update: adminProcedure.input(updateSchema).mutation(async ({ input }) => {
      const where = and(
        eq(reservation.profileId, input.profileId),
        eq(reservation.courseId, input.courseId),
      );
      await db.client
        .update(reservation)
        .set({
          ...input,
          /* Track last time we updated reservation status */
          ...(input.reservationStatus !== undefined && {
            statusUpdatedAt: new Date(),
          }),
        })
        .where(where);
      return db.client.select().from(reservation).where(where);
    }),

    get: adminProcedure
      .input(
        z.object({
          courseId: z.string(),
          profileId: z.string(),
        }),
      )
      .query(async ({ input }) => {
        const reservations = await reservationQuery().where(
          and(
            eq(reservation.profileId, input.profileId),
            eq(reservation.courseId, input.courseId),
          ),
        );
        const found = reservations[0];
        if (!found) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No reservation found.",
          });
        }
        return found;
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
          creditHours: z.string(),
          paymentStatus: z.enum(PaymentStatus),
        }),
      )
      .mutation(async ({ input }) => {
        const [inserted] = await db.client
          .insert(reservation)
          .values({
            ...input,
            creditHours: input.creditHours,
            reservationStatus: ReservationStatus.Accepted,
          })
          .$returningId();
        const id = inserted!.id;

        return db.client.query.reservation.findFirst({ where: { id } });
      }),

    delete: adminProcedure
      .input(
        z.object({
          profileId: z.string(),
          courseId: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        await db.client
          .delete(reservation)
          .where(
            and(
              eq(reservation.courseId, input.courseId),
              eq(reservation.profileId, input.profileId),
            ),
          );

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
          creditHours: z.string(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const courseRow = await db.client.query.course.findFirst({
          where: { id: input.courseId },
        });
        if (
          !courseRow ||
          courseRow.instructorId !== ctx.session.activeProfileId
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Unauthorized event access.",
          });
        }

        const where = and(
          eq(reservation.courseId, courseRow.id),
          eq(reservation.profileId, input.profileId),
        );
        const [result] = await db.client
          .update(reservation)
          .set({ creditHours: input.creditHours })
          .where(where);

        if (result.affectedRows === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Reservation not found.",
          });
        }
        return db.client.query.reservation.findFirst({
          where: {
            courseId: courseRow.id,
            profileId: input.profileId,
          },
        });
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
          .orderBy(asc(courseStartQuery.courseStart));
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
          .orderBy(desc(courseStartQuery.courseStart));
      },
    ),
  }),
});

import { and, eq } from "drizzle-orm";

import db from "~/database";
import {
  course,
  courseEvent,
  profile,
  reservation,
  type PaymentStatus,
} from "~/database/schema";
import { adminProcedure, router } from "~/utils/trpc";

import { createUpdateSchema } from "drizzle-zod";
import z from "zod";

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

    listCourse: adminProcedure
      .input(z.object({ courseId: z.string() }))
      .query(async ({ input }) => {
        const reservations = await db.client
          .select({
            profileId: reservation.profileId,
            firstName: profile.firstName,
            lastName: profile.lastName,
            isMember: profile.isMember,
            creditHours: reservation.creditHours,
            paymentStatus: reservation.paymentStatus,
            classStartDatetime: courseEvent.classStartDatetime,
            courseEventId: courseEvent.id,
          })
          .from(reservation)
          .leftJoin(profile, eq(reservation.profileId, profile.id))
          .leftJoin(courseEvent, eq(reservation.courseEventId, courseEvent.id))
          .leftJoin(course, eq(courseEvent.courseId, course.id))
          .where(eq(course.id, input.courseId))
          .orderBy(courseEvent.classStartDatetime);

        return reservations ?? [];
      }),
  }),
});

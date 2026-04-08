import { and, eq } from "drizzle-orm";

import db from "~/database";
import { course, courseEvent, profile, reservation, type PaymentStatus } from "~/database/schema";
import { basicProcedure, router } from "~/utils/trpc";

import { createUpdateSchema } from "drizzle-zod";
import z from "zod";
import type { ReservationDto } from "~/database/dtos";
import type { PgSelect } from "drizzle-orm/pg-core";

// IMPORTANT: change basicProcedure to protectedProcedure
// once auth is fully implemented (before shipping).
const procedure = basicProcedure;

const updateSchema = createUpdateSchema(reservation, {
  courseEventId: z.string(),
  profileId: z.string(),
});

export const reservationDtoSelect = () => {
  return db.client
    .select({
      profileId: reservation.profileId,
      courseEventId: reservation.courseEventId,
      creditHours: reservation.creditHours,
      paymentStatus: reservation.paymentStatus,
      firstName: profile.firstName,
      lastName: profile.lastName,
      isMember: profile.isMember,
      classStartDatetime: courseEvent.classStartDatetime,
      course: {
        id: course.id,
        courseName: course.courseName,
        creditHours: course.creditHours,
      },
    })
    .from(reservation)
    .innerJoin(profile, eq(reservation.profileId, profile.id))
    .innerJoin(courseEvent, eq(reservation.courseEventId, courseEvent.id))
    .innerJoin(course, eq(course.id, courseEvent.courseId));
};

export const reservationRouter = router({
  update: procedure.input(updateSchema).mutation(({ input }) => {
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
      ;
  }),
});

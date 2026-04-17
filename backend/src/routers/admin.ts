import { asc, eq, getTableColumns } from "drizzle-orm";
import z from "zod";

import db from "~/database";
import type { CourseEventDto, ReservationDto } from "~/database/dtos";
import {
  user,
  course,
  courseEvent,
  profile,
  reservation,
} from "~/database/schema";
import type { Profile } from "~/database/schema";
import { adminProcedure, router } from "~/utils/trpc";
import { reservationDtoSelect } from "./reservation";

export const adminRouter = router({
  getTrainees: adminProcedure.query(() => {
    return db.client
      .select({
        ...getTableColumns(profile),
      })
      .from(profile)
      .orderBy(asc(profile.lastName))
      .leftJoin(user, eq(profile.accountId, user.id))
      .where(eq(user.role, "user"));
  }),

  getCourseEvents: adminProcedure.query(() => {
    return db.client
      .select({
        ...getTableColumns(courseEvent),
        courseName: course.courseName,
        description: course.description,
        creditHours: course.creditHours,
        priceCents: course.priceCents,
      })
      .from(courseEvent)
      .orderBy(asc(courseEvent.classStartDatetime))
      .innerJoin(course, eq(courseEvent.courseId, course.id));
  }),

  getReservations: adminProcedure.query(reservationDtoSelect),

  getTraineeReservations: adminProcedure
    .input(
      z.object({
        profileId: z.string(),
      }),
    )
    .query(({ input }) => {
      return reservationDtoSelect().where(
        eq(reservation.profileId, input.profileId),
      );
    }),
});

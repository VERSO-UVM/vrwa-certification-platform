import { asc, eq } from "drizzle-orm";
import z from "zod";

import type { CourseEventDto, ReservationDto } from "~/database/dtos";
import {
  courseEventQuery,
  profilesQuery,
  reservationQuery,
} from "~/database/queries";
import { user, courseEvent, profile, reservation } from "~/database/schema";
import type { Profile } from "~/database/schema";
import { adminProcedure, router } from "~/utils/trpc";

export const adminRouter = router({
  getTrainees: adminProcedure.query((): Promise<Profile[]> => {
    return profilesQuery().where(eq(user.role, "user"));
  }),

  getCourseEvents: adminProcedure.query((): Promise<CourseEventDto[]> => {
    return courseEventQuery().orderBy(asc(courseEvent.classStartDatetime));
  }),

  getReservations: adminProcedure.query(() =>
    reservationQuery().orderBy(
      courseEvent.classStartDatetime,
      profile.firstName,
    ),
  ),

  getTraineeReservations: adminProcedure
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
});

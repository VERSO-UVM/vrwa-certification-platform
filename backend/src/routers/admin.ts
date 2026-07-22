import { asc, eq, getTableColumns } from "drizzle-orm";
import z from "zod";

import db from "~/database";
import { type CourseEventDto, type ReservationDto } from "~/database/dtos";
import {
  user,
  courseEvent,
  profile,
  reservation,
} from "~/database/schema";
import type { Profile } from "~/database/schema";
import { adminProcedure, router } from "~/utils/trpc";
import { reservationDtoSelect } from "./reservation";
import { courseEventView } from "~/database/views";

export const adminRouter = router({
  getTrainees: adminProcedure.query((): Promise<Profile[]> => {
    return db.client
      .select({
        ...getTableColumns(profile),
      })
      .from(profile)
      .orderBy(asc(profile.lastName))
      .leftJoin(user, eq(profile.userId, user.id))
      .where(eq(user.role, "user"));
  }),

  getCourseEvents: adminProcedure.query((): Promise<CourseEventDto[]> => {
    return db.client
      .select()
      .from(courseEventView)
      .orderBy(asc(courseEvent.classStartDatetime));
  }),

  getReservations: adminProcedure.query(
    reservationDtoSelect as () => Promise<ReservationDto[]>,
  ),

  getTraineeReservations: adminProcedure
    .input(
      z.object({
        profileId: z.string(),
      }),
    )
    .query(({ input }): Promise<ReservationDto[]> => {
      return reservationDtoSelect().where(
        eq(reservation.profileId, input.profileId),
      );
    }),
});

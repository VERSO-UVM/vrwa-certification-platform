import { asc, eq, getTableColumns } from "drizzle-orm";
import z from "zod";

import db from "~/database";
import type { CourseEventDto, ReservationDto } from "~/database/dtos";
import {
  account,
  course,
  courseEvent,
  profile,
  reservation,
  Roles,
} from "~/database/schema";
import type { Profile } from "~/database/schema";
import { basicProcedure, router } from "~/utils/trpc";
import { reservationDtoSelect } from "./reservation";

// IMPORTANT: change basicProcedure to protectedProcedure
// once auth is fully implemented (before shipping).
const adminProcedure = basicProcedure;

const { passwordHash: _, ...accountInfo } = getTableColumns(account);

export const adminRouter = router({
  getTrainees: adminProcedure.query((): Promise<Profile[]> => {
    return db.client
      .select({
        ...getTableColumns(profile),
      })
      .from(profile)
      .orderBy(asc(profile.lastName))
      .leftJoin(account, eq(profile.accountId, account.id))
      .where(eq(account.role, Roles.Trainee));
  }),

  getCourseEvents: adminProcedure.query((): Promise<CourseEventDto[]> => {
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

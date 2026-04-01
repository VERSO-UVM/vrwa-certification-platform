import type { Select } from "@react-pdf/renderer";
import { asc, eq, getTableColumns } from "drizzle-orm";
import type { PgSelectBase } from "drizzle-orm/pg-core";
import type { Query } from "pg";
import z from "zod";

import db from "~/database";
import type { ReservationDto } from "~/database/dtos";
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

// IMPORTANT: change basicProcedure to protectedProcedure
// once auth is fully implemented (before shipping).
const adminProcedure = basicProcedure;

const { passwordHash: _, ...accountInfo } = getTableColumns(account);

const getReserverations = () => {
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

  getCourseEvents: adminProcedure.query(() => {
    return db.client
      .select({
        ...getTableColumns(courseEvent),
        courseName: course.courseName,
        courseDescription: course.description,
        courseCreditHours: course.creditHours,
        coursePrice: course.priceCents,
      })
      .from(courseEvent)
      .orderBy(asc(courseEvent.classStartDatetime))
      .leftJoin(course, eq(courseEvent.courseId, course.id));
  }),

  getReservations: adminProcedure.query(
    getReserverations as () => Promise<ReservationDto[]>,
  ),

  getTraineeReservations: adminProcedure
    .input(
      z.object({
        profileId: z.string(),
      }),
    )
    .query(({ input }): Promise<ReservationDto[]> => {
      return getReserverations().where(
        eq(reservation.profileId, input.profileId),
      );
    }),
});

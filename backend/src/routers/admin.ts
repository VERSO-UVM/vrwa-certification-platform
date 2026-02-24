import { asc, eq, getTableColumns } from "drizzle-orm";

import db from "~/database";
import {
  account,
  course,
  courseEvent,
  profile,
  reservation,
  Roles,
} from "~/database/schema.dts";
import type { Profile } from "~/database/schema.dts";
import { basicProcedure, router } from "~/utils/trpc";

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

  getReservations: adminProcedure.query(() => {
    return db.client
      .select({
        creditHours: reservation.creditHours,
        paymentStatus: reservation.paymentStatus,
        firstName: profile.firstName,
        lastName: profile.lastName,
        isMember: profile.isMember,
        classStartDateTime: courseEvent.classStartDatetime,
        courseName: course.courseName,
      })
      .from(reservation)
      .leftJoin(profile, eq(reservation.profileId, profile.id))
      .leftJoin(courseEvent, eq(reservation.courseEventId, courseEvent.id))
      .leftJoin(course, eq(course.id, courseEvent.courseId));
  }),
});

import { asc, eq, getTableColumns } from "drizzle-orm";

import db from "src/database";
import { account, course, courseEvent, profile, reservation, Roles } from "src/database/schema";
import type { AccountInfo, CourseEvent, Profile, Reservation } from "src/database/schema";
import { basicProcedure, router } from "src/utils/trpc";

// IMPORTANT: change basicProcedure to protectedProcedure
// once auth is fully implemented (before shipping).
const adminProcedure = basicProcedure;

const { passwordHash: _, ...accountInfo } = getTableColumns(account);

export const adminRouter = router({
  getTrainees: adminProcedure
    .query((): Promise<Profile[]> => {
      return db.client
        .select({
          ...getTableColumns(profile),
        })
        .from(profile)
        .orderBy(asc(profile.lastName))
        .leftJoin(account, eq(profile.accountId, account.id))
        .where(eq(account.role, Roles.Trainee));
    }),

  getCourseEvents: adminProcedure
    .query(() => {
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
        .leftJoin(course, eq(courseEvent.courseId, course.id))
    }),

  getReservations: adminProcedure
    .query((): Promise<Reservation[]> => {
      return db.client
        .select()
        .from(reservation)
    }),
});

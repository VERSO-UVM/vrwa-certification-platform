import { asc, eq, getTableColumns } from "drizzle-orm";
import { course, courseEvent, profile, reservation } from "~/database/schema";
import { instructorProcedure, router } from "~/utils/trpc";
import db from "~/database";
import { z } from "zod";

export const instructorRouter = router({
  getMyUpcomingCourses: instructorProcedure.query(({ ctx }) => {
    return db.client
      .select({
        ...getTableColumns(courseEvent),
        courseName: course.courseName,
        description: course.description,
        creditHours: course.creditHours,
      })
      .from(courseEvent)
      .where(eq(courseEvent.instructorId, ctx.account.id))
      .innerJoin(course, eq(courseEvent.courseId, course.id))
      .orderBy(asc(courseEvent.classStartDatetime));
  }),

  getEventRoster: instructorProcedure
    .input(z.object({ courseEventId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Security check: ensure the instructor is teaching this event
      const [event] = await db.client
        .select()
        .from(courseEvent)
        .where(eq(courseEvent.id, input.courseEventId));
      
      if (!event || event.instructorId !== ctx.account.id) {
        throw new Error("Unauthorized access to this event roster.");
      }

      const results = await db.client
        .select({
          profile: getTableColumns(profile),
          reservation: getTableColumns(reservation),
          userEmail: user.email,
        })
        .from(reservation)
        .innerJoin(profile, eq(reservation.profileId, profile.id))
        .innerJoin(user, eq(profile.accountId, user.id))
        .where(eq(reservation.courseEventId, input.courseEventId));
      
      return results;
    }),
});

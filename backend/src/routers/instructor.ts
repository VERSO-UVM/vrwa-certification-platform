import { TRPCError } from "@trpc/server";
import { asc, and, eq, getTableColumns } from "drizzle-orm";
import {
  course,
  courseEvent,
  profile,
  reservation,
  user,
} from "~/database/schema";
import { instructorProcedure, router } from "~/utils/trpc";
import db from "~/database";
import { z } from "zod";

export const instructorRouter = router({
  getMyUpcomingCourses: instructorProcedure.query(({ ctx }) => {
    return db.client
      .select({
        ...getTableColumns(courseEvent),
        courseEventId: courseEvent.id,
        courseName: course.courseName,
        description: course.description,
        creditHours: course.creditHours,
      })
      .from(courseEvent)
      .where(eq(courseEvent.instructorId, ctx.account.id))
      .innerJoin(course, eq(courseEvent.courseId, course.id))
      .orderBy(asc(courseEvent.classStartDatetime));
  }),

  getEventDetails: instructorProcedure
    .input(z.object({ courseEventId: z.string() }))
    .query(async ({ input, ctx }) => {
      const [event] = await db.client
        .select({
          ...getTableColumns(courseEvent),
          courseName: course.courseName,
          description: course.description,
          creditHours: course.creditHours,
          priceCents: course.priceCents,
          defaultCreditHours: course.creditHours,
        })
        .from(courseEvent)
        .innerJoin(course, eq(courseEvent.courseId, course.id))
        .where(eq(courseEvent.id, input.courseEventId));

      if (!event || event.instructorId !== ctx.account.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized event access.",
        });
      }
      return event;
    }),

  getEventRoster: instructorProcedure
    .input(z.object({ courseEventId: z.string() }))
    .query(async ({ input, ctx }) => {
      const [event] = await db.client
        .select({
          instructorId: courseEvent.instructorId,
          defaultCreditHours: course.creditHours,
        })
        .from(courseEvent)
        .innerJoin(course, eq(courseEvent.courseId, course.id))
        .where(eq(courseEvent.id, input.courseEventId));

      if (!event || event.instructorId !== ctx.account.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized access to this event roster.",
        });
      }

      const results = await db.client
        .select({
          profileId: reservation.profileId,
          courseEventId: reservation.courseEventId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          isMember: profile.isMember,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          postalCode: profile.postalCode,
          phoneNumber: profile.phoneNumber,
          email: user.email,
          creditHours: reservation.creditHours,
          paymentStatus: reservation.paymentStatus,
          status: reservation.status,
          attendanceMarkedAt: reservation.attendanceMarkedAt,
          defaultCreditHours: course.creditHours,
        })
        .from(reservation)
        .innerJoin(profile, eq(reservation.profileId, profile.id))
        .innerJoin(user, eq(profile.accountId, user.id))
        .innerJoin(courseEvent, eq(courseEvent.id, reservation.courseEventId))
        .innerJoin(course, eq(course.id, courseEvent.courseId))
        .where(eq(reservation.courseEventId, input.courseEventId));

      return results;
    }),

  markAttendance: instructorProcedure
    .input(
      z.object({
        courseEventId: z.string(),
        profileId: z.string(),
        creditHours: z.number().min(0).max(24),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [event] = await db.client
        .select({ instructorId: courseEvent.instructorId })
        .from(courseEvent)
        .where(eq(courseEvent.id, input.courseEventId));
      if (!event || event.instructorId !== ctx.account.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized event access.",
        });
      }

      const updated = await db.client
        .update(reservation)
        .set({
          creditHours: input.creditHours.toString(),
          attendanceMarkedAt: new Date(),
        })
        .where(
          and(
            eq(reservation.courseEventId, input.courseEventId),
            eq(reservation.profileId, input.profileId),
          ),
        )
        .returning();

      if (updated.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reservation not found.",
        });
      }
      return updated[0];
    }),

  unmarkAttendance: instructorProcedure
    .input(
      z.object({
        courseEventId: z.string(),
        profileId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [event] = await db.client
        .select({ instructorId: courseEvent.instructorId })
        .from(courseEvent)
        .where(eq(courseEvent.id, input.courseEventId));
      if (!event || event.instructorId !== ctx.account.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unauthorized event access.",
        });
      }

      const updated = await db.client
        .update(reservation)
        .set({
          creditHours: "0",
          attendanceMarkedAt: null,
        })
        .where(
          and(
            eq(reservation.courseEventId, input.courseEventId),
            eq(reservation.profileId, input.profileId),
          ),
        )
        .returning();

      if (updated.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reservation not found.",
        });
      }
      return updated[0];
    }),
});

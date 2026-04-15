import { asc, eq, getTableColumns, gt, lte, and } from "drizzle-orm";
import { course, courseEvent, reservation, profile } from "~/database/schema";
import { traineeProcedure, router } from "~/utils/trpc";
import db from "~/database";
import { z } from "zod";

export const traineeRouter = router({
  getMyUpcomingSessions: traineeProcedure.query(async ({ ctx }) => {
    // Get profiles associated with this account
    const profiles = await db.client
      .select({ id: profile.id })
      .from(profile)
      .where(eq(profile.accountId, ctx.account.id));
    
    const profileIds = profiles.map(p => p.id);
    if (profileIds.length === 0) return [];

    return db.client
      .select({
        ...getTableColumns(courseEvent),
        courseName: course.courseName,
        creditHours: course.creditHours,
        profileName: profile.firstName,
      })
      .from(reservation)
      .innerJoin(courseEvent, eq(reservation.courseEventId, courseEvent.id))
      .innerJoin(course, eq(courseEvent.courseId, course.id))
      .innerJoin(profile, eq(reservation.profileId, profile.id))
      .where(
        and(
          and(
            eq(profile.accountId, ctx.account.id),
            gt(courseEvent.classStartDatetime, new Date())
          )
        )
      )
      .orderBy(asc(courseEvent.classStartDatetime));
  }),

  getAllAvailableSessions: traineeProcedure.query(async () => {
    return db.client
      .select({
        ...getTableColumns(courseEvent),
        courseName: course.courseName,
        description: course.description,
        creditHours: course.creditHours,
        priceCents: course.priceCents,
      })
      .from(courseEvent)
      .innerJoin(course, eq(courseEvent.courseId, course.id))
      .where(gt(courseEvent.classStartDatetime, new Date()))
      .orderBy(asc(courseEvent.classStartDatetime));
  }),

  registerForSession: traineeProcedure
    .input(z.object({
      profileId: z.string(),
      courseEventId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. Verify profile belongs to account
      const [p] = await db.client
        .select()
        .from(profile)
        .where(and(eq(profile.id, input.profileId), eq(profile.accountId, ctx.account.id)));
      
      if (!p) throw new Error("Invalid profile.");

      // 2. Check if already registered
      const [existing] = await db.client
        .select()
        .from(reservation)
        .where(and(eq(reservation.profileId, input.profileId), eq(reservation.courseEventId, input.courseEventId)));
      
      if (existing) throw new Error("Already registered for this session.");

      // 3. Check event capacity
      const [event] = await db.client
        .select()
        .from(courseEvent)
        .where(eq(courseEvent.id, input.courseEventId));
      
      if (!event) throw new Error("Event not found.");

      const reservations = await db.client
        .select()
        .from(reservation)
        .where(and(eq(reservation.courseEventId, input.courseEventId), eq(reservation.status, "registered")));
      
      const isFull = event.seats !== null && reservations.length >= event.seats;

      // 4. Create reservation
      await db.client.insert(reservation).values({
        profileId: input.profileId,
        courseEventId: input.courseEventId,
        creditHours: "0", // 0 until course is completed
        paymentStatus: "unpaid",
        status: isFull ? "waitlisted" : "registered",
      });

      return { status: isFull ? "waitlisted" : "registered" };
    }),
});

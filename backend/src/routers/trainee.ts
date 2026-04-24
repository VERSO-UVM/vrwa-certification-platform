import { TRPCError } from "@trpc/server";
import {
  asc,
  eq,
  getTableColumns,
  gt,
  lt,
  and,
  count,
  sql,
  isNotNull,
} from "drizzle-orm";
import { course, courseEvent, reservation, profile } from "~/database/schema";
import { traineeProcedure, router } from "~/utils/trpc";
import db from "~/database";
import { z } from "zod";
import { getOrCreateStripeCustomerId } from "~/utils/stripe-customer";
import { createAndLinkRegistrationInvoice } from "~/utils/stripe-reservation";

export const traineeRouter = router({
  getMyUpcomingSessions: traineeProcedure.query(async ({ ctx }) => {
    // Get profiles associated with this account
    const profiles = await db.client
      .select({ id: profile.id })
      .from(profile)
      .where(eq(profile.accountId, ctx.account.id));

    const profileIds = profiles.map((p) => p.id);
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
            gt(courseEvent.classStartDatetime, new Date()),
          ),
        ),
      )
      .orderBy(asc(courseEvent.classStartDatetime));
  }),

  getMyPastSessions: traineeProcedure.query(async ({ ctx }) => {
    const profiles = await db.client
      .select({ id: profile.id })
      .from(profile)
      .where(eq(profile.accountId, ctx.account.id));

    if (profiles.length === 0) return [];

    return db.client
      .select({
        ...getTableColumns(courseEvent),
        profileId: reservation.profileId,
        courseName: course.courseName,
        creditHours: reservation.creditHours,
        profileName: profile.firstName,
      })
      .from(reservation)
      .innerJoin(courseEvent, eq(reservation.courseEventId, courseEvent.id))
      .innerJoin(course, eq(courseEvent.courseId, course.id))
      .innerJoin(profile, eq(reservation.profileId, profile.id))
      .where(
        and(
          eq(profile.accountId, ctx.account.id),
          lt(courseEvent.classStartDatetime, new Date()),
        ),
      )
      .orderBy(asc(courseEvent.classStartDatetime));
  }),

  getMyCompletedCourses: traineeProcedure.query(async ({ ctx }) => {
    return db.client
      .select({
        profileId: reservation.profileId,
        courseEventId: reservation.courseEventId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        courseName: course.courseName,
        classStartDatetime: courseEvent.classStartDatetime,
        creditHours: reservation.creditHours,
      })
      .from(reservation)
      .innerJoin(profile, eq(reservation.profileId, profile.id))
      .innerJoin(courseEvent, eq(reservation.courseEventId, courseEvent.id))
      .innerJoin(course, eq(courseEvent.courseId, course.id))
      .where(
        and(
          eq(profile.accountId, ctx.account.id),
          isNotNull(reservation.attendanceMarkedAt),
        ),
      )
      .orderBy(asc(courseEvent.classStartDatetime));
  }),

  getAllAvailableSessions: traineeProcedure.query(async () => {
    const reservedCounts = db.client
      .select({
        courseEventId: reservation.courseEventId,
        registeredCount: count().as("registeredCount"),
      })
      .from(reservation)
      .where(eq(reservation.status, "registered"))
      .groupBy(reservation.courseEventId)
      .as("reservedCounts");

    return db.client
      .select({
        ...getTableColumns(courseEvent),
        courseName: course.courseName,
        description: course.description,
        creditHours: course.creditHours,
        priceCents: course.priceCents,
        registeredCount: sql<number>`COALESCE(${reservedCounts.registeredCount}, 0)`,
        seatsRemaining: sql<number>`CASE
            WHEN ${courseEvent.seats} IS NULL THEN 999999
            ELSE GREATEST(${courseEvent.seats} - COALESCE(${reservedCounts.registeredCount}, 0), 0)
          END`,
        isFull: sql<boolean>`CASE
            WHEN ${courseEvent.seats} IS NULL THEN false
            ELSE COALESCE(${reservedCounts.registeredCount}, 0) >= ${courseEvent.seats}
          END`,
      })
      .from(courseEvent)
      .innerJoin(course, eq(courseEvent.courseId, course.id))
      .leftJoin(
        reservedCounts,
        eq(courseEvent.id, reservedCounts.courseEventId),
      )
      .where(gt(courseEvent.classStartDatetime, new Date()))
      .orderBy(asc(courseEvent.classStartDatetime));
  }),

  registerForSession: traineeProcedure
    .input(
      z.object({
        profileId: z.string(),
        courseEventId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [ownedProfile] = await db.client
        .select()
        .from(profile)
        .where(
          and(
            eq(profile.id, input.profileId),
            eq(profile.accountId, ctx.account.id),
          ),
        );

      if (!ownedProfile)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid profile.",
        });

      // 2. Check if already registered
      const [existing] = await db.client
        .select()
        .from(reservation)
        .where(
          and(
            eq(reservation.profileId, input.profileId),
            eq(reservation.courseEventId, input.courseEventId),
          ),
        );

      if (existing)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Already registered for this session.",
        });

      const [event] = await db.client
        .select()
        .from(courseEvent)
        .where(eq(courseEvent.id, input.courseEventId));

      if (!event)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Event not found.",
        });
      if (event.classStartDatetime && event.classStartDatetime < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot register for a past session",
        });
      }

      const existingRegisteredCount = await db.client
        .select()
        .from(reservation)
        .where(
          and(
            eq(reservation.courseEventId, input.courseEventId),
            eq(reservation.status, "registered"),
          ),
        );

      const isFull =
        event.seats !== null && existingRegisteredCount.length >= event.seats;

      // 4. Create reservation
      await db.client.insert(reservation).values({
        profileId: input.profileId,
        courseEventId: input.courseEventId,
        creditHours: "0", // 0 until course is completed
        paymentStatus: "unpaid",
        status: isFull ? "waitlisted" : "registered",
      });

      if (!isFull) {
        const [courseRow] = await db.client
          .select()
          .from(course)
          .where(eq(course.id, event.courseId));
        if (!courseRow) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Course not found for this event.",
          });
        }
        try {
          const stripeCustomerId = await getOrCreateStripeCustomerId(
            ctx.account.id,
          );
          await createAndLinkRegistrationInvoice({
            profileId: input.profileId,
            courseEventId: input.courseEventId,
            priceCents: courseRow.priceCents,
            courseName: courseRow.courseName,
            stripeCustomerId,
          });
        } catch (err) {
          await db.client
            .delete(reservation)
            .where(
              and(
                eq(reservation.profileId, input.profileId),
                eq(reservation.courseEventId, input.courseEventId),
              ),
            );
          if (err instanceof TRPCError) throw err;
          const message = err instanceof Error ? err.message : "Billing error";
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message,
          });
        }
      }

      return { status: isFull ? "waitlisted" : "registered" };
    }),

  registerMultipleForSession: traineeProcedure
    .input(
      z.object({
        profileIds: z.array(z.string()).min(1),
        courseEventId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const uniqueProfileIds = Array.from(new Set(input.profileIds));
      const ownedProfiles = await db.client
        .select({
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
        })
        .from(profile)
        .where(eq(profile.accountId, ctx.account.id));
      const ownedProfileMap = new Map(ownedProfiles.map((p) => [p.id, p]));

      const hasInvalidProfile = uniqueProfileIds.some(
        (profileId) => !ownedProfileMap.has(profileId),
      );
      if (hasInvalidProfile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more selected profiles are invalid.",
        });
      }

      const [event] = await db.client
        .select()
        .from(courseEvent)
        .where(eq(courseEvent.id, input.courseEventId));

      if (!event) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Event not found.",
        });
      }

      if (event.classStartDatetime && event.classStartDatetime < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot register for a past session",
        });
      }

      const existingReservations = await db.client
        .select()
        .from(reservation)
        .where(eq(reservation.courseEventId, input.courseEventId));

      const existingByProfileId = new Set(
        existingReservations.map((r) => r.profileId),
      );
      let registeredCount = existingReservations.filter(
        (r) => r.status === "registered",
      ).length;

      const results: Array<{
        profileId: string;
        profileName: string;
        status: "registered" | "waitlisted" | "already_registered";
      }> = [];

      const [courseRow] = await db.client
        .select()
        .from(course)
        .where(eq(course.id, event.courseId));

      if (!courseRow) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Course not found for this event.",
        });
      }

      let cachedStripeCustomerId: string | null = null;
      const getCustomerId = async () => {
        if (!cachedStripeCustomerId) {
          cachedStripeCustomerId = await getOrCreateStripeCustomerId(
            ctx.account.id,
          );
        }
        return cachedStripeCustomerId;
      };

      for (const profileId of uniqueProfileIds) {
        const profileData = ownedProfileMap.get(profileId);
        if (!profileData) continue;

        if (existingByProfileId.has(profileId)) {
          results.push({
            profileId,
            profileName: `${profileData.firstName} ${profileData.lastName}`,
            status: "already_registered",
          });
          continue;
        }

        const shouldWaitlist =
          event.seats !== null && registeredCount >= event.seats;
        const status = shouldWaitlist ? "waitlisted" : "registered";

        await db.client.insert(reservation).values({
          profileId,
          courseEventId: input.courseEventId,
          creditHours: "0",
          paymentStatus: "unpaid",
          status,
        });

        existingByProfileId.add(profileId);
        if (status === "registered") {
          registeredCount++;
        }

        if (status === "registered") {
          try {
            const stripeCustomerId = await getCustomerId();
            await createAndLinkRegistrationInvoice({
              profileId,
              courseEventId: input.courseEventId,
              priceCents: courseRow.priceCents,
              courseName: courseRow.courseName,
              stripeCustomerId,
            });
          } catch (err) {
            await db.client
              .delete(reservation)
              .where(
                and(
                  eq(reservation.profileId, profileId),
                  eq(reservation.courseEventId, input.courseEventId),
                ),
              );
            if (err instanceof TRPCError) throw err;
            const message =
              err instanceof Error ? err.message : "Billing error";
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message,
            });
          }
        }

        results.push({
          profileId,
          profileName: `${profileData.firstName} ${profileData.lastName}`,
          status,
        });
      }

      return { results };
    }),
});

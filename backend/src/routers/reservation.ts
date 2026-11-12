import { and, asc, desc, eq, gt, inArray, lt, sql } from "drizzle-orm";

import db from "~/database";
import {
  course,
  courseEvent,
  CourseStatus,
  PaymentRate,
  PaymentStatus,
  profile,
  reservation,
  ReservationStatus,
} from "~/database/schema";
import {
  adminProcedure,
  instructorProcedure,
  traineeProcedure,
  router,
} from "~/utils/trpc";
import { createUpdateSchema } from "drizzle-orm/zod";
import z from "zod";
import {
  courseFindFirst,
  courseStartQuery,
  reservationQuery,
} from "~/database/queries";
import type { ReservationDto } from "~/database/dtos";
import { TRPCError } from "@trpc/server";
import { hasAttended } from "~/database/filters";
import { unitPriceCents } from "~/utils/pricing";
import {
  markReservationsPaidForSession,
  sendCheckInvoice,
  stripe,
} from "~/utils/stripe";
import { TRUSTED_ORIGINS } from "~/constants";
import { customAlphabet } from "nanoid";

const randomSuffix = customAlphabet("abcdefghijklmnopqrstuvwxyz", 8);

function isFutureClass() {
  return gt(courseStartQuery.courseStart, new Date());
}

function isPastClass() {
  return lt(courseStartQuery.courseStart, new Date());
}

const updateSchema = createUpdateSchema(reservation, {
  courseId: z.string(),
  profileId: z.string(),
  paymentStatus: z.enum(PaymentStatus).optional(),
  reservationStatus: z.enum(ReservationStatus).optional(),
}).pick({
  courseId: true,
  profileId: true,
  paymentStatus: true,
  reservationStatus: true,
  creditHours: true,
});

export const reservationRouter = router({
  admin: router({
    update: adminProcedure.input(updateSchema).mutation(({ input }) => {
      return db.client
        .update(reservation)
        .set({
          ...input,
          /* Track last time we updated reservation status */
          ...(input.reservationStatus !== undefined && {
            statusUpdatedAt: new Date(),
          }),
        })
        .where(
          and(
            eq(reservation.profileId, input.profileId),
            eq(reservation.courseId, input.courseId),
          ),
        )
        .returning();
    }),

    get: adminProcedure
      .input(
        z.object({
          courseId: z.string(),
          profileId: z.string(),
        }),
      )
      .query(async ({ input }) => {
        const reservations = await reservationQuery().where(
          and(
            eq(reservation.profileId, input.profileId),
            eq(reservation.courseId, input.courseId),
          ),
        );
        const found = reservations[0];
        if (!found) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No reservation found.",
          });
        }
        return found;
      }),

    list: adminProcedure.query(() =>
      reservationQuery().orderBy(
        desc(courseStartQuery.courseStart),
        asc(profile.lastName),
      ),
    ),

    listTrainee: adminProcedure
      .input(
        z.object({
          profileId: z.string(),
        }),
      )
      .query(({ input }): Promise<ReservationDto[]> => {
        return reservationQuery()
          .orderBy(courseStartQuery.courseStart)
          .where(eq(reservation.profileId, input.profileId));
      }),

    listCourse: adminProcedure
      .input(z.object({ courseId: z.string() }))
      .query(({ input }) =>
        reservationQuery()
          .where(eq(course.id, input.courseId))
          .orderBy(courseStartQuery.courseStart),
      ),

    create: adminProcedure
      .input(
        z.object({
          profileId: z.string(),
          courseId: z.string(),
          creditHours: z.string(),
          paymentStatus: z.enum(PaymentStatus),
        }),
      )
      .mutation(async ({ input }) => {
        const [newReservation] = await db.client
          .insert(reservation)
          .values({
            ...input,
            creditHours: input.creditHours,
            reservationStatus: ReservationStatus.Accepted,
          })
          .returning();

        return newReservation;
      }),

    delete: adminProcedure
      .input(
        z.object({
          profileId: z.string(),
          courseId: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const deletedRows = await db.client
          .delete(reservation)
          .where(
            and(
              eq(reservation.courseId, input.courseId),
              eq(reservation.profileId, input.profileId),
            ),
          )
          .returning();

        return { success: true };
      }),
  }),

  instructor: router({
    listCourse: instructorProcedure
      .input(
        z.object({
          courseId: z.string(),
        }),
      )
      .query(async ({ input: { courseId } }) => {
        return await reservationQuery()
          .where(eq(reservation.courseId, courseId))
          .orderBy(asc(profile.lastName));
      }),

    updateCreditHours: instructorProcedure
      .input(
        z.object({
          courseId: z.string(),
          profileId: z.string(),
          creditHours: z.string(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const course = await db.client.query.course.findFirst({
          where: { id: input.courseId },
        });
        if (!course || course.instructorId !== ctx.session.activeProfileId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Unauthorized event access.",
          });
        }

        const updated = await db.client
          .update(reservation)
          .set({
            creditHours: input.creditHours,
          })
          .where(
            and(
              eq(reservation.courseId, course.id),
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
  }),
  trainee: router({
    listUpcoming: traineeProcedure.query(
      ({ ctx }): Promise<ReservationDto[]> => {
        if (ctx.session.activeProfileId == null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No currently active profile.",
          });
        }
        return reservationQuery()
          .where(
            and(
              isFutureClass(),
              eq(reservation.profileId, ctx.session.activeProfileId),
            ),
          )
          .orderBy(asc(courseStartQuery.courseStart));
      },
    ),

    listCompleted: traineeProcedure.query(
      ({ ctx }): Promise<ReservationDto[]> => {
        if (ctx.session.activeProfileId == null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No currently active profile.",
          });
        }
        return reservationQuery()
          .where(
            and(
              isPastClass(),
              hasAttended(),
              eq(reservation.profileId, ctx.session.activeProfileId),
            ),
          )
          .orderBy(desc(courseStartQuery.courseStart));
      },
    ),

    /**
     * Create reservations for the caller's profiles on a course.
     * Seats are held immediately; payment updates status afterward.
     */
    register: traineeProcedure
      .input(
        z.object({
          courseId: z.string(),
          profileIds: z.array(z.string()).min(1),
          paymentRate: z.enum(PaymentRate),
          waitlist: z.boolean(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const uniqueProfileIds = [...new Set(input.profileIds)];

        return db.client.transaction(async (tx) => {
          const [lockedCourse] = await tx
            .select()
            .from(course)
            .where(eq(course.id, input.courseId))
            .for("update");

          if (!lockedCourse || lockedCourse.status !== CourseStatus.Active) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Course is not available for registration.",
            });
          }

          const [startRow] = await tx
            .select({
              courseStart: sql<Date | null>`min(${courseEvent.classStartDatetime})`.mapWith(
                (v) => (v == null ? null : new Date(v)),
              ),
            })
            .from(courseEvent)
            .where(eq(courseEvent.courseId, input.courseId));

          if (!startRow?.courseStart || startRow.courseStart <= new Date()) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Course has already started.",
            });
          }

          const ownedProfiles = await tx
            .select({ id: profile.id })
            .from(profile)
            .where(
              and(
                eq(profile.userId, ctx.account.id),
                inArray(profile.id, uniqueProfileIds),
              ),
            );

          if (ownedProfiles.length !== uniqueProfileIds.length) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "One or more profiles do not belong to this account.",
            });
          }

          const existing = await tx
            .select({ profileId: reservation.profileId })
            .from(reservation)
            .where(
              and(
                eq(reservation.courseId, input.courseId),
                inArray(reservation.profileId, uniqueProfileIds),
              ),
            );

          if (existing.length > 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "One or more profiles are already registered.",
            });
          }

          if (!input.waitlist) {
            const [countRow] = await tx
              .select({
                spotsFilled: sql<number>`count(*)::int`.mapWith(Number),
              })
              .from(reservation)
              .where(
                and(
                  eq(reservation.courseId, input.courseId),
                  eq(
                    reservation.reservationStatus,
                    ReservationStatus.Accepted,
                  ),
                ),
              );

            const seatsLeft = lockedCourse.seats - (countRow?.spotsFilled ?? 0);
            if (uniqueProfileIds.length > seatsLeft) {
              throw new TRPCError({
                code: "CONFLICT",
                message:
                  "Not enough seats remaining. Please join the waitlist instead.",
              });
            }
          }

          const inserted = await tx
            .insert(reservation)
            .values(
              uniqueProfileIds.map((profileId) => ({
                profileId,
                courseId: input.courseId,
                reservationStatus: input.waitlist
                  ? ReservationStatus.Waitlisted
                  : ReservationStatus.Accepted,
                paymentStatus: PaymentStatus.Draft,
                creditHours: "0",
                paymentRate: input.paymentRate,
              })),
            )
            .returning({ id: reservation.id });

          return { reservationIds: inserted.map((row) => row.id) };
        });
      }),

    createCheckoutSession: traineeProcedure
      .input(
        z.object({
          reservationIds: z.array(z.string()).min(1),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const rows = await loadOwnedUnpaidAcceptedReservations(
          ctx.account.id,
          input.reservationIds,
        );

        const courseId = rows[0]!.courseId;
        const courseRow = await courseFindFirst(courseId);
        if (!courseRow) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Course not found.",
          });
        }

        const paymentRate = rows[0]!.paymentRate;
        if (rows.some((r) => r.paymentRate !== paymentRate)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Reservations have inconsistent payment rates.",
          });
        }

        const unitCents = unitPriceCents(courseRow.priceCents, paymentRate);
        const webappUrl = TRUSTED_ORIGINS[0] ?? "http://localhost:5173";
        const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;

        const session = await stripe.checkout.sessions.create({
          ui_mode: "embedded_page",
          mode: "payment",
          line_items: [
            {
              quantity: rows.length,
              price_data: {
                currency: "usd",
                unit_amount: unitCents,
                product_data: {
                  name: courseRow.courseName,
                },
              },
            },
          ],
          metadata: {
            courseId,
          },
          return_url: `${webappUrl}/trainee/registration/${courseId}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
          expires_at: expiresAt,
          integration_identifier: `vrwa-reg-${randomSuffix()}`,
        });

        if (!session.client_secret) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Stripe did not return a client secret.",
          });
        }

        await db.client
          .update(reservation)
          .set({
            stripeCheckoutSessionId: session.id,
            paymentStatus: PaymentStatus.Open,
          })
          .where(
            inArray(
              reservation.id,
              rows.map((r) => r.id),
            ),
          );

        return { clientSecret: session.client_secret, sessionId: session.id };
      }),

    payByCheck: traineeProcedure
      .input(
        z.object({
          reservationIds: z.array(z.string()).min(1),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const rows = await loadOwnedUnpaidAcceptedReservations(
          ctx.account.id,
          input.reservationIds,
        );

        const courseId = rows[0]!.courseId;
        const courseRow = await courseFindFirst(courseId);
        if (!courseRow) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Course not found.",
          });
        }

        const paymentRate = rows[0]!.paymentRate;
        const unitCents = unitPriceCents(courseRow.priceCents, paymentRate);

        await db.client
          .update(reservation)
          .set({ paymentStatus: PaymentStatus.Open })
          .where(
            inArray(
              reservation.id,
              rows.map((r) => r.id),
            ),
          );

        await sendCheckInvoice({
          reservationIds: rows.map((r) => r.id),
          email: ctx.account.email,
          courseName: courseRow.courseName,
          amountCents: unitCents * rows.length,
        });

        return { success: true as const };
      }),

    registrationStatus: traineeProcedure
      .input(
        z
          .object({
            reservationIds: z.array(z.string()).optional(),
            sessionId: z.string().optional(),
          })
          .refine((v) => (v.reservationIds?.length ?? 0) > 0 || !!v.sessionId, {
            message: "Provide reservationIds or sessionId.",
          }),
      )
      .query(async ({ ctx, input }) => {
        let sessionPaymentStatus: string | null = null;

        if (input.sessionId) {
          const session = await stripe.checkout.sessions.retrieve(
            input.sessionId,
          );
          sessionPaymentStatus = session.payment_status;
          if (session.payment_status === "paid") {
            await markReservationsPaidForSession(session.id);
          }
        }

        const ownedProfileIds = (
          await db.client
            .select({ id: profile.id })
            .from(profile)
            .where(eq(profile.userId, ctx.account.id))
        ).map((p) => p.id);

        if (ownedProfileIds.length === 0) {
          return { reservations: [], sessionPaymentStatus };
        }

        const filters = [
          inArray(reservation.profileId, ownedProfileIds),
          ...(input.sessionId
            ? [eq(reservation.stripeCheckoutSessionId, input.sessionId)]
            : []),
          ...(input.reservationIds?.length
            ? [inArray(reservation.id, input.reservationIds)]
            : []),
        ];

        const rows = await db.client
          .select({
            id: reservation.id,
            courseId: reservation.courseId,
            profileId: reservation.profileId,
            reservationStatus: reservation.reservationStatus,
            paymentStatus: reservation.paymentStatus,
            paymentRate: reservation.paymentRate,
            stripeCheckoutSessionId: reservation.stripeCheckoutSessionId,
            firstName: profile.firstName,
            lastName: profile.lastName,
            courseName: course.courseName,
          })
          .from(reservation)
          .innerJoin(profile, eq(reservation.profileId, profile.id))
          .innerJoin(course, eq(reservation.courseId, course.id))
          .where(and(...filters));

        return { reservations: rows, sessionPaymentStatus };
      }),
  }),
});

async function loadOwnedUnpaidAcceptedReservations(
  userId: string,
  reservationIds: string[],
) {
  const uniqueIds = [...new Set(reservationIds)];
  const rows = await db.client
    .select({
      id: reservation.id,
      courseId: reservation.courseId,
      profileId: reservation.profileId,
      paymentRate: reservation.paymentRate,
      paymentStatus: reservation.paymentStatus,
      reservationStatus: reservation.reservationStatus,
      userId: profile.userId,
    })
    .from(reservation)
    .innerJoin(profile, eq(reservation.profileId, profile.id))
    .where(inArray(reservation.id, uniqueIds));

  if (rows.length !== uniqueIds.length) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "One or more reservations were not found.",
    });
  }

  if (rows.some((r) => r.userId !== userId)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Reservations do not belong to this account.",
    });
  }

  if (
    rows.some(
      (r) =>
        r.reservationStatus !== ReservationStatus.Accepted ||
        r.paymentStatus === PaymentStatus.Paid,
    )
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Reservations are not eligible for payment.",
    });
  }

  const courseId = rows[0]!.courseId;
  if (rows.some((r) => r.courseId !== courseId)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Reservations must be for the same course.",
    });
  }

  return rows;
}

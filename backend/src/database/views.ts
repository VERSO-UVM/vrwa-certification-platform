/**
 * Helpful views that include common join operations.
 * This reduces repetitiona and lets us use Drizzle utilities to create zod validation
 * and types easily in dtos.ts. We also want to select views that would
 * be helpful to VRWA administrators that wish to inspect the database
 * directly.
 */

import { eq, getTableColumns, sql } from "drizzle-orm";
import { pgView } from "drizzle-orm/pg-core";
import { course, courseEvent, profile, reservation } from "./schema";

export const courseEventView = pgView("courseEventView").as((qb) =>
  qb
    .select({
      ...getTableColumns(courseEvent),
      courseName: course.courseName,
      description: course.description,
      creditHours: course.creditHours,
      priceCents: course.priceCents,
    })
    .from(courseEvent)
    .innerJoin(course, eq(courseEvent.courseId, course.id)),
);

export const reservationView = pgView("reservationView").as((qb) =>
  qb
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
        // Drizzle is very stupid and generates invalid SQL instead of
        // automatically aliasing duplicate names
        creditHours: sql`${course.creditHours}`.as("courseCreditHours"),
      },
    })
    .from(reservation)
    .innerJoin(profile, eq(reservation.profileId, profile.id))
    .innerJoin(courseEvent, eq(reservation.courseEventId, courseEvent.id))
    .innerJoin(course, eq(course.id, courseEvent.courseId)),
);

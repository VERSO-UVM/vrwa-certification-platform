/**
 * Common helper queries. Functions return dynamic query builders
 * that allow adding additional clauses. Use existing DTO types
 * when possible. These are like database views but database views
 * add a lot of hassle for little benefit for our use cases.
 */
import { asc, eq, getColumns, min } from "drizzle-orm";
import {
  course,
  courseEvent,
  profile,
  reservation,
  user,
  type Profile,
} from "~/database/schema";
import type { CourseEventDto, ReservationDto, UserDto } from "./dtos";
import db from ".";

const { id: _, ...profileFields } = getColumns(profile);
const reservationFields = getColumns(reservation);

export const courseStartQuery = db.client
  .select({
    courseId: courseEvent.courseId,
    courseStart: min(courseEvent.classStartDatetime).as("courseStart"),
  })
  .from(courseEvent)
  .groupBy(courseEvent.courseId)
  .as("course_start");

export function reservationQuery() {
  // Subquery: want date of first course session
  return db.client
    .select({
      ...reservationFields,
      ...profileFields,
      email: user.email,
      classStartDatetime: courseStartQuery.courseStart,
      course: {
        id: course.id,
        courseName: course.courseName,
        creditHours: course.creditHours,
        seats: course.seats,
      },
    })
    .from(reservation)
    .innerJoin(profile, eq(reservation.profileId, profile.id))
    .innerJoin(user, eq(profile.userId, user.id))
    .innerJoin(course, eq(reservation.courseId, course.id))
    .leftJoin(
      courseStartQuery,
      eq(reservation.courseId, courseStartQuery.courseId),
    )
    .$dynamic() satisfies Promise<ReservationDto[]>;
}

export function courseEventQuery() {
  return db.client
    .select({
      ...getColumns(courseEvent),
      seats: course.seats,
      instructorId: course.instructorId,
      courseName: course.courseName,
      description: course.description,
      creditHours: course.creditHours,
      priceCents: course.priceCents,
    })
    .from(courseEvent)
    .orderBy(asc(courseEvent.classStartDatetime))
    .innerJoin(course, eq(courseEvent.courseId, course.id))
    .$dynamic() satisfies Promise<CourseEventDto[]>;
}

export function profilesQuery() {
  return db.client
    .select({
      ...getColumns(profile),
    })
    .from(profile)
    .orderBy(asc(profile.lastName))
    .leftJoin(user, eq(profile.userId, user.id))
    .$dynamic() satisfies Promise<Profile[]>;
}

export function usersWithProfilesQuery() {
  return db.client.query.user.findMany({
    columns: {
      id: true,
      role: true,
      email: true,
    },
    with: {
      profiles: true,
    },
    orderBy: (user, { asc }) => [asc(user.name)],
  }) satisfies Promise<UserDto[]>;
}

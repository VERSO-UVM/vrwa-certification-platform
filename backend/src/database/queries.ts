/**
 * Common helper queries. Functions return dynamic query builders
 * that allow adding additional clauses. Use existing DTO types
 * when possible. These are like database views but database views
 * add a lot of hassle for little benefit for our use cases.
 */
import { asc, eq, getTableColumns } from "drizzle-orm";
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

export function reservationQuery() {
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
      seats: courseEvent.seats,
      course: {
        id: course.id,
        courseName: course.courseName,
        creditHours: course.creditHours,
      },
    })
    .from(reservation)
    .innerJoin(profile, eq(reservation.profileId, profile.id))
    .innerJoin(courseEvent, eq(reservation.courseEventId, courseEvent.id))
    .innerJoin(course, eq(course.id, courseEvent.courseId))
    .orderBy(courseEvent.classStartDatetime, profile.lastName)
    .$dynamic() satisfies Promise<ReservationDto[]>;
}

export function courseEventQuery() {
  return db.client
    .select({
      ...getTableColumns(courseEvent),
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
      ...getTableColumns(profile),
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
  }) satisfies Promise<UserDto[]>;
}

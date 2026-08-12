/**
 * Common helper queries. Functions return dynamic query builders
 * that allow adding additional clauses. Use existing DTO types
 * when possible. These are like database views but database views
 * add a lot of hassle for little benefit for our use cases.
 */
import { asc, eq, getColumns, min, sql } from "drizzle-orm";
import {
  course,
  courseEvent,
  member,
  memberGroup,
  MembershipStatus,
  profile,
  reservation,
  user,
  type Profile,
} from "~/database/schema";
import type {
  CourseDto,
  CourseEventDto,
  ReservationDto,
  UserDto,
} from "./dtos";
import db from ".";

const reservationFields = getColumns(reservation);

// Subquery: want date of first course session
export const courseStartQuery = db.client
  .select({
    courseId: courseEvent.courseId,
    courseStart: min(courseEvent.classStartDatetime).as("courseStart"),
  })
  .from(courseEvent)
  .groupBy(courseEvent.courseId)
  .as("course_start");

const isMemberFilter = sql<boolean>`${memberGroup.membershipStatus} = ${MembershipStatus.Active}`;

const courseStartDate = (t: typeof course) =>
  sql<Date>`(
        select ${courseStartQuery.courseStart}
        from ${courseStartQuery}
        where ${courseStartQuery.courseId} = ${t.id}
      )`.mapWith(courseEvent.classStartDatetime);

const courseReservations = (t: typeof course) =>
  db.client.$count(reservation, eq(reservation.courseId, t.id));

export function reservationQuery() {
  const { id: _, ...profileFields } = getColumns(profile);
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
      isMember: isMemberFilter,
    })
    .from(reservation)
    .innerJoin(profile, eq(reservation.profileId, profile.id))
    .innerJoin(user, eq(profile.userId, user.id))
    .innerJoin(course, eq(reservation.courseId, course.id))
    .leftJoin(memberGroup, eq(profile.memberGroupId, memberGroup.id))
    .leftJoin(
      courseStartQuery,
      eq(reservation.courseId, courseStartQuery.courseId),
    )
    .$dynamic() satisfies Promise<ReservationDto[]>;
}

export function courseEventQuery() {
  const { id: _, ...courseFields } = getColumns(course);
  return db.client
    .select({
      ...getColumns(courseEvent),
      ...courseFields,
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
      isMember: isMemberFilter,
    })
    .from(profile)
    .orderBy(asc(profile.lastName))
    .leftJoin(user, eq(profile.userId, user.id))
    .leftJoin(memberGroup, eq(profile.memberGroupId, memberGroup.id))
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
    orderBy: (user, { asc }) => [asc(user.email)],
  }) satisfies Promise<UserDto[]>;
}

export function courseFindFirst(courseId?: string) {
  return db.client.query.course.findFirst({
    where: {
      id: courseId,
    },
    with: {
      sessions: {
        orderBy: (t, { asc }) => asc(t.id),
      },
      credits: true,
    },
    extras: {
      startDate: courseStartDate,
      numReservations: courseReservations,
    },
  }) satisfies Promise<CourseDto | undefined>;
}

export type UsersQueryConfig = NonNullable<
  Parameters<typeof db.client.query.course.findMany>[0]
>;
export type UsersWhereField = UsersQueryConfig["where"];

export function courseFindMany(where: UsersWhereField) {
  return db.client.query.course.findMany({
    where: {
      ...where,
    },
    with: {
      sessions: {
        orderBy: (t, { asc }) => asc(t.id),
      },
      credits: true,
    },
    extras: {
      startDate: courseStartDate,
      numReservations: courseReservations,
    },
  }) satisfies Promise<CourseDto[]>;
}

// This file defines the structures used in API responses. So this file is meant
// to be imported (`import type` only) in both the server and the client. (These are
// called DTOs (Data Transfer Objects))

import {
  type Course,
  type CourseEvent,
  type Profile,
  type Reservation,
  type User,
} from "./schema";

export type ReservationDto = Reservation &
  Pick<Profile, "firstName" | "lastName" | "isMember"> & {
    classStartDatetime: Date | string | null;
  } & {
    course: Pick<Course, "courseName" | "creditHours" | "id">;
  };

export type CourseEventDto = Omit<CourseEvent, "classStartDatetime"> & {
  classStartDatetime: Date | string | null;
} & Pick<Course, "courseName" | "description" | "creditHours" | "priceCents">;

export type UserDto = Pick<
  User,
  "id" | "email" | "name" | "role" | "createdAt"
>;

// This file defines the structures used in API responses. So this file is meant
// to be imported (`import type` only) in both the server and the client. (These are
// called DTOs (Data Transfer Objects))

import type { Course, CourseEvent, Profile, Reservation } from "./schema.dts";

export type ReservationDto =
  | Reservation
  | Pick<Profile, "firstName" | "lastName" | "isMember">
  | Pick<Course, "courseName" | "creditHours">;

export type CourseEventDto =
  | CourseEvent
  | Pick<Course, "courseName" | "description" | "creditHours" | "priceCents">;

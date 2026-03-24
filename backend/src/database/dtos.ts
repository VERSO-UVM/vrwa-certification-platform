// This file defines the structures used in API responses. So this file is meant
// to be imported (`import type` only) in both the server and the client. (These are
// called DTOs (Data Transfer Objects))

import { courseEvent, type Course, type CourseEvent, type Profile, type Reservation } from "./schema";

export type ReservationDto =
  Reservation &
  Pick<Profile, "firstName" | "lastName" | "isMember"> &
  Pick<Course, "courseName" | "creditHours" | "id"> &
  Pick<CourseEvent, "classStartDatetime">;

export type CourseEventDto =
  & CourseEvent
  & Pick<Course, "courseName" | "description" | "creditHours" | "priceCents">;

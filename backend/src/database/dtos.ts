// This file defines the structures used in API responses. So this file is meant
// to be imported (`import type` only) in both the server and the client. (These are
// called DTOs (Data Transfer Objects))

import {
  user,
  profile,
  type Reservation,
  type Profile,
  type CourseEvent,
  type Course,
} from "./schema";
import { createSelectSchema } from "drizzle-zod";
import z from "zod";

export type ReservationDto = Reservation &
  Pick<Profile, "firstName" | "lastName" | "isMember"> &
  Pick<CourseEvent, "classStartDatetime" | "seats"> & {
    course: Pick<Course, "courseName" | "creditHours" | "id">;
  };

export type CourseEventDto = CourseEvent &
  Pick<Course, "courseName" | "description" | "creditHours" | "priceCents">;

export const ProfileDtoSchema = createSelectSchema(profile);
export type ProfileDto = z.infer<typeof ProfileDtoSchema>;

export const UserDtoSchema = createSelectSchema(user)
  .pick({
    id: true,
    email: true,
    role: true,
  })
  .extend({
    profiles: z.array(ProfileDtoSchema),
  });
export type UserDto = z.infer<typeof UserDtoSchema>;

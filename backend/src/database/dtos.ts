// This file defines the structures used in API responses. So this file is meant
// to be imported (`import type` only) in both the server and the client. (These are
// called DTOs (Data Transfer Objects))

import type { User } from "better-auth";
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
  Omit<Profile, "id"> &
  Pick<User, "email"> &
  Pick<CourseEvent, "seats"> & {
    course: Pick<Course, "courseName" | "creditHours" | "id">;
    // TODO: use superjson (see below)
    classStartDatetime: string|null;
  };

export type CourseEventDto = Omit<CourseEvent, "classStartDatetime"> &
  Pick<Course, "courseName" | "description" | "creditHours" | "priceCents"> & {
    // TODO: use superjson library so this can be serialized/deserialized as a Date
    // and avoid typescript linting errors
    classStartDatetime: string|null;
  };

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

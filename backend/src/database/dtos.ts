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
import { createSelectSchema } from "drizzle-orm/zod";
import z from "zod";

// refactor: follow format of course: make profile fields accessed with
// .profile and user fields with .user
export type ReservationDto = Reservation &
  Omit<Profile, "id"> &
  Pick<User, "email"> &
  Pick<CourseEvent, "classStartDatetime"> & {
    course: Pick<Course, "courseName" | "creditHours" | "id" | "seats">;
    isMember: boolean;
  };

export type CourseEventDto = CourseEvent & Omit<Course, "id">;

export type CourseDto = Course & {
  sessions: CourseEvent[];
  spotsFilled: number;
  waitlistSize: number;
};

export const ProfileDtoSchema = createSelectSchema(profile)
  .extend({
    isMember: z.boolean(),
  })
  .omit({
    createdAt: true,
  });
export type ProfileDto = z.infer<typeof ProfileDtoSchema>;

export const UserDtoSchema = createSelectSchema(user)
  .pick({
    id: true,
    email: true,
    role: true,
  })
  .extend({
    profiles: z.array(createSelectSchema(profile)),
  });
export type UserDto = z.infer<typeof UserDtoSchema>;

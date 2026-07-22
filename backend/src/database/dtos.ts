// This file defines the structures used in API responses. So this file is meant
// to be imported (`import type` only) in both the server and the client. (These are
// called DTOs (Data Transfer Objects))

import {
  user,
  profile,
} from "./schema";
import {
  createSelectSchema,
} from "drizzle-zod";
import z from "zod";
import { courseEventView, reservationView } from "./views";

// Here we are using the drizzle zod integration to create schemas straight
// from the database views, but they can also be altered with .pick(),
// .omit(), and .extend()
export const ReservationDtoSchema = createSelectSchema(reservationView);
export type ReservationDto = z.infer<typeof ReservationDtoSchema>;

export const CourseEventDtoSchema = createSelectSchema(courseEventView);
export type CourseEventDto = z.infer<typeof CourseEventDtoSchema>;

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

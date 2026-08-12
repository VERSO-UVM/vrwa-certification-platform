import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  profile: {
    user: r.one.user({
      from: r.profile.userId,
      to: r.user.id,
      optional: true,
    }),
  },

  user: {
    profiles: r.many.profile(),
  },

  courseMatter: {
    course: r.one.course({
      from: r.courseMatter.courseId,
      to: r.course.id,
      optional: false,
    }),
    attendance: r.many.attendanceRecord(),
  },

  attendanceRecord: {
    profile: r.one.profile({
      from: r.attendanceRecord.profileId,
      to: r.profile.id,
      optional: false,
    }),
    courseMatter: r.one.courseMatter({
      from: r.attendanceRecord.courseMatterId,
      to: r.courseMatter.id,
      optional: false,
    }),
  },

  course: {
    credits: r.many.courseMatter(),
    sessions: r.many.courseEvent(),
    reservations: r.many.reservation(),
  },

  courseEvent: {
    course: r.one.course({
      from: r.courseEvent.courseId,
      to: r.course.id,
      optional: false,
    }),
  },

  reservation: {
    course: r.one.course({
      from: r.reservation.courseId,
      to: r.course.id,
      optional: false,
    }),
    profile: r.one.profile({
      from: r.reservation.profileId,
      to: r.profile.id,
      optional: false,
    }),
  },
}));

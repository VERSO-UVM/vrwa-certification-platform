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

  courseCredit: {
    course: r.one.course({
      from: r.courseMatter.courseId,
      to: r.course.id,
      optional: false,
    }),
  },

  attendanceRecord: {
    profile: r.one.profile({
      from: r.attendanceRecord.profileId,
      to: r.profile.id,
      optional: false,
    }),
    course: r.one.course({
      from: r.attendanceRecord.courseId,
      to: r.course.id,
      optional: false,
    }),
  },

  course: {
    credits: r.many.courseMatter(),
    sessions: r.many.courseEvent(),
    attendance: r.many.attendanceRecord(),
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
    })
  },

  courseMatter: {
    course: r.one.course({
      from: r.courseMatter.courseId,
      to: r.course.id,
    })
  }
}));

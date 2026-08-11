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
      from: r.courseCredit.courseId,
      to: r.course.id,
      optional: false,
    }),
  },

  attendance: {
    profile: r.one.profile({
      from: r.attendance.profileId,
      to: r.profile.id,
      optional: false,
    }),
    course: r.one.course({
      from: r.attendance.courseId,
      to: r.course.id,
      optional: false,
    }),
  },

  course: {
    credits: r.many.courseCredit(),
    sessions: r.many.courseEvent(),
    attendance: r.many.attendance(),
  },

  courseEvent: {
    course: r.one.course({
      from: r.courseEvent.courseId,
      to: r.course.id,
      optional: false,
    }),
  },
}));

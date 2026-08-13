import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  profile: {
    user: r.one.user({
      from: r.profile.userId,
      to: r.user.id,
      optional: true,
    }),
    memberGroup: r.one.memberGroup({
      from: r.profile.memberGroupId,
      to: r.memberGroup.id,
      optional: true,
    }),
  },

  user: {
    profiles: r.many.profile(),
  },

  course: {
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

  memberGroup: {
    profiles: r.many.profile(),
  },
}));

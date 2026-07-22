import { eq } from "drizzle-orm";
import { type Database } from "~/database";
import type { ReservationDto } from "~/database/dtos";
import { course, courseEvent, profile, reservation } from "~/database/schema";

export default class ReservationRepository {
  constructor(private db: Database) {}

  reservationQuery() {
    return this.db.client
      .select({
        profileId: reservation.profileId,
        courseEventId: reservation.courseEventId,
        creditHours: reservation.creditHours,
        paymentStatus: reservation.paymentStatus,
        firstName: profile.firstName,
        lastName: profile.lastName,
        isMember: profile.isMember,
        classStartDatetime: courseEvent.classStartDatetime,
        seats: courseEvent.seats,
        course: {
          id: course.id,
          courseName: course.courseName,
          creditHours: course.creditHours,
        },
      })
      .from(reservation)
      .innerJoin(profile, eq(reservation.profileId, profile.id))
      .innerJoin(courseEvent, eq(reservation.courseEventId, courseEvent.id))
      .innerJoin(course, eq(course.id, courseEvent.courseId)) satisfies Promise<ReservationDto[]>;
  }
}

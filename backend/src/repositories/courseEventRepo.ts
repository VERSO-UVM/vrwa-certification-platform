import { getTableColumns, asc, eq } from "drizzle-orm";
import { type Database } from "~/database";
import type { CourseEventDto } from "~/database/dtos";
import { course, courseEvent } from "~/database/schema";

export default class CourseEventRepository {
  constructor(private db: Database) {}

  courseEventQuery() {
    return this.db.client
      .select({
        ...getTableColumns(courseEvent),
        courseName: course.courseName,
        description: course.description,
        creditHours: course.creditHours,
        priceCents: course.priceCents,
      })
      .from(courseEvent)
      .orderBy(asc(courseEvent.classStartDatetime))
      .innerJoin(course, eq(courseEvent.courseId, course.id)) satisfies Promise<
      CourseEventDto[]
    >;
  }
}

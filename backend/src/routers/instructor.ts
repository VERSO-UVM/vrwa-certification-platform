import { asc, eq } from "drizzle-orm";
import { instructorProcedure, router } from "~/utils/trpc";
import { type CourseEventDto } from "~/database/dtos";
import { courseEventView } from "~/database/views";
import { courseEvent } from "~/database/schema";


export const instructorRouter = router({
  getMyUpcomingCourses: instructorProcedure.query(({ ctx: { db, account } }) => {
    return db.client.select().from(courseEventView)
      .where(eq(courseEvent.instructorId, account.id))
      .orderBy(asc(courseEvent.classStartDatetime)) satisfies Promise<
      CourseEventDto[]
    >;
  }),
});

import { asc, eq, and } from "drizzle-orm";
import db from "~/database";
import { courseEvent, course, reservation, profile } from "~/database/schema";
import type { Course } from "~/database/schema";
import { adminProcedure, basicProcedure, router } from "~/utils/trpc";
import { z } from "zod";
import type { CourseEventDto } from "~/database/dtos";
import { courseEventQuery } from "~/database/queries";

export const courseEventRouter = router({
  admin: router({
    list: adminProcedure.query((): Promise<CourseEventDto[]> => {
      return courseEventQuery().orderBy(asc(courseEvent.classStartDatetime));
    }),
  }),
});

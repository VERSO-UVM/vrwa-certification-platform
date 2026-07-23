import { asc, eq, and } from "drizzle-orm";
import db from "~/database";
import { courseEvent, course, reservation, profile } from "~/database/schema";
import type { Course } from "~/database/schema";
import { adminProcedure, basicProcedure, router } from "~/utils/trpc";
import { z } from "zod";

export const courseRouter = router({
  admin: router({
    list: adminProcedure.query((): Promise<Course[]> => {
      return db.client.select().from(course).orderBy(asc(course.courseName));
    }),

    get: adminProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }): Promise<Course | null> => {
        const found = await db.client
          .select()
          .from(course)
          .where(eq(course.id, input.id))
          .limit(1);
        return found[0] ?? null;
      }),
  }),
});

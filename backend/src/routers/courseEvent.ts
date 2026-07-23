import { asc, eq, and } from "drizzle-orm";
import db from "~/database";
import { courseEvent, course, reservation, profile } from "~/database/schema";
import type { Course } from "~/database/schema";
import {
  adminProcedure,
  basicProcedure,
  instructorProcedure,
  router,
} from "~/utils/trpc";
import { z } from "zod";
import type { CourseEventDto } from "~/database/dtos";
import { courseEventQuery } from "~/database/queries";

export const courseEventRouter = router({
  admin: router({
    list: adminProcedure.query((): Promise<CourseEventDto[]> => {
      return courseEventQuery().orderBy(asc(courseEvent.classStartDatetime));
    }),

    listByCourse: adminProcedure
      .input(z.object({ courseId: z.string() }))
      .query(async ({ input }) => {
        const courseEvents = await db.client
          .select()
          .from(courseEvent)
          .where(eq(courseEvent.courseId, input.courseId));
        return courseEvents ?? [];
      }),

    create: adminProcedure
      .input(
        z.object({
          courseId: z.string(),
          locationType: z.enum(["in-person", "virtual", "hybrid"]),
          classStartDatetime: z.coerce.date(),
          seats: z.number().int().positive(),
          virtualLink: z.url().optional().nullable(),
          physicalAddress: z.string().nullable().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const [newEvent] = await db.client
          .insert(courseEvent)
          .values({
            ...input,
            virtualLink: input.virtualLink ?? null,
            physicalAddress: input.physicalAddress ?? null,
          })
          .returning();

        return newEvent;
      }),
  }),

  instructor: router({
    listUpcoming: instructorProcedure.query(({ ctx: { account } }) => {
      return courseEventQuery()
        .where(eq(courseEvent.instructorId, account.id))
        .orderBy(asc(courseEvent.classStartDatetime)) satisfies Promise<
        CourseEventDto[]
      >;
    }),
  }),
});

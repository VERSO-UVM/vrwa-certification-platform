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

    listCourse: adminProcedure
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

    update: adminProcedure
      .input(
        z.object({
          id: z.string(),
          classStartDatetime: z.coerce.date().optional().nullable(),
          seats: z.number().int().positive().nullable().optional(),
          locationType: z.enum(["in-person", "virtual", "hybrid"]).optional(),
          physicalAddress: z.string().nullable().optional(),
          virtualLink: z.url().optional().nullable(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...update } = input;

        const cleanUpdate = Object.fromEntries(
          Object.entries(update).filter(([_, value]) => value !== undefined),
        );

        if (Object.keys(cleanUpdate).length === 0) {
          throw new Error("No fields provided to update");
        }

        const [updatedEvent] = await db.client
          .update(courseEvent)
          .set(cleanUpdate)
          .where(eq(courseEvent.id, id))
          .returning();

        return updatedEvent;
      }),

    delete: adminProcedure
      .input(
        z.object({
          id: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const deletedRows = await db.client
          .delete(courseEvent)
          .where(eq(courseEvent.id, input.id))
          .returning();

        if (deletedRows.length === 0) {
          throw new Error("No matching Course Event found!");
        }
        return { success: true };
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

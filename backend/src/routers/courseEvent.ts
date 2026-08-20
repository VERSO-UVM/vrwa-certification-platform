import { asc, eq } from "drizzle-orm";
import db from "~/database";
import { course, courseEvent, CourseLocation } from "~/database/schema";
import {
  adminProcedure,
  instructorProcedure,
  router,
  traineeProcedure,
} from "~/utils/trpc";
import { z } from "zod";
import type { CourseEventDto } from "~/database/dtos";
import { courseEventQuery } from "~/database/queries";
import { TRPCError } from "@trpc/server";
import { isFutureClass } from "~/database/filters";
import { createUpdateSchema } from "drizzle-orm/zod";

export const courseEventUpdateSchema = createUpdateSchema(courseEvent, {
  id: z.string(),
});

export type CourseEventUpdateDto = z.infer<typeof courseEventUpdateSchema>;

export const courseEventRouter = router({
  admin: router({
    list: adminProcedure.query((): Promise<CourseEventDto[]> => {
      return courseEventQuery().orderBy(asc(courseEvent.classStartDatetime));
    }),

    listCourse: adminProcedure
      .input(z.object({ courseId: z.string() }))
      .query(async ({ input }) => {
        const courseEvents = await courseEventQuery().where(
          eq(courseEvent.courseId, input.courseId),
        );
        return courseEvents ?? [];
      }),

    create: adminProcedure
      .input(
        z.object({
          courseId: z.string(),
          locationType: z.enum(CourseLocation),
          classStartDatetime: z.coerce.date(),
          seats: z.number().int().positive().optional().nullable(),
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
      .input(courseEventUpdateSchema)
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

    clone: adminProcedure
      .input(
        z.object({
          courseEventId: z.string(),
        }),
      )
      .mutation(async ({ input: { courseEventId } }) => {
        const original = await db.client.query.courseEvent.findFirst({
          where: { id: courseEventId },
        });
        if (!original) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "CourseEvent not found.",
          });
        }

        const [newCourseEvent] = await db.client
          .insert(courseEvent)
          .values({
            ...original,
            id: undefined,
          })
          .returning();
        if (!newCourseEvent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create course.",
          });
        }

        return newCourseEvent;
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
    get: instructorProcedure
      .input(
        z.object({
          courseEventId: z.string(),
        }),
      )
      .query(async ({ input }) => {
        const events = await courseEventQuery().where(
          eq(courseEvent.id, input.courseEventId),
        );
        const event = events?.[0];
        if (event == null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Course event not found.",
          });
        }
        return event;
      }),

    listUpcoming: instructorProcedure.query(({ ctx: { session } }) => {
      if (session.activeProfileId == null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No currently active profile.",
        });
      }
      return courseEventQuery()
        .where(eq(course.instructorId, session.activeProfileId))
        .orderBy(asc(courseEvent.classStartDatetime)) satisfies Promise<
        CourseEventDto[]
      >;
    }),
  }),

  trainee: router({
    get: traineeProcedure
      .input(
        z.object({
          courseEventId: z.string(),
        }),
      )
      .query(async ({ input }) => {
        const events = await courseEventQuery().where(
          eq(courseEvent.id, input.courseEventId),
        );
        const event = events?.[0];
        if (event == null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Course event not found.",
          });
        }
        return event;
      }),

    listFuture: traineeProcedure.query(() => {
      return courseEventQuery()
        .where(isFutureClass())
        .orderBy(asc(courseEvent.classStartDatetime));
    }),
  }),
});

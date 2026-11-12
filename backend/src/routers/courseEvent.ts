import { asc, eq } from "drizzle-orm";
import db from "~/database";
import { course, courseEvent, CourseLocation } from "~/database/schema";
import {
  adminProcedure,
  instructorProcedure,
  publicProcedure,
  router,
} from "~/utils/trpc";
import { z } from "zod";
import type { CourseEventDto } from "~/database/dtos";
import { courseEventQuery } from "~/database/queries";
import { TRPCError } from "@trpc/server";
import { isFutureClass } from "~/database/filters";
import { createUpdateSchema } from "drizzle-orm/zod";

export const courseEventUpdateSchema = createUpdateSchema(courseEvent, {
  id: z.string(),
  virtualLink: z.url().nullable().optional(),
}).omit({ courseId: true });

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
          virtualLink: z.url().optional().nullable(),
          physicalAddress: z.string().nullable().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const [inserted] = await db.client
          .insert(courseEvent)
          .values({
            ...input,
            virtualLink: input.virtualLink ?? null,
            physicalAddress: input.physicalAddress ?? null,
          })
          .$returningId();
        const id = inserted!.id;

        return db.client.query.courseEvent.findFirst({ where: { id } });
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

        await db.client
          .update(courseEvent)
          .set(cleanUpdate)
          .where(eq(courseEvent.id, id));

        return db.client.query.courseEvent.findFirst({ where: { id } });
      }),

    clone: adminProcedure
      .input(
        z.object({
          courseEventId: z.string(),
          classStartDatetime: z.date().optional(),
        }),
      )
      .mutation(async ({ input: { courseEventId, classStartDatetime } }) => {
        const original = await db.client.query.courseEvent.findFirst({
          where: { id: courseEventId },
        });
        if (!original) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "CourseEvent not found.",
          });
        }

        const [inserted] = await db.client
          .insert(courseEvent)
          .values({
            ...original,
            id: undefined,
            classStartDatetime:
              classStartDatetime ?? original.classStartDatetime,
          })
          .$returningId();
        const id = inserted!.id;
        const newCourseEvent = await db.client.query.courseEvent.findFirst({
          where: { id },
        });
        if (!newCourseEvent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create course event.",
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
        const [result] = await db.client
          .delete(courseEvent)
          .where(eq(courseEvent.id, input.id));

        if (result.affectedRows === 0) {
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
    /* Does NOT require authentication to view course details */
    get: publicProcedure
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

    /* Does NOT require authentication to view upcoming courses */
    listFuture: publicProcedure.query(() => {
      return courseEventQuery()
        .where(isFutureClass())
        .orderBy(asc(courseEvent.classStartDatetime));
    }),
  }),
});

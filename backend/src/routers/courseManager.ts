import { asc, getTableColumns,eq } from "drizzle-orm";
import db from "~/database";
import { account, courseEvent, profile, reservation } from "~/database/schema";
import { basicProcedure, router } from "~/utils/trpc";
import { z } from "zod";


const adminProcedure = basicProcedure;

export const courseManagerRouter = router({
    //createCourseEvent
    createCourseEvent: adminProcedure
        .input(
            z.object({
                courseId: z.string(),
                locationType: z.enum(["in-person", "virtual", "hybrid"]),
                classStartDatetime: z.coerce.date(),
                seats: z.number().int().positive(),
                virtualLink: z.string().url().optional().nullable(),
                physicalAddress: z.string().nullable().optional(),
            })
        ).mutation(async ({ input }) => {
            const [newEvent] = await db.client
                .insert(courseEvent)
                .values({
                    ...input,
                    virtualLink: input.virtualLink ?? null,
                    physicalAddress: input.physicalAddress ?? null,
                }).returning()

            return newEvent;
        }),

    //updateCourseEvent
    updateCourseEvent: adminProcedure
        .input(
            z.object({
                id: z.string(),
                classStartDatetime: z.coerce.date().optional().nullable(),
                seats: z.number().int().positive().nullable().optional(),
                locationType: z.enum(["in-person", "virtual", "hybrid"]).optional(),
                physicalAddress: z.string().nullable().optional(),
                virtualLink: z.string().url().optional().nullable(),
            })
        ).mutation(async ({input}) => {
            const { id, ...update } = input;

            const cleanUpdate = Object.fromEntries(
                Object.entries(update).filter(
                    ([_, value]) => value !== undefined
                 )
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

    //deleteCourseEvent
    deleteCourseEvent : adminProcedure
        .input(
            z.object({
                id: z.string(),
            })
        ).mutation( async ({input}) => {
            const deletedRows = await db.client
                .delete(courseEvent)
                .where(eq(courseEvent.id, input.id))
                .returning();

            if (deletedRows.length === 0) {
                throw new Error("No matching Course Event found!")
            }
            return { success: true }
        })
    
    //addTrainee

    //removeTrainee
    
    //getCourseRoster

    //getCourseStats
});



import React from 'react';
import { basicProcedure, router } from '~/utils/trpc';
import { pdf } from '@react-pdf/renderer';
import z from 'zod';
import { CertificateDocument } from '~/pdf/pdf_template';
import { eq } from 'drizzle-orm';

export const certificateRouter = router({
  generateCertificate: basicProcedure // Replace with protectedProcedure once auth works
    .input(
      z.object({
        profileId: z.string(),
        courseEventId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const profile = await ctx.db.client.query.profile.findFirst({
        where: eq(ctx.db.schema.profile.id, input.profileId),
      });
      const courseEvent = await ctx.db.client.query.courseEvent.findFirst({
        where: eq(ctx.db.schema.courseEvent.id, input.courseEventId),
      });

      if (!profile) {
        // No profile found
        return null;
      }

      if (!courseEvent) {
        // No course event found
        return null;
      }

      const course = await ctx.db.client.query.course.findFirst({
        where: eq(ctx.db.schema.course.id, courseEvent.courseId),
      });

      if (!course) {
        // No course found
        return null;
      }

      const name = `${profile.firstName} ${profile.lastName}`;

      return {
        blob: await pdf(
          <CertificateDocument
            name={name}
            date={courseEvent?.classStartDatetime?.toDateString()}
            course={courseEvent?.courseId}
          />,
        ).toBlob(),
      };
    }),
});

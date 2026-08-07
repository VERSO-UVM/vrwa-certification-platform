import { adminProcedure, router, traineeProcedure } from "~/utils/trpc";
import { pdf } from "@react-pdf/renderer";
import z from "zod";
import { CertificateDocument } from "~/pdf/pdf_template";
import { eq } from "drizzle-orm";
import db from "~/database";

/**
 * For now we are returning a Blob directly embedded as a base64 string
 * within a tRPC JSON output. The "correct" way to return files is to
 * create a direct file URL. These are currently small enough PDFs
 * that this method works well enough.
 */
const generateCertificate = async (input: {
  profileId: string;
  courseEventId: string;
}) => {
  const profile = await db.client.query.profile.findFirst({
    where: eq(db.schema.profile.id, input.profileId),
  });
  const courseEvent = await db.client.query.courseEvent.findFirst({
    where: eq(db.schema.courseEvent.id, input.courseEventId),
  });

  if (!profile) {
    // No profile found
    return null;
  }

  if (!courseEvent) {
    // No course event found
    return null;
  }

  const course = await db.client.query.course.findFirst({
    where: eq(db.schema.course.id, courseEvent.courseId),
  });

  if (!course) {
    // No course found
    return null;
  }

  const name = `${profile.firstName} ${profile.lastName}`;

  // We can't pass a blob directly into JSON
  const blob = await pdf(
    <CertificateDocument
      name={name}
      date={courseEvent?.classStartDatetime?.toDateString()}
      course={courseEvent?.courseId}
    />,
  ).toBlob();

  const buffer = Buffer.from(await blob.arrayBuffer());
  const base64 = buffer.toString("base64");

  return {
    base64,
  };
};

export const certificateRouter = router({
  admin: {
    generate: adminProcedure
      .input(
        z.object({
          profileId: z.string(),
          courseEventId: z.string(),
        }),
      )
      .mutation(async ({ input }) => generateCertificate(input)),

    batchEmail: adminProcedure
      .input(
        z.array(
          z.object({
            profileId: z.string(),
            courseEventId: z.string(),
          }),
        ),
      )
      .mutation(async ({ input }) => {
        console.log("%%%% batchEmail triggered! %%%%");
        console.log(input);
      }),
  },

  trainee: {
    get: traineeProcedure
      .input(
        z.object({
          courseEventId: z.string(),
        }),
      )
      .query(async ({ input, ctx }) =>
        generateCertificate({
          profileId: ctx.session.activeProfileId,
          courseEventId: input.courseEventId,
        }),
      ),
  },
});

import { adminProcedure, router, traineeProcedure } from "~/utils/trpc";
import { pdf } from "@react-pdf/renderer";
import z from "zod";
import { CertificateDocument } from "~/pdf/certificate-document";
import db from "~/database";
import { TRPCError } from "@trpc/server";
import { courseFindFirst } from "~/database/queries";
import nodemailer from "nodemailer";
import { CourseLocation } from "~/database/schema";
import { format } from "date-fns";

/**
 * For now we are returning a Blob directly embedded as a base64 string
 * within a tRPC JSON output. The "correct" way to return files is to
 * create a direct file URL. These are currently small enough PDFs
 * that this method works well enough.
 */
const generateCertificate = async (input: {
  profileId: string;
  courseId: string;
}) => {
  const profile = await db.client.query.profile.findFirst({
    where: { id: input.profileId },
  });
  const course = await courseFindFirst(input.courseId);

  if (!profile) {
    // No profile found
    return null;
  }

  if (!course) {
    // No course event found
    return null;
  }

  const reservationRow = await db.client.query.reservation.findFirst({
    where: {
      profileId: input.profileId,
      courseId: input.courseId,
    },
  });

  const name = `${profile.firstName} ${profile.lastName}`;
  const creditHours = reservationRow?.creditHours ?? course.creditHours;
  const session = course.sessions?.[0];
  const sessionDate = session?.classStartDatetime;
  const date = sessionDate ? format(sessionDate, "MMMM d, yyyy") : undefined;

  let location: string | undefined;
  if (session?.town) {
    location = `${session.town}, VT`;
  } else if (session?.locationType === CourseLocation.Virtual) {
    location = "Virtual";
  }

  // We can't pass a blob directly into JSON
  const blob = await pdf(
    <CertificateDocument
      name={name}
      course={course.courseName}
      creditHours={creditHours}
      creditHourCategories={course.creditHourCategories}
      location={location}
      date={date}
      /* TODO: hardcoded */
      signerName="Allison Smith"
      signerTitle="Training Administrator"
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
          courseId: z.string(),
        }),
      )
      .mutation(async ({ input }) => generateCertificate(input)),

    batchEmail: adminProcedure
      .input(
        z.object({
          // emailSubject,
            emailBody: z.string(),
            emailCc: z.string(),
            emailBcc: z.string(),
            reservations: z.array(
            z.object({
              profileId: z.string(),
              courseId: z.string(),
            }),
        ),
        })
        
      )
      .mutation(async ({ input }) => {
        // console.log("%%%% batchEmail triggered! %%%%");
        // console.log(input);

      // const nodemailer = require("nodemailer");

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM, // sender address
        // from: , // sender address
        to: process.env.SMTP_USER, // TODO: figure out how to get list of emails
        subject: "VRWA Certificate", 
        text: "Hello world?", 
        html: `<h1>Hello</h1>`,
      });

      console.log("Message sent: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
      console.error("Error while sending mail:", err);
    }
      }),
  },

  trainee: {
    get: traineeProcedure
      .input(
        z.object({
          courseId: z.string(),
        }),
      )
      .query(async ({ input, ctx }) => {
        if (ctx.session.activeProfileId == null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Course event not found.",
          });
        }
        return generateCertificate({
          profileId: ctx.session.activeProfileId,
          courseId: input.courseId,
        });
      }),
  },
});

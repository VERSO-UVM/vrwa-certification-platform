import React from "react";
import { adminProcedure, protectedProcedure, router } from "~/utils/trpc";
import { pdf } from "@react-pdf/renderer";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { CertificateDocument } from "~/pdf/pdf_template";
import { and, eq, isNotNull } from "drizzle-orm";
import { profile, reservation, user } from "~/database/schema";
import { sendEmail } from "~/services/email";
import type { Context } from "~/utils/trpc/ctx";

const certificateInput = z.object({
  profileId: z.string(),
  courseEventId: z.string(),
});

async function generateCertificateBase64(
  ctx: Context,
  input: z.infer<typeof certificateInput>,
) {
  const profileRecord = await ctx.db.client.query.profile.findFirst({
    where: eq(profile.id, input.profileId),
  });
  const courseEvent = await ctx.db.client.query.courseEvent.findFirst({
    where: eq(ctx.db.schema.courseEvent.id, input.courseEventId),
  });

  if (!profileRecord || !courseEvent) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Certificate source data not found.",
    });
  }

  const course = await ctx.db.client.query.course.findFirst({
    where: eq(ctx.db.schema.course.id, courseEvent.courseId),
  });
  if (!course) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Course not found.",
    });
  }

  const blob = await pdf(
    <CertificateDocument
      name={`${profileRecord.firstName} ${profileRecord.lastName}`}
      date={courseEvent.classStartDatetime?.toDateString()}
      course={course.courseName}
    />,
  ).toBlob();

  return {
    pdfBase64: Buffer.from(await blob.arrayBuffer()).toString("base64"),
    filename:
      `${profileRecord.firstName}_${profileRecord.lastName}_${course.courseName}.pdf`
        .replace(/\s+/g, "_")
        .toLowerCase(),
    profileRecord,
    course,
  };
}

export const certificateRouter = router({
  generateCertificate: protectedProcedure
    .input(certificateInput)
    .mutation(async ({ input, ctx }) => {
      const profileRecord = await ctx.db.client.query.profile.findFirst({
        where: eq(profile.id, input.profileId),
      });
      const isAdmin = (ctx.account.role || "").split(",").includes("admin");
      if (!profileRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found.",
        });
      }
      if (profileRecord.accountId !== ctx.account.id && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const certificate = await generateCertificateBase64(ctx, input);
      return { pdf: certificate.pdfBase64, filename: certificate.filename };
    }),

  getCertificate: protectedProcedure
    .input(certificateInput)
    .query(async ({ input, ctx }) => {
      const [reservationRecord] = await ctx.db.client
        .select()
        .from(reservation)
        .innerJoin(profile, eq(reservation.profileId, profile.id))
        .where(
          and(
            eq(reservation.profileId, input.profileId),
            eq(reservation.courseEventId, input.courseEventId),
            isNotNull(reservation.attendanceMarkedAt),
          ),
        );

      if (!reservationRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certificate unavailable for this profile and course event.",
        });
      }

      const isOwner = reservationRecord.profile.accountId === ctx.account.id;
      const isAdmin = (ctx.account.role || "").split(",").includes("admin");
      if (!isOwner && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const certificate = await generateCertificateBase64(ctx, input);
      return {
        pdf: certificate.pdfBase64,
        filename: certificate.filename,
      };
    }),

  bulkSendCertificates: adminProcedure
    .input(
      z.object({
        recipients: z.array(certificateInput).min(1),
        emailSubject: z.string().min(1),
        emailBody: z.string().min(1),
        cc: z.string().optional(),
        bcc: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const results = await Promise.all(
        input.recipients.map(async (recipient) => {
          try {
            const certificate = await generateCertificateBase64(ctx, recipient);
            const [recipientUser] = await ctx.db.client
              .select({ email: user.email })
              .from(user)
              .where(eq(user.id, certificate.profileRecord.accountId));
            if (!recipientUser?.email) {
              throw new Error("Recipient email missing.");
            }

            await sendEmail({
              to: recipientUser.email,
              subject: input.emailSubject,
              html: input.emailBody,
              cc: input.cc,
              bcc: input.bcc,
              attachments: [
                {
                  filename: certificate.filename,
                  content: Buffer.from(certificate.pdfBase64, "base64"),
                  contentType: "application/pdf",
                },
              ],
            });

            return { ok: true as const };
          } catch (error) {
            return {
              ok: false as const,
              profileId: recipient.profileId,
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown email send error",
            };
          }
        }),
      );

      const errors = results
        .filter((r) => !r.ok)
        .map((r) => ({
          profileId: r.profileId,
          error: r.error,
        }));
      const sent = results.length - errors.length;
      return { sent, errors };
    }),

  listEligibleRecipients: adminProcedure
    .input(
      z.object({
        courseEventId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.db.client
        .select({
          profileId: profile.id,
          courseEventId: reservation.courseEventId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: user.email,
        })
        .from(reservation)
        .innerJoin(profile, eq(profile.id, reservation.profileId))
        .innerJoin(user, eq(user.id, profile.accountId))
        .where(
          and(
            eq(reservation.courseEventId, input.courseEventId),
            isNotNull(reservation.attendanceMarkedAt),
          ),
        );
    }),
});

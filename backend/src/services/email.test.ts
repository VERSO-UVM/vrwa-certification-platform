import { beforeEach, expect, mock, test } from "bun:test";
import type nodemailer from "nodemailer";
import { sendEmail, setTransporterForTests } from "./email";

beforeEach(() => {
  process.env.SMTP_FROM = "noreply@test.dev";
  setTransporterForTests(null);
});

test("sendEmail forwards payload to transporter", async () => {
  const sendMail = mock(async () => ({ messageId: "mocked" }));
  setTransporterForTests({
    sendMail,
  } as unknown as nodemailer.Transporter);

  await sendEmail({
    to: "student@example.com",
    subject: "Test subject",
    html: "<p>Hello</p>",
  });

  expect(sendMail).toHaveBeenCalledTimes(1);
  expect(sendMail).toHaveBeenCalledWith(
    expect.objectContaining({
      from: "noreply@test.dev",
      to: "student@example.com",
      subject: "Test subject",
    }),
  );
});

test("sendEmail surfaces transporter errors", async () => {
  const sendMail = mock(async () => {
    throw new Error("SMTP down");
  });
  setTransporterForTests({
    sendMail,
  } as unknown as nodemailer.Transporter);

  await expect(
    sendEmail({
      to: "student@example.com",
      subject: "Test",
      html: "<p>x</p>",
    }),
  ).rejects.toThrow("SMTP down");
});

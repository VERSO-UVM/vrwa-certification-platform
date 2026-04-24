import nodemailer from "nodemailer";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  cc?: string;
  bcc?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
};

let transporter: nodemailer.Transporter | null = null;

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getTransporter() {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: getEnv("SMTP_HOST"),
    port: parseInt(getEnv("SMTP_PORT"), 10),
    secure: false,
    auth: {
      user: getEnv("SMTP_USER"),
      pass: getEnv("SMTP_PASS"),
    },
  });

  return transporter;
}

export function setTransporterForTests(next: nodemailer.Transporter | null) {
  transporter = next;
}

export async function sendEmail({
  to,
  subject,
  html,
  cc,
  bcc,
  attachments,
}: SendEmailArgs) {
  return getTransporter().sendMail({
    from: getEnv("SMTP_FROM"),
    to,
    subject,
    html,
    cc,
    bcc,
    attachments,
  });
}

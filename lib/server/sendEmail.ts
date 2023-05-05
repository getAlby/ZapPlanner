import { logger } from "lib/server/logger";
import * as nodemailer from "nodemailer";

let transport: ReturnType<typeof nodemailer.createTransport> | undefined;

if (
  process.env.EMAIL_SERVER_USER &&
  process.env.EMAIL_SERVER_PASSWORD &&
  process.env.EMAIL_SERVER_HOST &&
  process.env.EMAIL_SERVER_PORT &&
  process.env.EMAIL_FROM
) {
  transport = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
} else {
  logger.error("Email config not setup. Please see .env.example");
}

type EmailTemplate = (
  | {
      type: "subscription-updated";
    }
  | {
      type: "payment-success";
    }
  | {
      type: "payment-failed";
    }
  | {
      type: "subscription-deactivated";
    }
) & {
  subscriptionUrl: string;
};

export const sendEmail = (to: string, template: EmailTemplate) => {
  if (transport) {
    // TODO: templates
    const subject = template.type;
    const html = `Manage your periodic payment: <a href="${template.subscriptionUrl}">${template.subscriptionUrl}</a> `;
    transport.sendMail({
      to,
      subject,
      html,
      from: `ZapPlanner <${process.env.EMAIL_FROM}>`,
    });
  } else {
    logger.warn("Email config not setup. Skipped sending email");
  }
};

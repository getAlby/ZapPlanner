import { Subscription } from "@prisma/client";
import { getSubscriptionUrl } from "lib/server/getSubscriptionUrl";
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
  subscription: Subscription;
};

export const sendEmail = (to: string, template: EmailTemplate) => {
  const subscriptionUrl = getSubscriptionUrl(template.subscription.id);
  if (transport) {
    // TODO: templates
    const subject = getEmailSubject(template);
    const html =
      getEmailHtml(template) +
      `<br/><br/>Manage your periodic payment: <a href="${subscriptionUrl}">${subscriptionUrl}</a>`;
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
function getEmailHtml(template: EmailTemplate) {
  switch (template.type) {
    case "subscription-updated":
      return (
        `Your notification settings have been updated for your periodic payment to ${template.subscription.recipientLightningAddress}.` +
        `<br/><br/>Payments of ${template.subscription.amount} sats will be made every ${template.subscription.sleepDuration}.` +
        `<br/><br/>${
          template.subscription.sendPaymentNotifications
            ? "You'll receive a confirmation email for each payment."
            : "You won't receive email confirmation for future payments."
        }`
      );
    case "payment-success":
      return `Your lightning payment to ${template.subscription.recipientLightningAddress} was successful.<br/><br/>Your next payment is scheduled for ${template.subscription.sleepDuration} from now.`;
    case "payment-failed":
      return `Your last periodic payment failed. Retry count: `;
    case "subscription-deactivated":
      return `Periodic Payment deactivated`;
  }
}
function getEmailSubject(template: EmailTemplate) {
  switch (template.type) {
    case "subscription-updated":
      return `Your Periodic Payment to ${template.subscription.recipientLightningAddress}`;
    case "payment-success":
      return `Successful Payment of ${template.subscription.amount} sats to ${template.subscription.recipientLightningAddress}`;
    case "payment-failed":
      return `Failed Payment to ${template.subscription.recipientLightningAddress}`;
    case "subscription-deactivated":
      return `Periodic Payment deactivated`;
  }
}

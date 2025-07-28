import { Subscription } from "@prisma/client";
import { DEFAULT_CURRENCY, MAX_RETRIES } from "lib/constants";
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
      type: "subscription-reactivated";
    }
  | {
      type: "subscription-updated";
    }
  | {
      type: "payment-success";
    }
  | {
      type: "payment-failed";
      errorMessage: string;
    }
  | {
      type: "subscription-deactivated";
    }
  | {
      type: "payment-recovered";
      numRetries: number;
    }
) & {
  subscription: Subscription;
};

export const sendEmail = async (to: string, template: EmailTemplate) => {
  const subscriptionUrl = getSubscriptionUrl(template.subscription.id);
  if (transport) {
    // TODO: templates
    const subject = getEmailSubject(template);
    const html =
      getEmailHtml(template) +
      `<br/><br/>Manage your recurring payment: <a href="${subscriptionUrl}">${subscriptionUrl}</a>`;
    try {
      await transport.sendMail({
        to,
        subject,
        html,
        from: `ZapPlanner <${process.env.EMAIL_FROM}>`,
      });
    } catch (error) {
      logger.error("Failed to send email", {
        to,
        template: {
          templateType: template.type,
          subscriptionId: template.subscription.id,
        },
        error,
      });
    }
  } else {
    logger.warn("Email config not setup. Skipped sending email");
  }
};
function getEmailHtml(template: EmailTemplate) {
  switch (template.type) {
    case "subscription-updated":
      return (
        `Your notification settings have been updated for your recurring payment to ${template.subscription.recipientLightningAddress}.` +
        `<br/><br/>Payments of ${template.subscription.amount} ${
          template.subscription.currency || DEFAULT_CURRENCY
        } will be made every ${template.subscription.sleepDuration}.` +
        `<br/><br/>${
          template.subscription.sendPaymentNotifications
            ? "You'll receive a confirmation email for each payment."
            : "You won't receive email confirmation for future payments."
        }`
      );
    case "payment-success":
      return `Your lightning payment to ${template.subscription.recipientLightningAddress} was successful.<br/><br/>Your next payment is scheduled for ${template.subscription.sleepDuration} from now.`;
    case "payment-recovered":
      return `Your lightning payment to ${template.subscription.recipientLightningAddress} recovered after ${template.numRetries} failures.`;
    case "payment-failed":
      return `Your last recurring payment failed. Attempt: ${template.subscription.retryCount} / ${MAX_RETRIES}<br/><br/>After ${MAX_RETRIES} failed payments your subscription will be disabled. Please check your wallet balance, NWC connection and ensure your recipient's lightning address is still accessible.<br/><br/><b>Error: ${template.errorMessage}</b>`;
    case "subscription-deactivated":
      return `Your Recurring Payment has been deactivated as it has failed ${MAX_RETRIES} times in a row. Please check your wallet balance, NWC connection and ensure your recipient's lightning address is still accessible.`;
    case "subscription-reactivated":
      return `Your Recurring Payment has been reactivated. Your next payment will be made instantly.`;
  }
}
function getEmailSubject(template: EmailTemplate) {
  switch (template.type) {
    case "subscription-updated":
      return `Details of your Recurring Payment to ${template.subscription.recipientLightningAddress}`;
    case "payment-success":
      return `Successful Payment of ${template.subscription.amount} ${
        template.subscription.currency || DEFAULT_CURRENCY
      } to ${template.subscription.recipientLightningAddress}`;
    case "payment-recovered":
      return `Payment to ${template.subscription.recipientLightningAddress} recovered`;
    case "payment-failed":
      return `Failed Payment to ${template.subscription.recipientLightningAddress} (Attempt ${template.subscription.retryCount} / ${MAX_RETRIES})`;
    case "subscription-deactivated":
      return `Recurring Payment to ${template.subscription.recipientLightningAddress} deactivated`;
    case "subscription-reactivated":
      return `Recurring Payment to ${template.subscription.recipientLightningAddress} reactivated`;
  }
}

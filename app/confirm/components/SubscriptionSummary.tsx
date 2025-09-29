import React from "react";
import { formatDistance, add, max } from "date-fns";
import ms from "ms";
import { MAX_RETRIES } from "lib/constants";

type SubscriptionSummaryProps = {
  values: {
    amount: string;
    currency: string;
    recipientLightningAddress: string;
    sleepDuration?: string;
    cronExpression?: string;
    nextCronExecution?: number;
    message: string | undefined;
    createdDateTime?: Date;
    lastSuccessfulPaymentDateTime?: Date;
    lastFailedPaymentDateTime?: Date;
    numSuccessfulPayments?: number;
    numFailedPayments?: number;
    retryCount?: number;
    payerData?: string;
    endDateTime?: Date;
  };
  showFirstPayment?: boolean;
};

export function SubscriptionSummary({
  values,
  showFirstPayment,
}: SubscriptionSummaryProps) {
  const isActive = !values.retryCount || values.retryCount < MAX_RETRIES;

  return (
    <div className="flex flex-col w-full gap-4">
      <SubscriptionSummaryItem
        left="Amount"
        right={
          <div>
            <span className="mono">
              {parseInt(values.amount).toLocaleString()}
            </span>{" "}
            {values.currency}
          </div>
        }
      />
      <SubscriptionSummaryItem
        left="Recipient"
        right={values.recipientLightningAddress}
      />
      <SubscriptionSummaryItem
        left="Frequency"
        right={
          values.cronExpression
            ? `Cron: ${values.cronExpression}`
            : "every " + values.sleepDuration
        }
      />
      {showFirstPayment && (
        <SubscriptionSummaryItem
          left="First payment"
          right={
            values.nextCronExecution
              ? formatDistance(values.nextCronExecution, new Date(), {
                  addSuffix: true,
                })
              : "Immediately"
          }
        />
      )}
      {values.createdDateTime && (
        <SubscriptionSummaryItem
          left="Created"
          right={formatDistance(values.createdDateTime, new Date(), {
            addSuffix: true,
          })}
        />
      )}
      {values.lastSuccessfulPaymentDateTime && (
        <SubscriptionSummaryItem
          left="Last payment"
          right={formatDistance(
            values.lastSuccessfulPaymentDateTime,
            new Date(),
            { addSuffix: true },
          )}
        />
      )}
      {values.createdDateTime && isActive && (
        <SubscriptionSummaryItem
          left="Next payment"
          right={
            values.nextCronExecution ||
            values.lastSuccessfulPaymentDateTime ||
            values.lastFailedPaymentDateTime
              ? formatDistance(
                  values.nextCronExecution
                    ? values.nextCronExecution
                    : add(
                        Math.max(
                          (
                            values.lastSuccessfulPaymentDateTime ||
                            values.lastFailedPaymentDateTime ||
                            values.createdDateTime ||
                            new Date()
                          ).getTime(),
                          (
                            values.lastFailedPaymentDateTime ||
                            values.lastSuccessfulPaymentDateTime ||
                            values.createdDateTime ||
                            new Date()
                          ).getTime(),
                        ),
                        {
                          seconds: ms(values.sleepDuration!) / 1000,
                        },
                      ),
                  new Date(),
                  { addSuffix: true },
                )
              : "Now"
          }
        />
      )}
      {values.endDateTime && (
        <SubscriptionSummaryItem
          left="Auto-stop date"
          right={new Date(values.endDateTime).toLocaleDateString()}
        />
      )}
      <SubscriptionSummaryItem
        left="Message"
        right={values.message || "(no message provided)"}
      />
      {values.payerData && (
        <SubscriptionSummaryItem left="Payer Data" right={values.payerData} />
      )}
      {values.lastFailedPaymentDateTime && (
        <SubscriptionSummaryItem
          left="Last failure"
          right={formatDistance(values.lastFailedPaymentDateTime, new Date(), {
            addSuffix: true,
          })}
        />
      )}
      {(values.numSuccessfulPayments || 0) > 0 && (
        <SubscriptionSummaryItem
          left="Successful payments"
          right={values.numSuccessfulPayments}
        />
      )}
      {(values.numSuccessfulPayments || 0) > 0 && (
        <SubscriptionSummaryItem
          left={`Total ${values.currency} sent`}
          right={`${
            (values.numSuccessfulPayments || 0) * parseInt(values.amount)
          }`}
        />
      )}
      {(values.numFailedPayments || 0) > 0 && (
        <SubscriptionSummaryItem
          left="Failed payments"
          right={values.numFailedPayments}
        />
      )}
      {(values.retryCount || 0) > 0 && (
        <SubscriptionSummaryItem left="Retry count" right={values.retryCount} />
      )}
      {values.retryCount !== undefined && (
        <SubscriptionSummaryItem
          left="Status"
          right={isActive ? "Active" : "Halted"}
        />
      )}
    </div>
  );
}

type SubscriptionSummaryItemProps = {
  left: React.ReactNode;
  right: React.ReactNode;
};

function SubscriptionSummaryItem({
  left,
  right,
}: SubscriptionSummaryItemProps) {
  return (
    <div className="flex w-full justify-between">
      <div className="font-body text-primary-content">{left}</div>
      <div className="font-body text-primary font-bold text-end">{right}</div>
    </div>
  );
}

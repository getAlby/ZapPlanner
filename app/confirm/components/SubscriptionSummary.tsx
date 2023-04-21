import React from "react";
import { formatDistance, add, max } from "date-fns";
import ms from "ms";
import { MAX_RETRIES } from "lib/constants";

type SubscriptionSummaryProps = {
  values: {
    amount: string;
    recipientLightningAddress: string;
    sleepDuration: string;
    message: string | undefined;
    createdDateTime?: Date;
    lastSuccessfulPaymentDateTime?: Date;
    lastFailedPaymentDateTime?: Date;
    numSuccessfulPayments?: number;
    numFailedPayments?: number;
    retryCount?: number;
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
            sats
          </div>
        }
      />
      <SubscriptionSummaryItem
        left="Recipient"
        right={values.recipientLightningAddress}
      />
      <SubscriptionSummaryItem
        left="Frequency"
        right={"every " + values.sleepDuration}
      />
      <SubscriptionSummaryItem
        left="Message"
        right={values.message || "(no message provided)"}
      />
      {showFirstPayment && (
        <SubscriptionSummaryItem left="First payment" right="Immediately" />
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
            { addSuffix: true }
          )}
        />
      )}
      {(values.lastSuccessfulPaymentDateTime || values.createdDateTime) &&
        isActive && (
          <SubscriptionSummaryItem
            left="Next payment"
            right={formatDistance(
              add(
                values.lastSuccessfulPaymentDateTime ||
                  values.createdDateTime ||
                  Date.now(),
                {
                  seconds:
                    (ms(values.sleepDuration) *
                      (1 + (values.retryCount || 0))) /
                    1000,
                }
              ),
              new Date(),
              { addSuffix: true }
            )}
          />
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
          left="Total sats sent"
          right={`${
            (values.numSuccessfulPayments || 0) * parseInt(values.amount)
          }⚡`}
        />
      )}
      {(values.numFailedPayments || 0) > 0 && (
        <SubscriptionSummaryItem
          left="Failed payments"
          right={values.numFailedPayments}
        />
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
      <div className="font-body text-gray-700">{left}</div>
      <div className="font-body text-black font-bold text-end">{right}</div>
    </div>
  );
}

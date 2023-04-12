"use client";

import React from "react";

type SubscriptionSummaryProps = {
  values: {
    amount: string;
    recipientLightningAddress: string;
    sleepDuration: string;
    message: string | undefined;
  };
  showFirstPayment?: boolean;
};

export function SubscriptionSummary({
  values,
  showFirstPayment,
}: SubscriptionSummaryProps) {
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
      <SubscriptionSummaryItem left="Frequency" right={values.sleepDuration} />
      <SubscriptionSummaryItem
        left="Message"
        right={values.message || "(no message provided)"}
      />
      {showFirstPayment && (
        <SubscriptionSummaryItem left="First payment" right="Immediately" />
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
      <div className="font-body text-black font-bold">{right}</div>
    </div>
  );
}

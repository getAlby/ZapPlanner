import { CreateSubscriptionForm } from "app/components/CreateSubscriptionForm";
import React from "react";

export default function HomePage() {
  return (
    <>
      <h2 className="font-heading font-bold text-2xl">
        What are periodic payments?
      </h2>
      <p className="font-body">
        Periodic payments are transfers from your wallet to a lightning address
        with defined intervals.{" "}
      </p>
      <p className="font-body">
        You can use them to provide continual support to your favourite
        value4value creators. Example: <span className="font-mono">100</span>{" "}
        sats every 1h or <span className="font-mono">1,000</span> sats everyday.
      </p>
      <div className="flex flex-col gap-4">
        <h2 className="font-heading font-bold text-2xl">
          New periodic payment
        </h2>
        <CreateSubscriptionForm />
      </div>
    </>
  );
}

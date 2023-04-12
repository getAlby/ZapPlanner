import { CreateSubscriptionForm } from "app/create/components/CreateSubscriptionForm";
import React from "react";

export default function HomePage() {
  return (
    <>
      <div className="flex flex-col gap-4">
        <h2 className="font-heading font-bold text-2xl">
          New periodic payment
        </h2>
        <CreateSubscriptionForm />
      </div>
    </>
  );
}

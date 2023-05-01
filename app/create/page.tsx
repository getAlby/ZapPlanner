import { Box } from "app/components/Box";
import { Header } from "app/components/Header";
import { CreateSubscriptionForm } from "app/create/components/CreateSubscriptionForm";
import React from "react";

export default function CreatePage() {
  return (
    <>
      <Header />
      <CreateSubscriptionForm />
    </>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import React from "react";
import { CreateSubscriptionFormData } from "types/CreateSubscriptionFormData";

const inputClassName = "input input-bordered w-full mb-4";
const labelClassName = "font-body font-medium";

export function CreateSubscriptionForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSubscriptionFormData>({});
  React.useEffect(() => {
    const sessionValues = sessionStorage.getItem("fields");
    reset(
      sessionValues
        ? JSON.parse(sessionValues)
        : {
            amount: "1",
            recipientLightningAddress:
              process.env.NEXT_PUBLIC_DEFAULT_LIGHTNING_ADDRESS ||
              "hello@getalby.com",
            message: process.env.NEXT_PUBLIC_DEFAULT_MESSAGE,
            sleepDuration:
              process.env.NEXT_PUBLIC_DEFAULT_SLEEP_DURATION || "30d",
          }
    );
  }, [reset]);
  const { push } = useRouter();
  const onSubmit = handleSubmit(async (data) => {
    sessionStorage.setItem("fields", JSON.stringify(data));
    push("/confirm");
  });

  return (
    <form
      id="create-subscription"
      onSubmit={onSubmit}
      className="flex flex-col gap-2 w-full"
    >
      <label className={labelClassName}>Recipient Lightning address</label>
      <input
        {...register("recipientLightningAddress")}
        className={inputClassName}
      />
      <label className={labelClassName}>Amount in sats</label>
      <input {...register("amount")} className={inputClassName} />
      <label className={labelClassName}>Message</label>
      <input {...register("message")} className={inputClassName} />
      <label className={labelClassName}>Repeat every</label>
      <input {...register("sleepDuration")} className={inputClassName} />
    </form>
  );
}

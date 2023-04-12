"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import React from "react";
import { CreateSubscriptionFormData } from "types/CreateSubscriptionFormData";
import { Timeframe, timeframes } from "types/Timeframe";

const inputClassNameWithoutPadding = "input input-bordered w-full";
const inputClassName = inputClassNameWithoutPadding + "mb-4";
const labelClassName = "font-body font-medium";

export function CreateSubscriptionForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
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
            timeframeValue:
              process.env.NEXT_PUBLIC_DEFAULT_SLEEP_TIMEFRAME_VALUE || "1",
            timeframe:
              process.env.NEXT_PUBLIC_DEFAULT_SLEEP_TIMEFRAME || "days",
          }
    );
  }, [reset]);
  const { push } = useRouter();
  const onSubmit = handleSubmit(async (data) => {
    sessionStorage.setItem("fields", JSON.stringify(data));
    push("/confirm");
  });
  const watchedTimeframe = watch("timeframe");
  const setSelectedTimeframe = React.useCallback(
    (timeframe: Timeframe) => setValue("timeframe", timeframe),
    [setValue]
  );

  return (
    <form
      id="create-subscription"
      onSubmit={onSubmit}
      className="flex flex-col gap-2 w-full"
    >
      <label className={labelClassName}>Recipient Lightning address</label>
      <input
        {...register("recipientLightningAddress")}
        placeholder="hello@getalby.com"
        className={inputClassName}
      />
      <label className={labelClassName}>Amount in sats</label>
      <input
        {...register("amount")}
        placeholder="21"
        className={inputClassName}
      />
      <label className={labelClassName}>Frequency</label>
      <div className="flex justify-center gap-2 items-center">
        <p className="lg:flex-shrink-0">Repeat payment every</p>
        <input
          {...register("timeframeValue")}
          className={`${inputClassNameWithoutPadding} w-full`}
        />
        <select
          className="select select-bordered"
          onChange={(event) =>
            setSelectedTimeframe(event.target.value as Timeframe)
          }
        >
          {timeframes.map((timeframe) => (
            <option
              key={timeframe}
              value={timeframe}
              selected={timeframe === watchedTimeframe}
            >
              {timeframe}
            </option>
          ))}
        </select>
      </div>
      <label className={labelClassName}>Message attached</label>
      <input
        {...register("message")}
        placeholder="Thank you for your work"
        className={inputClassName}
      />
    </form>
  );
}

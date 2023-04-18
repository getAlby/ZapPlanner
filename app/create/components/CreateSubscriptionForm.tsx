"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import React from "react";
import { CreateSubscriptionFormData } from "types/CreateSubscriptionFormData";
import { Timeframe, timeframes } from "types/Timeframe";
import { LightningAddress } from "alby-tools";
import { Loading } from "app/components/Loading";

const inputClassNameWithoutBottomMargin = "input input-bordered w-full";
const inputBottomMargin = "mb-4";
const inputClassName =
  inputClassNameWithoutBottomMargin + " " + inputBottomMargin;
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
              process.env.NEXT_PUBLIC_DEFAULT_LIGHTNING_ADDRESS,
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
  const [validatingLightningAddress, setValidatingLightningAddress] =
    React.useState(false);

  return (
    <form
      id="create-subscription"
      onSubmit={onSubmit}
      className="flex flex-col gap-2 w-full"
    >
      <label className={labelClassName}>Recipient Lightning address</label>
      <div className="relative flex flex-col justify-center">
        <input
          {...register("recipientLightningAddress", {
            validate: async (address) => {
              setValidatingLightningAddress(true);
              let errorMessage: string | undefined;
              try {
                if (!address.length) {
                  errorMessage = "please provide a lightning address";
                }
                const ln = new LightningAddress(address);
                if (!ln.username) {
                  errorMessage = "This is not a valid lightning address";
                }
                if (!errorMessage) {
                  await ln.fetch();
                }
                if (!ln.lnurlpData) {
                  errorMessage = "This lightning address does not exist";
                }
              } catch (e) {
                errorMessage = "This is not a valid lightning address";
              }
              setValidatingLightningAddress(false);
              return errorMessage;
            },
          })}
          placeholder="hello@getalby.com"
          className={inputClassName}
        />
        {validatingLightningAddress && (
          <div className="absolute right-3">
            <Loading />
          </div>
        )}
      </div>
      {errors.recipientLightningAddress && (
        <p className="text-error">{errors.recipientLightningAddress.message}</p>
      )}
      <label className={labelClassName}>Amount in sats</label>
      <input
        {...register("amount", {
          validate: (value) =>
            parseInt(value) <= 0 || isNaN(parseInt(value))
              ? "Please enter a positive value"
              : undefined,
        })}
        placeholder="21"
        className={inputClassName}
      />
      {errors.amount && <p className="text-error">{errors.amount.message}</p>}
      <label className={labelClassName}>Frequency</label>
      <div
        className={`flex justify-center gap-2 items-center ${inputBottomMargin}`}
      >
        <p className="lg:flex-shrink-0">Repeat payment every</p>
        <input
          {...register("timeframeValue", {
            validate: (value) =>
              parseInt(value) <= 0 || isNaN(parseInt(value))
                ? "Please enter a positive value"
                : undefined,
          })}
          className={`${inputClassNameWithoutBottomMargin} w-full`}
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
      {errors.timeframeValue && (
        <p className="text-error">{errors.timeframeValue.message}</p>
      )}
      <label className={labelClassName}>Message attached</label>
      <input
        {...register("message")}
        placeholder="Thank you for your work"
        className={inputClassName}
      />
    </form>
  );
}

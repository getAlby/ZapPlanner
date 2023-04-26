"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import React from "react";
import { Timeframe, timeframes } from "types/Timeframe";
import { LightningAddress } from "alby-tools";
import { LnUrlPayResponse } from "alby-tools/dist/types";
import { Loading } from "app/components/Loading";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
import { UnconfirmedSubscription } from "types/UnconfirmedSubscription";
import { isValidPositiveValue } from "lib/validation";

const inputClassNameWithoutBottomMargin = "input input-bordered w-full";
const inputBottomMargin = "mb-4";
const inputClassName =
  inputClassNameWithoutBottomMargin + " " + inputBottomMargin;
const labelClassName = "font-body font-medium";

// TODO: remove when alby-tools exposes LUD18PayerData
type LUD18PayerData = LnUrlPayResponse["payerData"];

type CreateSubscriptionFormData = Omit<
  CreateSubscriptionRequest,
  "nostrWalletConnectUrl" | "payerData" | "sleepDuration"
> & { payerName: string; timeframe: Timeframe; timeframeValue: string };

export function CreateSubscriptionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateSubscriptionFormData>({
    reValidateMode: "onBlur",
    mode: "onBlur",
    defaultValues: {
      amount: process.env.NEXT_PUBLIC_DEFAULT_AMOUNT,
      recipientLightningAddress:
        process.env.NEXT_PUBLIC_DEFAULT_LIGHTNING_ADDRESS,
      message: process.env.NEXT_PUBLIC_DEFAULT_MESSAGE,
      timeframeValue:
        process.env.NEXT_PUBLIC_DEFAULT_SLEEP_TIMEFRAME_VALUE || "1",
      timeframe:
        (process.env.NEXT_PUBLIC_DEFAULT_SLEEP_TIMEFRAME as Timeframe) ||
        "days",
    },
  });

  const { push } = useRouter();
  const onSubmit = handleSubmit(async (data) => {
    const payerData = data.payerName
      ? JSON.stringify({
          payerName: data.payerName,
        } as LUD18PayerData)
      : undefined;

    const searchParams = new URLSearchParams();
    searchParams.append("amount", data.amount);
    searchParams.append("recipient", data.recipientLightningAddress);
    searchParams.append(
      "timeframe",
      data.timeframeValue + " " + data.timeframe
    );
    if (data.message) {
      searchParams.append("comment", encodeURIComponent(data.message));
    }
    if (payerData) {
      searchParams.append("payerdata", encodeURIComponent(payerData));
    }
    push(`/confirm?${searchParams.toString()}`);
  });
  const watchedTimeframe = watch("timeframe");
  const setSelectedTimeframe = React.useCallback(
    (timeframe: Timeframe) => setValue("timeframe", timeframe),
    [setValue]
  );
  const [validatingLightningAddress, setValidatingLightningAddress] =
    React.useState(false);
  const [lightningAddress, setLightningAddress] = React.useState<
    LightningAddress | undefined
  >(undefined);

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
                  if (!ln.lnurlpData) {
                    errorMessage = "This lightning address does not exist";
                  }
                }
                if (!errorMessage) {
                  setLightningAddress(ln);
                } else {
                  setLightningAddress(undefined);
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
            !isValidPositiveValue(parseInt(value))
              ? "Please enter a positive value"
              : undefined,
        })}
        placeholder="2100"
        className={inputClassName}
      />
      {errors.amount && <p className="text-error">{errors.amount.message}</p>}
      <div
        className={`flex justify-center gap-2 items-center ${inputBottomMargin}`}
      >
        <p className="lg:flex-shrink-0">Repeat payment every</p>
        <input
          {...register("timeframeValue", {
            validate: (value) =>
              !isValidPositiveValue(parseInt(value))
                ? "Please enter a positive value"
                : undefined,
          })}
          placeholder="30"
          className={`${inputClassNameWithoutBottomMargin} w-full`}
        />
        <select
          {...register("timeframe")}
          className="select select-bordered"
          defaultValue={watchedTimeframe}
          onChange={(event) =>
            setSelectedTimeframe(event.target.value as Timeframe)
          }
          value={watchedTimeframe}
        >
          {timeframes.map((timeframe) => (
            <option key={timeframe} value={timeframe}>
              {timeframe}
            </option>
          ))}
        </select>
      </div>
      {errors.timeframeValue && (
        <p className="text-error">{errors.timeframeValue.message}</p>
      )}

      {lightningAddress && lightningAddress?.lnurlpData?.commentAllowed && (
        <>
          <label className={labelClassName}>
            Your message (max{" "}
            {lightningAddress?.lnurlpData?.commentAllowed ?? 0} characters)
          </label>

          <input
            {...register("message")}
            className={inputClassName}
            maxLength={lightningAddress?.lnurlpData?.commentAllowed}
            placeholder="Thank you for your work"
          />
        </>
      )}

      {lightningAddress && lightningAddress?.lnurlpData?.payerData?.name && (
        <>
          <label className={labelClassName}>Your name</label>
          <input
            {...register("payerName")}
            className={inputClassName}
            placeholder="John Smith"
          />
        </>
      )}
    </form>
  );
}

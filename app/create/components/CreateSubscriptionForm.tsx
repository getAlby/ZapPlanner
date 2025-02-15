"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Timeframe, timeframes } from "types/Timeframe";
import { Loading } from "app/components/Loading";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
import { isValidPositiveValue, validateLightningAddress } from "lib/validation";
import { Box } from "app/components/Box";
import { Button } from "app/components/Button";
import {
  LUD18PayerData,
  LightningAddress,
  fiat,
} from "@getalby/lightning-tools";
import { SATS_CURRENCY } from "lib/constants";

type CreateSubscriptionFormData = Omit<
  CreateSubscriptionRequest,
  "nostrWalletConnectUrl" | "payerData" | "sleepDuration"
> & { payerName: string; timeframe: Timeframe; timeframeValue: string };

export function CreateSubscriptionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CreateSubscriptionFormData>({
    reValidateMode: "onBlur",
    mode: "onBlur",
    defaultValues: {
      currency: SATS_CURRENCY,
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

  const [currencies, setCurrencies] = React.useState<string[]>([SATS_CURRENCY]);
  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const response = await fetch(`https://getalby.com/api/rates`);
        const data = (await response.json()) as Record<
          string,
          { priority: number }
        >;

        const mappedCurrencies = Object.entries(data);

        mappedCurrencies.sort((a, b) => a[1].priority - b[1].priority);

        setCurrencies(
          mappedCurrencies.map((currency) => currency[0].toUpperCase()),
        );
      } catch (error) {
        console.error(error);
      }
    }

    fetchCurrencies();
  }, []);

  const [isNavigating, setNavigating] = React.useState(false);
  const { push } = useRouter();
  const onSubmit = handleSubmit(async (data) => {
    let encodedPayerData: string | undefined;
    if (data.payerName) {
      const payerData: LUD18PayerData = {
        name: data.payerName,
      };
      encodedPayerData = JSON.stringify(payerData);
    }

    const searchParams = new URLSearchParams();
    searchParams.append("amount", data.amount);
    if (data.currency) {
      searchParams.append("currency", data.currency);
    }
    searchParams.append("recipient", data.recipientLightningAddress);
    searchParams.append(
      "timeframe",
      data.timeframeValue + " " + data.timeframe,
    );
    if (data.message) {
      searchParams.append("comment", encodeURIComponent(data.message));
    }
    if (encodedPayerData) {
      searchParams.append("payerdata", encodeURIComponent(encodedPayerData));
    }
    setNavigating(true);
    push(`/confirm?${searchParams.toString()}`);
  });
  const watchedAmount = watch("amount");

  const [satoshiAmount, setSatoshiAmount] = useState<number>();
  const [convertedAmount, setConvertedAmount] = useState<string>("");

  const watchedCurrency = watch("currency");
  const setSelectedCurrency = React.useCallback(
    (currency: string) => setValue("currency", currency),
    [setValue],
  );

  useEffect(() => {
    const updateConversion = async () => {
      if (watchedAmount === undefined) {
        return;
      }

      if (watchedCurrency && watchedCurrency !== SATS_CURRENCY) {
        const value = await fiat.getSatoshiValue({
          amount: watchedAmount,
          currency: watchedCurrency,
        });
        setSatoshiAmount(value);
        setConvertedAmount("~" + value + " sats");
        return;
      }

      setSatoshiAmount(+watchedAmount);

      const value = await fiat.getFormattedFiatValue({
        satoshi: watchedAmount,
        currency: "usd",
        locale: "en-US",
      });
      setConvertedAmount(`~${value}`);
    };

    updateConversion();
  }, [watchedAmount, watchedCurrency]);

  const watchedTimeframe = watch("timeframe");
  const setSelectedTimeframe = React.useCallback(
    (timeframe: Timeframe) => setValue("timeframe", timeframe),
    [setValue],
  );
  const [validatingLightningAddress, setValidatingLightningAddress] =
    React.useState(false);
  const [lightningAddress, setLightningAddress] = React.useState<
    LightningAddress | undefined
  >(undefined);

  const isLoading = isSubmitting || isNavigating;

  return (
    <form onSubmit={onSubmit} className="flex flex-col w-full items-center">
      <Box>
        <div className="flex flex-col">
          <h2 className="font-heading font-bold text-2xl text-primary">
            New recurring payment
          </h2>

          <div className="flex justify-between sm:items-end sm:gap-4 max-sm:flex-col">
            <label className="zp-label">
              Recipient Lightning address<span className="text-red-500">*</span>{" "}
            </label>
            <label className="zp-label-ex">
              Example: <samp>hello@getalby.com</samp>
            </label>
          </div>
          <div className="relative flex flex-col justify-center">
            <input
              {...register("recipientLightningAddress", {
                validate: async (address) => {
                  setValidatingLightningAddress(true);
                  const { ln, errorMessage } = await validateLightningAddress(
                    address,
                    satoshiAmount || 0,
                  );

                  if (!errorMessage) {
                    setLightningAddress(ln);
                  } else {
                    setLightningAddress(undefined);
                  }

                  setValidatingLightningAddress(false);
                  return errorMessage;
                },
              })}
              className="zp-input"
            />
            {validatingLightningAddress && (
              <div className="absolute right-3">
                <Loading className="w-5" />
              </div>
            )}
          </div>
          {errors.recipientLightningAddress && (
            <p className="zp-form-error">
              {errors.recipientLightningAddress.message}
            </p>
          )}
          <label className="zp-label">
            Amount<span className="text-red-500 mr-2">*</span>
            <select
              className="select select-sm"
              onChange={(e) => setSelectedCurrency(e.target.value)}
              value={watchedCurrency}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>
          <div className="relative flex items-center justify-center">
            {convertedAmount && (
              <p className="absolute right-2 text-gray-500 text-sm mt-1 font-mono">
                {convertedAmount}
              </p>
            )}
            <input
              {...register("amount", {
                validate: (value) => {
                  return !isValidPositiveValue(parseInt(value))
                    ? "Please enter a positive value"
                    : undefined;
                },
              })}
              className="zp-input flex-1"
              placeholder={`Enter amount in ${watchedCurrency}`}
            />
          </div>
          {errors.amount && (
            <p className="zp-form-error">{errors.amount.message}</p>
          )}
          <label className="zp-label">
            Frequency<span className="text-red-500">*</span>
          </label>
          <div className={`flex justify-center gap-2 items-center`}>
            <p className="lg:flex-shrink-0">Repeat payment every</p>
            <input
              {...register("timeframeValue", {
                validate: (value) =>
                  !isValidPositiveValue(parseInt(value))
                    ? "Please enter a positive value"
                    : undefined,
              })}
              className={`zp-input w-full`}
            />
            <select
              {...register("timeframe")}
              className="select select-bordered"
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
            <p className="zp-form-error">{errors.timeframeValue.message}</p>
          )}

          {lightningAddress &&
            !!lightningAddress?.lnurlpData?.commentAllowed && (
              <>
                <label className="zp-label">Your message</label>

                <input
                  {...register("message")}
                  className="zp-input"
                  maxLength={lightningAddress?.lnurlpData?.commentAllowed}
                />
              </>
            )}

          {lightningAddress &&
            lightningAddress?.lnurlpData?.payerData?.name && (
              <>
                <label className="zp-label">Your name</label>
                <input {...register("payerName")} className="zp-input" />
              </>
            )}
        </div>
      </Box>
      <Button type="submit" className="mt-8" disabled={isLoading}>
        <div className="flex justify-center items-center gap-2">
          <span>Continue</span>
          {isLoading && <Loading />}
        </div>
      </Button>
    </form>
  );
}

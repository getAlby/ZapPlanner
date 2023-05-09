"use client";

import { useForm } from "react-hook-form";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
import { useRouter } from "next/navigation";
import { CreateSubscriptionResponse } from "types/CreateSubscriptionResponse";
import React from "react";
import { webln } from "alby-js-sdk";
import { UnconfirmedSubscription } from "types/UnconfirmedSubscription";
import { isValidNostrConnectUrl } from "lib/validation";
import { Box } from "app/components/Box";
import { SubscriptionSummary } from "app/confirm/components/SubscriptionSummary";
import Link from "next/link";
import { Button } from "app/components/Button";
import { Loading } from "app/components/Loading";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Modal } from "app/components/Modal";

type FormData = CreateSubscriptionRequest;

type ConfirmSubscriptionFormProps = {
  unconfirmedSubscription: UnconfirmedSubscription;
  returnUrl?: string;
};

export function ConfirmSubscriptionForm({
  unconfirmedSubscription,
  returnUrl,
}: ConfirmSubscriptionFormProps) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      ...unconfirmedSubscription,
      nostrWalletConnectUrl:
        process.env.NEXT_PUBLIC_DEFAULT_NOSTR_WALLET_CONNECT_URL,
    },
  });

  const [isNavigating, setNavigating] = React.useState(false);
  const { push } = useRouter();
  const hasLinkedWallet = !!watch("nostrWalletConnectUrl");

  const linkWallet = async () => {
    const nwc = webln.NostrWebLNProvider.withNewSecret(
      process.env.NEXT_PUBLIC_NWC_WALLET_PUBKEY &&
        process.env.NEXT_PUBLIC_NWC_AUTHORIZATION_URL
        ? {
            walletPubkey: process.env.NEXT_PUBLIC_NWC_WALLET_PUBKEY,
            authorizationUrl: process.env.NEXT_PUBLIC_NWC_AUTHORIZATION_URL,
          }
        : undefined
    );
    await nwc.initNWC({
      name: `ZapPlanner (${unconfirmedSubscription.recipientLightningAddress})`,
    });

    setValue("nostrWalletConnectUrl", nwc.getNostrWalletConnectUrl(true));
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!data.nostrWalletConnectUrl) {
      toast.error("Please link your wallet");
      return;
    }
    const subscriptionId = await createSubscription(data);
    if (subscriptionId) {
      toast.success("Periodic payment created");
      setNavigating(true);
      push(
        `/subscriptions/${subscriptionId}${
          returnUrl ? `?returnUrl=${returnUrl}` : ""
        }`
      );
    }
  });

  const isLoading = isSubmitting || isNavigating;

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col w-full items-center">
        <Box>
          <h2 className="font-heading font-bold text-2xl text-primary">
            Connect wallet to confirm periodic payment
          </h2>
          <SubscriptionSummary
            values={{
              amount: unconfirmedSubscription.amount,
              recipientLightningAddress:
                unconfirmedSubscription.recipientLightningAddress,
              sleepDuration: unconfirmedSubscription.sleepDuration,
              message: unconfirmedSubscription.message,
              payerData: unconfirmedSubscription.payerData,
            }}
            showFirstPayment
          />
          <div className="divider my-0" />
          <div className="flex justify-center items-start gap-2 px-8">
            <div className="border-[1px] border-[#7E22CD] rounded-2xl flex flex-col gap-8 py-4 px-8 w-full">
              <div className="flex justify-center items-center gap-2">
                <Image
                  src={`/icons/nwc.svg`}
                  alt={"NWC icon"}
                  width={32}
                  height={32}
                  priority
                />
                <h2 className="font-heading font-bold text-2xl text-primary">
                  Nostr Wallet Connect
                </h2>
              </div>

              <div className="flex justify-center">
                {!hasLinkedWallet ? (
                  <div className="flex flex-col items-center">
                    <Button
                      block
                      variant="primary"
                      type="button"
                      onClick={linkWallet}
                    >
                      <div className="flex justify-center items-center gap-2">
                        <Image
                          src={`/icons/alby.svg`}
                          alt={"Alby icon"}
                          width={24}
                          height={24}
                        />
                        Connect with Alby
                      </div>
                    </Button>
                    <div className="divider">or</div>
                    <div>
                      <span className="zp-label">
                        Paste a Nostr Wallet Connect url:
                      </span>
                      <input
                        className="zp-input-sm"
                        placeholder="nostrwalletconnect://..."
                        onChange={(e) =>
                          isValidNostrConnectUrl(e.target.value)
                            ? setValue("nostrWalletConnectUrl", e.target.value)
                            : toast.error("invalid NWC url")
                        }
                        value=""
                        type="password"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 p-3 rounded-md w-full dark:bg-green-900">
                    <p className="font-body text-green-700 dark:text-green-400 text-sm font-medium">
                      ✅ Wallet linked
                    </p>
                  </div>
                )}
              </div>
            </div>
            <Modal
              modalId="about-nwc"
              className="w-[480px] max-w-full"
              launcher={
                <label className="cursor-pointer flex-shrink-0">
                  <Image
                    src={`/icons/info-outline.svg`}
                    alt={"Info icon"}
                    width={16}
                    height={16}
                    priority
                  />
                </label>
              }
            >
              <div className="flex flex-col gap-4 justify-center items-center">
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src={`/icons/nwc.svg`}
                    alt={"NWC icon"}
                    width={32}
                    height={32}
                    priority
                  />
                  <h2 className="font-heading font-bold text-2xl text-primary">
                    Nostr Wallet Connect
                  </h2>
                </div>
                <p className="font-body">
                  Nostr Wallet Connect allows you to securely authorise
                  ZapPlanner to perform transactions from your lightning wallet
                  on your behalf.
                </p>
                <p className="font-body">
                  It is currently available for{" "}
                  <Link
                    href="https://nwc.getalby.com"
                    target="_blank"
                    className="link"
                  >
                    Alby accounts
                  </Link>{" "}
                  and as an{" "}
                  <Link
                    href="https://github.com/getAlby/umbrel-community-app-store"
                    target="_blank"
                    className="link"
                  >
                    Umbrel app
                  </Link>
                  .
                </p>
                <Link
                  href="https://blog.getalby.com/introducing-nostr-wallet-connect"
                  className="link"
                  target="_blank"
                >
                  Read more
                </Link>
              </div>
            </Modal>
          </div>
        </Box>
        <Button
          type="submit"
          className="mt-8"
          disabled={isLoading}
          variant={hasLinkedWallet ? "primary" : "disabled"}
        >
          <div className="flex justify-center items-center gap-2">
            <span>Create Periodic Payment</span>
            {isLoading && <Loading />}
          </div>
        </Button>
      </form>
    </>
  );
}

async function createSubscription(
  createSubscriptionRequest: CreateSubscriptionRequest
): Promise<string | undefined> {
  const res = await fetch("/api/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createSubscriptionRequest),
  });
  if (!res.ok) {
    toast.error(res.status + " " + res.statusText);
    return undefined;
  }
  const createSubscriptionResponse =
    (await res.json()) as CreateSubscriptionResponse;
  return createSubscriptionResponse.subscriptionId;
}

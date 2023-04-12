import { StartNewSubscriptionForm } from "app/components/StartNewSubscriptionForm";
import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <div className="w-full h-48 relative">
        <Image
          className="object-cover"
          src="/nwc-periodic-payments.png"
          alt="Periodic Payments Logo"
          fill
          priority
        />
      </div>
      <h2 className="font-heading font-bold text-2xl">
        What are periodic payments?
      </h2>
      <div className="flex flex-col gap-4">
        <AboutItem
          description="Periodic payments are lightning transfers sent within time intervals
        defined by you."
          icon="satoshi.svg"
        />
        <AboutItem
          description={
            <>
              Example: <span className="font-mono">100</span> sats every hour or{" "}
              <span className="font-mono">1,000</span> sats per day.
            </>
          }
          icon="info.svg"
        />

        <AboutItem
          description={
            <>
              They are possible thanks to{" "}
              <Link
                className="link"
                href="https://nwc.getalby.com"
                target="_blank"
              >
                Nostr Wallet Connect
              </Link>
              .
            </>
          }
          icon="nostr.svg"
        />
        <AboutItem
          description={
            <>
              Use ZapPlanner to plan your periodic payments eg. to provide
              continual support to your favourite{" "}
              <Link
                className="link"
                href="https://value4value.info/"
                target="_blank"
              >
                V4V
              </Link>{" "}
              creators.
            </>
          }
          icon="clock.svg"
        />
      </div>

      <StartNewSubscriptionForm />
    </>
  );
}

type AboutItemProps = {
  description: React.ReactNode;
  icon: string;
};

function AboutItem({ description, icon }: AboutItemProps) {
  return (
    <div className="flex gap-4">
      <Image
        src={`/icons/${icon}`}
        alt={icon}
        width={24}
        height={24}
        priority
      />
      <p className="font-body text-base">{description}</p>
    </div>
  );
}

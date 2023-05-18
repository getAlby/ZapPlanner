import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

type HeaderProps = {
  minimal?: boolean;
};

export function Header({ minimal = true }) {
  return (
    <div className="flex flex-col">
      {!minimal && (
        <div className="w-full h-48 lg:h-80 relative mb-8">
          <Image
            className="object-cover"
            style={{ objectPosition: "50% 85%" }}
            src="/nwc-periodic-payments.png"
            alt="Recurring Payments Logo"
            fill
            priority
          />
        </div>
      )}
      <Link href="/">
        <h1
          className={clsx(
            "font-heading font-bold text-center text-primary",
            minimal ? "text-3xl" : "text-4xl"
          )}
        >
          ZapPlanner
        </h1>
      </Link>
      {!minimal && (
        <h2 className="max-lg:text-center text-2xl text-primary-content">
          Schedule automatic recurring lightning payments
        </h2>
      )}
    </div>
  );
}

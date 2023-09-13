"use client";

import { useRouter } from "next/navigation";
import React from "react";
import clsx from "clsx";
import { toast } from "react-hot-toast";

type PayAgainButtonProps = {
  subscriptionId: string;
};

export function PayAgainButton({ subscriptionId }: PayAgainButtonProps) {
  const { refresh } = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const payAgain = React.useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(`/api/subscriptions/${subscriptionId}/reactivate`, {
      method: "POST",
    });
    if (!res.ok) {
      toast.error(res.status + " " + res.statusText);
    } else {
      toast.success("Payment triggered");
      // NOTE: there is no guarantee payment will be done in 3 seconds
      setTimeout(() => refresh(), 3000);
    }
    setIsLoading(false);
  }, [refresh, subscriptionId]);

  return (
    <button
      className={clsx(
        "btn btn-outline btn-sm btn-secondary normal-case",
        isLoading && "btn-disabled",
      )}
      onClick={payAgain}
      disabled={isLoading}
    >
      Pay again now
    </button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import React from "react";
import clsx from "clsx";

type CancelSubscriptionButtonProps = {
  subscriptionId: string;
};

export function CancelSubscriptionButton({
  subscriptionId,
}: CancelSubscriptionButtonProps) {
  const { push } = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const cancelSubscription = React.useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert(res.status + " " + res.statusText);
    } else {
      sessionStorage.setItem("flashAlert", "subscriptionDeleted");
      push("/");
    }
    setIsLoading(false);
  }, [push, subscriptionId]);

  return (
    <button
      className={clsx(
        "btn btn-outline btn-sm btn-error normal-case",
        isLoading && "btn-disabled"
      )}
      onClick={cancelSubscription}
      disabled={isLoading}
    >
      Cancel This Periodic Payment
    </button>
  );
}

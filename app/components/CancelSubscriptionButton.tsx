"use client";

import { useRouter } from "next/navigation";
import React from "react";
import clsx from "clsx";
import { toast } from "react-hot-toast";

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
      toast.error(res.status + " " + res.statusText);
    } else {
      toast.success("Recurring payment deleted");
      push("/");
    }
    setIsLoading(false);
  }, [push, subscriptionId]);

  return (
    <button
      type="button"
      className={clsx(
        "btn btn-outline btn-sm btn-error normal-case",
        isLoading && "btn-disabled",
      )}
      onClick={cancelSubscription}
      disabled={isLoading}
    >
      Cancel This Recurring Payment
    </button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import React from "react";
import clsx from "clsx";
import { toast } from "react-hot-toast";

type ReactivateSubscriptionButtonProps = {
  subscriptionId: string;
};

export function ReactivateSubscriptionButton({
  subscriptionId,
}: ReactivateSubscriptionButtonProps) {
  const { refresh } = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const reactivateSubscription = React.useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(`/api/subscriptions/${subscriptionId}/reactivate`, {
      method: "POST",
    });
    if (!res.ok) {
      toast.error(res.status + " " + res.statusText);
    } else {
      toast.success("Recurring payment reactivated");
      refresh();
    }
    setIsLoading(false);
  }, [refresh, subscriptionId]);

  return (
    <button
      className={clsx(
        "btn btn-outline btn-sm btn-secondary normal-case",
        isLoading && "btn-disabled"
      )}
      onClick={reactivateSubscription}
      disabled={isLoading}
    >
      Reactivate This Recurring Payment
    </button>
  );
}

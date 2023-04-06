"use client";

import { useRouter } from "next/navigation";
import React from "react";

type CancelSubscriptionButtonProps = {
  subscriptionId: string;
};

export function CancelSubscriptionButton({
  subscriptionId,
}: CancelSubscriptionButtonProps) {
  const { push } = useRouter();
  const cancelSubscription = React.useCallback(async () => {
    const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert(res.status + " " + res.statusText);
    } else {
      push("/");
    }
  }, [push, subscriptionId]);

  return (
    <button
      className="btn btn-outline btn-sm btn-error normal-case"
      onClick={cancelSubscription}
    >
      Cancel This Periodic Payment
    </button>
  );
}

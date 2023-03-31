"use client";

import { useRouter } from "next/navigation";
import React from "react";

type CancelSubscriptionButtonProps = {
  subscriptionId: string;
  goHome?: boolean;
};

export function CancelSubscriptionButton({
  subscriptionId,
  goHome,
}: CancelSubscriptionButtonProps) {
  const { refresh, push } = useRouter();
  const cancelSubscription = React.useCallback(async () => {
    const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert(res.status + " " + res.statusText);
    } else {
      if (goHome) {
        push("/");
      } else {
        refresh();
      }
    }
  }, [goHome, push, refresh, subscriptionId]);

  return (
    <button className="btn btn-sm btn-error" onClick={cancelSubscription}>
      Cancel Subscription
    </button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import React from "react";

type CancelSubscriptionButtonProps = {
  subscriptionId: string;
};

export function CancelSubscriptionButton({
  subscriptionId,
}: CancelSubscriptionButtonProps) {
  const { refresh } = useRouter();
  const cancelSubscription = React.useCallback(async () => {
    const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert(JSON.stringify(await res.json()));
    } else {
      refresh();
    }
  }, [refresh, subscriptionId]);

  return <button onClick={cancelSubscription}>Cancel subscription</button>;
}

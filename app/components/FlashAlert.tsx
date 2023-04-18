"use client";

import React from "react";

export function FlashAlert() {
  const [alertType, setAlertType] = React.useState<string | undefined>();
  React.useEffect(() => {
    const alertType = sessionStorage.getItem("flashAlert");
    if (alertType) {
      setAlertType(alertType);
      sessionStorage.removeItem("flashAlert");
    }
  }, []);

  return alertType === "subscriptionCreated" ||
    alertType === "subscriptionDeleted" ? (
    <div className="bg-green-50 p-3 rounded-md">
      <p className="font-body text-green-700 text-sm font-medium">
        ✅&nbsp;
        {alertType === "subscriptionCreated"
          ? "Your periodic payment has been successfully created!"
          : "Periodic payment deleted"}
      </p>
    </div>
  ) : null;
}

"use client";

import React from "react";

export function SaveSubscriptionAlert() {
  const [wasDismissed, setDismissed] = React.useState(false);
  if (wasDismissed) {
    return null;
  }
  return (
    <div className="alert shadow-lg mb-4">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-info flex-shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span>
          {
            "Sign in or bookmark this page so you can access your subscription later if you wish to cancel it."
          }
        </span>
      </div>
      <div className="flex-none">
        <button
          onClick={() => setDismissed(true)}
          className="btn btn-sm btn-ghost"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

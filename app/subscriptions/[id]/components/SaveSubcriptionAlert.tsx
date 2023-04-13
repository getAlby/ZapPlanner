import Link from "next/link";
import React from "react";

export function SaveSubscriptionAlert() {
  return (
    <div className="bg-blue-50 p-3 rounded-md">
      <p className="font-body text-blue-700 text-sm font-medium">
        ⓘ&nbsp;Bookmark this page so you can access this periodic payment If you
        wish to cancel. You can also delete your{" "}
        <Link className="link" href="https://nwc.getalby.com" target="_blank">
          Nostr wallet connect
        </Link>{" "}
        session.
      </p>
    </div>
  );
}

import { CancelSubscriptionButton } from "app/components/CancelSubscriptionButton";
import { prismaClient } from "lib/server/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "pages/api/auth/[...nextauth]";

export async function SubscriptionsList() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return null;
  }
  const subscriptions = await prismaClient.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
  });
  return (
    <div className="flex flex-1 gap-4 flex-wrap">
      {subscriptions.map((subscription) => (
        <div key={subscription.id}>
          <div className="flex flex-col bg-base-200 rounded-lg p-4 w-full max-w-xs">
            <p>
              {subscription.amount}⚡ every {subscription.sleepDuration}
            </p>
            <p>to {subscription.recipientLightningAddress}</p>
            <div className="flex gap-2 mt-4 justify-end w-full">
              <Link href={`/subscriptions/${subscription.id}`}>
                <button className="btn btn-sm">View</button>
              </Link>
              <CancelSubscriptionButton subscriptionId={subscription.id} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

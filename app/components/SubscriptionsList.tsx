import { CancelSubscriptionButton } from "app/components/CancelSubscriptionButton";
import { prismaClient } from "lib/server/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export async function SubscriptionsList() {
  const session = await getServerSession(authOptions);
  const subscriptions = await prismaClient.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
  });
  return subscriptions.map((subscription) => (
    <div key={subscription.id}>
      <p>
        Subscription {subscription.id}
        <CancelSubscriptionButton subscriptionId={subscription.id} />
      </p>
    </div>
  ));
}

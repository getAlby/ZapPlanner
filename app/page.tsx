import { CreateSubscriptionForm } from "app/components/CreateSubscriptionForm";
import { LoginButton } from "app/components/LoginButton";
import { LogoutButton } from "app/components/LogoutButton";
import { SubscriptionsList } from "app/components/SubscriptionsList";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function Home() {
  return <Dashboard />;
}

function Dashboard() {
  return (
    <div className="flex gap-4 flex-1 flex-wrap">
      <CreateSubscriptionForm />
      {/* @ts-expect-error Server Component */}
      <SubscriptionsList />
    </div>
  );
}

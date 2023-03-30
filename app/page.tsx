import { CreateSubscriptionForm } from "app/components/CreateSubscriptionForm";
import { LoginButton } from "app/components/LoginButton";
import { LogoutButton } from "app/components/LogoutButton";
import { SubscriptionsList } from "app/components/SubscriptionsList";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <LandingPage />;
  }
  return <Dashboard />;
}

function LandingPage() {
  return (
    <div>
      <LoginButton />
      <p>TODO</p>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="flex flex-col gap-4 min-h-full">
      <div className="flex justify-between p-4 bg-base-200 items-center shadow-lg">
        <h1 className="text-2xl">NWC Periodic Payments</h1>
        <LogoutButton />
      </div>
      <div className="flex gap-4 flex-1 flex-wrap">
        <CreateSubscriptionForm />
        {/* @ts-expect-error Server Component */}
        <SubscriptionsList />
      </div>
    </div>
  );
}

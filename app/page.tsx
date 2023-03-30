import { CreateSubscriptionForm } from "app/components/CreateSubscriptionForm";
import { LoginButton } from "app/components/LoginButton";
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
    <div>
      <CreateSubscriptionForm />
    </div>
  );
}

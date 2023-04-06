import { CreateSubscriptionForm } from "app/components/CreateSubscriptionForm";

export default async function Home() {
  return (
    <div className="flex gap-4 flex-1 flex-wrap">
      <CreateSubscriptionForm />
    </div>
  );
}

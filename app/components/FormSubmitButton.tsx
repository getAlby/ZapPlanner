"use client";
import { usePathname } from "next/navigation";

export function FormSubmitButton() {
  const pathname = usePathname();

  const title =
    pathname === "/"
      ? "New Periodic Payment"
      : pathname === "/create"
      ? "Continue"
      : pathname === "/confirm"
      ? "Create Periodic Payment"
      : pathname?.startsWith("/subscriptions")
      ? "New Periodic Payment"
      : null;

  if (!title) {
    return null;
  }

  return (
    <button
      form="create-subscription"
      type="submit"
      className="shadow w-64 h-10 rounded-md font-body font-bold hover:opacity-80"
      style={{
        background: "linear-gradient(180deg, #FFDE6E 63.72%, #F8C455 95.24%)",
      }}
    >
      {title}
    </button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export function HomePageForm() {
  const { push } = useRouter();
  const goToCreatePage = (event: FormEvent) => {
    push("/create");
    event.preventDefault();
  };

  return (
    <form
      className="hidden"
      id="create-subscription"
      onSubmit={goToCreatePage}
    />
  );
}

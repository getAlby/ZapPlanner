import React from "react";
import Link from "next/link";
import { FlashAlert } from "app/components/FlashAlert";
import { Button } from "app/components/Button";
import { Header } from "app/components/Header";

export default function HomePage() {
  return (
    <>
      <Header minimal={false} />
      <FlashAlert />
      <div className="flex gap-4 flex-wrap items-center justify-center">
        <Link href="/create">
          <Button>New Periodic Payment</Button>
        </Link>
        <Link href="/about">
          <Button variant="secondary">How does it work?</Button>
        </Link>
      </div>
    </>
  );
}

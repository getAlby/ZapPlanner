"use client";
import { albyProviderId } from "lib/constants";
import { signIn } from "next-auth/react";
export function LoginButton() {
  return <button onClick={() => signIn(albyProviderId)}>Sign in</button>;
}

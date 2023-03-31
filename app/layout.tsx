import { LoginButton } from "app/components/LoginButton";
import { LogoutButton } from "app/components/LogoutButton";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex justify-between p-4 bg-base-200 items-center shadow-lg">
            <Link href="/">
              <h1 className="text-2xl font-bold">
                Nostr Wallet Connect
                <br />
                <span className="text-sm font-normal">Periodic Payments</span>
              </h1>
            </Link>
            {session ? <LogoutButton /> : <LoginButton />}
          </div>
          <div className="flex flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}

import { FormSubmitButton } from "app/components/FormSubmitButton";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Periodic Payments Creator",
  description: "Schedule lightning payments to a lightning address using NWC",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="flex flex-col gap-8 px-4 py-14 lg:px-14 items-center justify-start">
          <Link href="/">
            <h1
              className="font-heading font-bold text-3xl text-black text-center
"
            >
              Periodic Payments Creator
            </h1>
          </Link>
          <div className="flex flex-col p-10 gap-8 bg-white shadow rounded-lg max-w-xl">
            {children}
          </div>
          <FormSubmitButton />
        </div>
        <div className="flex gap-2 items-center justify-center mt-6 mb-10">
          <span className="font-body text-xs">Powered by</span>
          <Image
            src="/alby.svg"
            alt="Alby Logo"
            width={63}
            height={30}
            priority
          />
        </div>
      </body>
    </html>
  );
}

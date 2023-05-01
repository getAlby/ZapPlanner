import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "ZapPlanner",
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
        <div className="flex flex-col gap-8 px-4 py-4 lg:py-14 lg:px-14 items-center justify-start">
          {children}
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

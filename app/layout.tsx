import { Modal } from "app/components/Modal";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "ZapPlanner",
  description: "Schedule lightning payments to a lightning address using NWC",
};

const exampleConfirmationLink =
  "https://zapplanner.albylabs.com/confirm?amount=21&recipient=hello@getalby.com&timeframe=30%20days&comment=baz&payerdata=%7B%22name%22%3A%22Bob%22%7D&returnUrl=https%3A%2F%2Fexample.com";

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
          <Link href="https://getalby.com" target="_blank">
            <div className="flex gap-2 items-center justify-center">
              <span className="font-body text-xs">Powered by</span>
              <Image
                src="/alby.svg"
                alt="Alby Logo"
                width={63}
                height={30}
                priority
              />
            </div>
          </Link>
          <span>•</span>
          <div className="flex gap-2 items-center justify-center">
            <Modal
              launcher={
                <label className="font-body text-xs cursor-pointer">
                  For Developers
                </label>
              }
            >
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold">
                  Programmatically create confirmation links
                </h3>
                <p>
                  As a service you can programmatically create a URL with all
                  the subscription properties that your users will&nbsp;
                  <Link
                    className="link inline"
                    href={exampleConfirmationLink}
                    target="_blank"
                  >
                    only need to confirm
                  </Link>
                  .
                </p>

                <div className="bg-slate-600 p-4 text-slate-200 rounded-lg break-all">
                  <Link
                    href={exampleConfirmationLink}
                    target="_blank"
                    className="underline"
                  >
                    {exampleConfirmationLink}
                  </Link>
                </div>
                <ul className="list-disc list-inside">
                  <li>
                    <span className="font-bold">amount</span>,{" "}
                    <span className="font-bold">recipient</span>, and{" "}
                    <span className="font-bold">timeframe</span> are required
                  </li>
                  <li>
                    <span className="font-bold">amount</span> is in sats
                  </li>
                  <li>
                    <span className="font-bold">recipient</span> must be a
                    lightning address
                  </li>
                  <li>
                    <span className="font-bold">timeframe</span> must be in
                    milliseconds, or a valid{" "}
                    <Link
                      href="https://www.npmjs.com/package/ms"
                      target="_blank"
                      className="link"
                    >
                      ms
                    </Link>{" "}
                    string e.g. <span className="font-bold">1%20day</span> or{" "}
                    <span className="font-bold">30%20minutes</span>
                  </li>
                  <li>
                    <span className="font-bold">payerdata</span> should be a
                    URL-encoded JSON object as per{" "}
                    <Link
                      href="https://github.com/lnurl/luds/blob/luds/18.md"
                      target="_blank"
                      className="link"
                    >
                      LUD-18
                    </Link>
                  </li>
                  <li>
                    <span className="font-bold">comment</span> and{" "}
                    <span className="font-bold">payerdata</span> will only be
                    sent if the recipient lightning address supports it
                  </li>
                  <li>
                    <span className="font-bold">returnUrl</span> encoded URL to
                    show on the confirmation page to link users back to your
                    site
                  </li>
                </ul>
                <div className="divider my-0" />
                <p>
                  💡 You can attach a custom reference identifier in the{" "}
                  <span className="font-bold">comment</span> or{" "}
                  <span className="font-bold">payerdata</span> field.
                </p>
              </div>
            </Modal>
          </div>
        </div>
      </body>
    </html>
  );
}

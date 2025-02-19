import { Modal } from "app/components/Modal";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { AlbyLogo } from "app/components/icons/AlbyLogo";

export const metadata = {
  title: "ZapPlanner",
  description: "Schedule lightning payments to a lightning address using NWC",
};

const exampleConfirmationLink =
  "https://zapplanner.albylabs.com/confirm?amount=21&currency=SATS&recipient=hello@getalby.com&timeframe=30%20days&comment=baz&payerdata=%7B%22name%22%3A%22Bob%22%7D&returnUrl=https%3A%2F%2Fexample.com";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-base-200">
        <div className="flex flex-col gap-8 px-4 py-4 lg:py-14 lg:px-14 items-center justify-start">
          <Toaster position="bottom-center" />
          {children}
        </div>
        <div className="flex gap-2 items-center justify-center mt-6 mb-10">
          <Link href="https://getalby.com" target="_blank">
            <div className="flex gap-2 items-center justify-center">
              <span className="font-body text-xs">Powered by</span>
              <AlbyLogo className="text-primary" />
            </div>
          </Link>
          <span>•</span>
          <div className="flex gap-2 items-center justify-center">
            <Modal
              className="w-[700px] max-w-full"
              launcher={
                <span className="font-body text-xs">For Developers</span>
              }
            >
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-primary">
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
                  <li className="list-item">
                    <span className="font-bold">amount</span>,{" "}
                    <span className="font-bold">recipient</span>, and{" "}
                    <span className="font-bold">timeframe</span> are required
                  </li>
                  <li className="list-item">
                    <span className="font-bold">amount</span> in chosen currency
                  </li>
                  <li className="list-item">
                    <span className="font-bold">currency</span> (default SATS)
                    see{" "}
                    <Link
                      href="https://getalby.com/api/rates"
                      target="_blank"
                      className="link"
                    >
                      available currencies
                    </Link>{" "}
                  </li>
                  <li className="list-item">
                    <span className="font-bold">recipient</span> must be a
                    lightning address
                  </li>
                  <li className="list-item">
                    <span className="font-bold">timeframe</span> must be a valid{" "}
                    <Link
                      href="https://www.npmjs.com/package/ms"
                      target="_blank"
                      className="link"
                    >
                      ms
                    </Link>{" "}
                    string e.g. <span className="font-bold">1 day</span> or{" "}
                    <span className="font-bold">30 minutes</span>
                  </li>
                  <li className="list-item">
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
                  <li className="list-item">
                    <span className="font-bold">comment</span> and{" "}
                    <span className="font-bold">payerdata</span> will only be
                    sent if the recipient lightning address supports it
                  </li>
                  <li className="list-item">
                    <span className="font-bold">returnUrl</span> encoded URL to
                    show on the confirmation page to link users back to your
                    site
                  </li>
                  <li className="list-item">
                    <span className="font-bold">nwcUrl</span> url-encoded NWC
                    connection secret
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

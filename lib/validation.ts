import { LightningAddress } from "alby-tools";

export const isValidPositiveValue = (value: number) => {
  return !isNaN(value) && value > 0;
};

export const validateLightningAddress = async (
  address: string,
  amount: number,
) => {
  let errorMessage: string | undefined = undefined;
  let ln: LightningAddress | undefined;
  try {
    if (!address.length) {
      errorMessage = "Please provide a lightning address";
    }
    ln = new LightningAddress(address);
    if (!ln.username) {
      errorMessage = "This is not a valid lightning address";
    }
    if (!errorMessage) {
      await ln.fetch();
      if (ln.lnurlpData) {
        if (
          amount * 1000 < ln.lnurlpData.min ||
          amount * 1000 > ln.lnurlpData.max
        ) {
          errorMessage = `This lightning address only accepts amounts between ${
            ln.lnurlpData.min / 1000
          } and ${ln.lnurlpData.max / 1000} sats`;
        }
      } else {
        errorMessage = "This lightning address does not exist";
      }
    }
  } catch (e) {
    console.error(e);
    errorMessage = "This is not a valid lightning address";
  }

  return { errorMessage, ln };
};

export const isValidNostrConnectUrl = (url: string) => {
  return (
    (url.startsWith("nostrwalletconnect://") ||
      url.startsWith("nostr+walletconnect://")) &&
    url.indexOf("&secret=") > 0
  );
};

export const emailRegex = /\S+@\S+\.\S+/;

export const isValidEmail = (email: string) => emailRegex.test(email);

import { LightningAddress } from "alby-tools";

export const isValidPositiveValue = (value: number) => {
  return !isNaN(value) && value > 0;
};

export const isValidLightningAddress = async (address: string) => {
  const ln = new LightningAddress(address);
  if (!ln.username) {
    return false;
  }
  await ln.fetch();
  if (!ln.lnurlpData) {
    return false;
  }
};

export const isValidNostrConnectUrl = (url: string) => {
  return (
    (url.startsWith("nostrwalletconnect://") ||
      url.startsWith("nostr+walletconnect://")) &&
    url.indexOf("&secret=") > 0
  );
};

import { albyProviderId } from "lib/constants";
import { Provider } from "next-auth/providers";

type AlbyMeResponse = {
  identifier: string;
  email: string;
  name: string;
  avatar: string;
};

export const albyProviderConfig = {
  id: albyProviderId,
  name: "Alby",
  origin: "https://getalby.com",
  apiUrl: "https://api.getalby.com",
  clientId: process.env.ALBY_OAUTH_CLIENT_ID,
  clientSecret: process.env.ALBY_OAUTH_CLIENT_SECRET,
};

if (!albyProviderConfig.clientId || !albyProviderConfig.clientSecret) {
  console.error("Alby OAuth environment variables are unset");
}

export const albyProvider: Provider = {
  id: albyProviderConfig.id,
  name: albyProviderConfig.name,
  type: "oauth",
  authorization: {
    url: `${albyProviderConfig.origin}/oauth`,
    params: {
      scope: "account:read invoices:read",
    },
  },
  token: `${albyProviderConfig.apiUrl}/oauth/token`,
  userinfo: `${albyProviderConfig.apiUrl}/user/me`,
  clientId: albyProviderConfig.clientId,
  clientSecret: albyProviderConfig.clientSecret,
  httpOptions: {
    timeout: 60000,
  },

  profile(profile: AlbyMeResponse, tokens) {
    return {
      id: profile.identifier,
      name: profile.name,
      email: profile.email,
      image: profile.avatar,
    };
  },
};

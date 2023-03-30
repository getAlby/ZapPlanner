import "next-auth";
import { User } from "@prisma/client";
import { OauthProviderId } from "lib/server/providers";
import { OAuthToken } from "types/OAuthToken";

declare module "next-auth" {
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User;
  }
}

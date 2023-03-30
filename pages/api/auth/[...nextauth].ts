import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { User } from "@prisma/client";
import { prismaClient } from "lib/server/prisma";
import NextAuth, { AuthOptions } from "next-auth";
import { albyProvider } from "pages/api/auth/providers/alby";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prismaClient),
  providers: [albyProvider],
  callbacks: {
    async session({ session, token }) {
      return Promise.resolve({
        ...session,
        user: token.user,
      });
    },
    async jwt({ user, token }) {
      if (user) {
        token.user = user as User;
      }
      return token;
    },
  },
  session: { strategy: "jwt" },
};

export default NextAuth(authOptions);

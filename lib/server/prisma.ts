import { PrismaClient } from "@prisma/client";
import { fieldEncryptionMiddleware } from "prisma-field-encryption";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prismaClient = globalThis.prisma || createPrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prismaClient;

function createPrismaClient() {
  const client = new PrismaClient();
  client.$use(fieldEncryptionMiddleware());
  return client;
}

/*
  Warnings:

  - You are about to drop the column `lastPaymentDateTime` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "lastPaymentDateTime",
ADD COLUMN     "lastFailedPaymentDateTime" TIMESTAMP(3),
ADD COLUMN     "lastSuccessfulPaymentDateTime" TIMESTAMP(3);

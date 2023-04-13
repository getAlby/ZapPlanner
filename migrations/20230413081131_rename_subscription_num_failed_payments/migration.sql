/*
  Warnings:

  - You are about to drop the column `numErrors` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "numErrors",
ADD COLUMN     "numFailedPayments" INTEGER NOT NULL DEFAULT 0;

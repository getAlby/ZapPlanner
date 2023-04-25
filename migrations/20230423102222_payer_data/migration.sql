/*
  Warnings:

  - You are about to drop the column `payerName` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "payerName",
ADD COLUMN     "payerData" TEXT;

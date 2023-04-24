/*
  Warnings:

  - You are about to drop the column `senderName` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "senderName",
ADD COLUMN     "payerName" TEXT;

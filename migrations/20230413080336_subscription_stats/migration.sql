-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "createdDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastPaymentDateTime" TIMESTAMP(3),
ADD COLUMN     "numErrors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "numSuccessfulPayments" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

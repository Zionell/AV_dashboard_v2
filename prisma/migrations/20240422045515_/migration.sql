/*
  Warnings:

  - You are about to drop the column `companyOwnerId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_companyOwnerId_fkey";

-- DropIndex
DROP INDEX "User_companyOwnerId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "companyOwnerId",
ADD COLUMN     "isCompanyOwner" BOOLEAN NOT NULL DEFAULT false;

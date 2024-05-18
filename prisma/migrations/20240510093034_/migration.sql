/*
  Warnings:

  - You are about to drop the column `creatorId` on the `Todo` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Todo" DROP CONSTRAINT "Todo_creatorId_fkey";

-- DropIndex
DROP INDEX "Todo_creatorId_key";

-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "creatorId";

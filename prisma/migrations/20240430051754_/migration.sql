/*
  Warnings:

  - Made the column `todoStatusId` on table `Todo` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Todo" DROP CONSTRAINT "Todo_todoStatusId_fkey";

-- AlterTable
ALTER TABLE "Todo" ALTER COLUMN "todoStatusId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_todoStatusId_fkey" FOREIGN KEY ("todoStatusId") REFERENCES "TodoStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `task` on the `Times` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Company_ownerId_key";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "Times" DROP COLUMN "task",
ADD COLUMN     "todoId" TEXT NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "Times" ADD CONSTRAINT "Times_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

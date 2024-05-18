/*
  Warnings:

  - You are about to drop the `UsersOnTodoes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `executorId` to the `Todo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UsersOnTodoes" DROP CONSTRAINT "UsersOnTodoes_todoId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnTodoes" DROP CONSTRAINT "UsersOnTodoes_userId_fkey";

-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "executorId" TEXT NOT NULL;

-- DropTable
DROP TABLE "UsersOnTodoes";

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_executorId_fkey" FOREIGN KEY ("executorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

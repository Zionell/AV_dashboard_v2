/*
  Warnings:

  - A unique constraint covering the columns `[projectId]` on the table `Todo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectId` to the `Todo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "projectId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Todo_projectId_key" ON "Todo"("projectId");

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

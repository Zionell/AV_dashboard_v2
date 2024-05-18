/*
  Warnings:

  - You are about to drop the column `todoId` on the `Times` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Times" DROP CONSTRAINT "Times_todoId_fkey";

-- AlterTable
ALTER TABLE "Times" DROP COLUMN "todoId";

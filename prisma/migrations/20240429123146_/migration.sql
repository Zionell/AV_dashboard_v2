-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "todoStatusId" TEXT;

-- CreateTable
CREATE TABLE "TodoStatus" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "TodoStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_todoStatusId_fkey" FOREIGN KEY ("todoStatusId") REFERENCES "TodoStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

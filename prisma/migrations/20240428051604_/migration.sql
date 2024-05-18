-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_projectId_fkey";

-- AlterTable
ALTER TABLE "Material" ALTER COLUMN "projectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

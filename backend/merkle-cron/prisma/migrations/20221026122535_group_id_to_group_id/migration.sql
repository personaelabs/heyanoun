/*
  Warnings:

  - You are about to drop the column `group_id` on the `Leaf` table. All the data in the column will be lost.
  - Added the required column `groupId` to the `Leaf` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Leaf" DROP CONSTRAINT "Leaf_group_id_fkey";

-- AlterTable
ALTER TABLE "Leaf" DROP COLUMN "group_id",
ADD COLUMN     "groupId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Leaf" ADD CONSTRAINT "Leaf_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

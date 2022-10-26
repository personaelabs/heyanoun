/*
  Warnings:

  - A unique constraint covering the columns `[full_name]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `num_nouns` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Group_prop_num_key";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "num_nouns" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Group_full_name_key" ON "Group"("full_name");

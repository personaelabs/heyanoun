/*
  Warnings:

  - You are about to drop the column `full_name` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `num_nouns` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `prop_num` on the `Group` table. All the data in the column will be lost.
  - Added the required column `propId` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeId` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Group_full_name_key";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "full_name",
DROP COLUMN "num_nouns",
DROP COLUMN "prop_num",
ADD COLUMN     "propId" INTEGER NOT NULL,
ADD COLUMN     "typeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Prop" (
    "id" SERIAL NOT NULL,
    "num" INTEGER NOT NULL,

    CONSTRAINT "Prop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GroupType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupType_name_key" ON "GroupType"("name");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_propId_fkey" FOREIGN KEY ("propId") REFERENCES "Prop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "GroupType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

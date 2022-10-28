/*
  Warnings:

  - A unique constraint covering the columns `[propId,typeId]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[data,groupId]` on the table `Leaf` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Group_propId_typeId_key" ON "Group"("propId", "typeId");

-- CreateIndex
CREATE UNIQUE INDEX "Leaf_data_groupId_key" ON "Leaf"("data", "groupId");

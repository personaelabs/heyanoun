/*
  Warnings:

  - A unique constraint covering the columns `[num]` on the table `Prop` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Prop_num_key" ON "Prop"("num");

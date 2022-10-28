/*
  Warnings:

  - Added the required column `data` to the `Leaf` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Leaf" ADD COLUMN     "data" TEXT NOT NULL;

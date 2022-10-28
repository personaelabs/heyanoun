-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "root" TEXT NOT NULL,
    "prop_num" INTEGER NOT NULL,
    "full_name" TEXT NOT NULL,
    "last_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaf" (
    "id" SERIAL NOT NULL,
    "path" TEXT[],
    "indices" TEXT[],
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "Leaf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Group_prop_num_key" ON "Group"("prop_num");

-- AddForeignKey
ALTER TABLE "Leaf" ADD CONSTRAINT "Leaf_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

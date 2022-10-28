import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// NOTE: assumes that the latest prop in Prop has all relevant groups
export async function getLastFinalizedProp() {
  const latestProps = await prisma.prop.findMany({
    where: {
      finalized: true,
    },
    orderBy: {
      num: "desc",
    },
    take: 1,
  });

  if (latestProps.length === 0) {
    return 0;
  } else {
    return latestProps[0].num;
  }
}

// NOTE: when we add more group types, will have to think more about where to put this
export async function createGroupTypes() {
  await prisma.groupType.upsert({
    where: {
      name: "1-noun",
    },
    update: {},
    create: {
      name: "1-noun",
    },
  });
  await prisma.groupType.upsert({
    where: {
      name: "2-noun",
    },
    update: {},
    create: {
      name: "2-noun",
    },
  });
}

export async function createProp(num: number) {
  return await prisma.prop.upsert({
    where: {
      num,
    },
    update: {},
    create: {
      num,
    },
  });
}

export async function createGroup(
  root: bigint,
  propId: number,
  typeId: number
) {
  return await prisma.group.upsert({
    where: {
      propId_typeId: {
        propId,
        typeId,
      },
    },
    update: { root },
    create: {
      root,
      propId,
      typeId,
    },
  });
}

export async function createLeaves(
  leafToPathElements,
  leafToPathIndices,
  groupId: number
) {
  for (let leaf in leafToPathElements) {
    let path = leafToPathElements[leaf];
    let indices = leafToPathIndices[leaf];
    await prisma.leaf.upsert({
      where: {
        data_groupId: {
          data: leaf,
          groupId,
        },
      },
      update: {
        path,
        indices,
      },
      create: {
        data: leaf,
        path,
        indices,
        groupId,
      },
    });
  }
}

export async function finalizeProp(id: number) {
  await prisma.prop.update({
    where: {
      id,
    },
    data: {
      finalized: true,
    },
  });
}

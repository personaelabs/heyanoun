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
  const prop = await prisma.prop.create({
    data: {
      num,
    },
  });

  return prop;
}

export async function createGroup(
  root: string,
  propId: number,
  typeId: number
) {
  const group = await prisma.group.create({
    data: {
      root,
      propId,
      typeId,
    },
  });

  return group;
}

export async function createLeaves(
  leafToPathElements,
  leafToPathIndices,
  groupId: number
) {
  for (let leaf in leafToPathElements) {
    let path = leafToPathElements[leaf];
    let indices = leafToPathIndices[leaf];
    await prisma.leaf.create({
      data: {
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

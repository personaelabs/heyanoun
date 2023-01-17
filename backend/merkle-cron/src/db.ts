import { PrismaClient } from "@prisma/client";
import { MerkleTree } from "./merklePoseidon";

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
  root: string,
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
    let path = leafToPathElements[leaf].map((i) => i.toString());
    let indices = leafToPathIndices[leaf].map((i) => i.toString());
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

// NOTE: should only to be used with propId -1 (cur nouners)
export async function cleanLeaves(propId: number) {
  await prisma.leaf.deleteMany({
    where: {
      group: {
        prop: {
          id: propId,
        },
      },
    },
  });
}

export async function writeTree(tree: MerkleTree, propId, typeId) {
  console.log(`[prop ${propId} anonSet ${typeId}] - root: ${tree.root}`);
  console.log(`[prop ${propId} anonSet ${typeId}] - creating group in db`);
  const group = await createGroup(tree.root.toString(), propId, typeId);

  console.log(`[prop ${propId} anonSet ${typeId}] - creating leaves in db`);
  await createLeaves(tree.leafToPathElements, tree.leafToPathIndices, group.id);
}

export async function disconnectDb() {
  await prisma.$disconnect();
}

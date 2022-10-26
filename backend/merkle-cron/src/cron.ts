import {
  executeQuery,
  buildPropsQuery,
  buildDelegatesQuery,
  buildOwnersQuery,
} from "./queries";

import { buildTreePoseidon } from "./merklePoseidon";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// NOTE: assumes that the latest prop in Prop has all relevant groups
async function getLastFinalizedProp() {
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
async function createGroupTypes() {
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

// NOTE: idempotent
async function run() {
  await createGroupTypes();

  const lastProp = await getLastFinalizedProp();
  console.log(`Last finalized prop: ${lastProp}`);

  let props = (await executeQuery(buildPropsQuery(lastProp)))["proposals"];
  console.log(`Retrieved ${props.length} proposals`);

  for (const { id, createdBlock } of props) {
    // NOTE: we don't bother with separate queries for 1,2 anonymity set to limit thegraph queries
    let delegates = (await executeQuery(buildDelegatesQuery(createdBlock, 1)))[
      "delegates"
    ];
    console.log(`[prop ${id}] - Retrieved ${delegates.length} delegates`);
    let owners = (await executeQuery(buildOwnersQuery(createdBlock, 1)))[
      "accounts"
    ];
    console.log(`[prop ${id}] - Retrieved ${owners.length} owners`);
    let anonSet1 = Array.from(
      new Set([...delegates.map((d) => d.id), ...owners.map((d) => d.id)])
    );
    // NOTE: both merkle trees use default depth for now
    let tree1 = await buildTreePoseidon(anonSet1);
    console.log(
      `[prop ${id}] - anonSet1 size: ${anonSet1.length}, root: ${tree1.root}`
    );
    let anonSet2 = Array.from(
      new Set([
        ...delegates.filter((d) => d.delegatedVotes >= 2).map((d) => d.id),
        ...owners.filter((d) => d.tokenBalance >= 2).map((d) => d.id),
      ])
    );
    let tree2 = await buildTreePoseidon(anonSet2);
    console.log(
      `[prop ${id}] - anonSet2 size: ${anonSet2.length}, root: ${tree2.root}`
    );

    console.log(`[prop ${id}] - creating prop in db`);
    const prop = await prisma.prop.create({
      data: {
        num: id,
      },
    });

    console.log(`[prop ${id}] - creating groups in db`);
    const group1 = await prisma.group.create({
      data: {
        root: tree1.root,
        propId: prop.id,
        typeId: 1,
      },
    });
    const group2 = await prisma.group.create({
      data: {
        root: tree2.root,
        propId: prop.id,
        typeId: 2,
      },
    });

    console.log(`[prop ${id}] - creating group leaves in db`);
    for (let leaf in tree1.leafToPathElements) {
      let pathElements = tree1.leafToPathElements[leaf];
      let pathIndices = tree1.leafToPathIndices[leaf];
      await prisma.leaf.create({
        data: {
          data: leaf,
          path: pathElements,
          indices: pathIndices,
          groupId: group1.id,
        },
      });
    }
    for (let leaf in tree2.leafToPathElements) {
      let pathElements = tree2.leafToPathElements[leaf];
      let pathIndices = tree2.leafToPathIndices[leaf];
      await prisma.leaf.create({
        data: {
          data: leaf,
          path: pathElements,
          indices: pathIndices,
          groupId: group2.id,
        },
      });
    }

    console.log(`[prop ${id}] - finalizing!`);
    await prisma.prop.update({
      where: {
        id: prop.id,
      },
      data: {
        finalized: true,
      },
    });
  }
}

run()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

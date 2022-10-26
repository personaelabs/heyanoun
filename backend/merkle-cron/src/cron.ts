import {
  executeQuery,
  buildPropsQuery,
  buildDelegatesQuery,
  buildOwnersQuery,
} from "./graphql";

import {
  getLastFinalizedProp,
  createGroupTypes,
  prisma,
  createProp,
  createGroup,
  finalizeProp,
  createLeaves,
} from "./db";

import { buildTreePoseidon } from "./merklePoseidon";
import { createProperty } from "typescript";

// TODO: fix type errors!
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
    const prop = await createProp(id);

    console.log(`[prop ${id}] - creating groups in db`);
    const group1 = await createGroup(tree1.root, prop.id, 1);
    const group2 = await createGroup(tree2.root, prop.id, 2);

    console.log(`[prop ${id}] - creating group leaves in db`);
    await createLeaves(
      tree1.leafToPathElements,
      tree1.leafToPathIndices,
      group1.id
    );
    await createLeaves(
      tree2.leafToPathElements,
      tree2.leafToPathIndices,
      group2.id
    );

    console.log(`[prop ${id}] - finalizing!`);
    await finalizeProp(prop.id);

    // TODO: remove!
    break;
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

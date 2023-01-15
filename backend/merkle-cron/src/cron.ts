import {
  executeQuery,
  buildPropsQuery,
  buildDelegatesQuery,
  buildOwnersQuery,
} from "./graphql";

import {
  getLastFinalizedProp,
  createGroupTypes,
  createProp,
  createGroup,
  finalizeProp,
  createLeaves,
  disconnectDb,
  writeTree,
} from "./db";

import { buildTreePoseidon } from "./merklePoseidon";

// NOTE: idempotent
async function run() {
  await createGroupTypes();

  const lastProp = await getLastFinalizedProp();
  console.log(`Last finalized prop: ${lastProp}`);

  let allProps = (await executeQuery(buildPropsQuery()))["proposals"];
  console.log(`Retrieved ${allProps.length} proposals`);

  let newProps = allProps.filter((p) => Number(p.id) > lastProp);
  console.log(`Found ${newProps.length} new proposals`);

  for (const { id, createdBlock } of newProps) {
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

    console.log(`[prop ${id}] - creating prop in db`);
    const prop = await createProp(parseInt(id));

    // 1-noun group
    let tree1 = await buildTreePoseidon(anonSet1);
    await writeTree(tree1, prop.id, 1);

    // 2-noun group
    let anonSet2 = Array.from(
      new Set([
        ...delegates.filter((d) => d.delegatedVotes >= 2).map((d) => d.id),
        ...owners.filter((d) => d.tokenBalance >= 2).map((d) => d.id),
      ])
    );
    let tree2 = await buildTreePoseidon(anonSet2);
    await writeTree(tree2, prop.id, 2);

    console.log(`[prop ${id}] - finalizing!`);
    await finalizeProp(prop.id);
  }
}

run()
  .then(async () => {
    await disconnectDb();
  })
  .catch(async (e) => {
    console.error(e);
    await disconnectDb();
    process.exit(1);
  });

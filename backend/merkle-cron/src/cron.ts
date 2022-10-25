import {
  executeQuery,
  buildPropsQuery,
  buildDelegatesQuery,
  buildOwnersQuery,
} from "./queries";

import { buildTreePoseidon } from "./merklePoseidon";

// TODO: retrieved from db
let latestProp = 0;

// NOTE: idempotent
async function run() {
  let props = (await executeQuery(buildPropsQuery(latestProp)))["proposals"];
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

    // TODO: act on DB!
  }
}

run();

// not excellent naming, but a small service that responds to contract events and merkleizes accordingly

import { curNounsQuery, executeQuery } from "./graphql";

import { buildTreePoseidon } from "./merklePoseidon";

import { cleanLeaves, createProp, writeTree } from "./db";

import "dotenv/config";

import * as nerman from "nerman";
import AsyncLock from "async-lock";

const Nouns = new nerman.Nouns(process.env.JSON_RPC_API_URL);

async function getCurrentNounerMap() {
  const results = await executeQuery(curNounsQuery);
  const ownerObjs = results["nouns"].map((i) => i["owner"]);

  const nounerMap = {};
  for (const ownerObj of ownerObjs) {
    const ownerAddr = ownerObj["id"];
    const delegateAddr = ownerObj["delegate"]["id"];

    nounerMap[ownerAddr] =
      ownerAddr in nounerMap ? nounerMap[ownerAddr] + 1 : 1;

    if (delegateAddr != ownerAddr) {
      nounerMap[delegateAddr] =
        delegateAddr in nounerMap ? nounerMap[delegateAddr] + 1 : 1;
    }
  }

  return nounerMap;
}

async function getCurTrees() {
  const nounerMap = await getCurrentNounerMap();

  const anonSet1 = Array.from(new Set(Object.keys(nounerMap)));
  const tree1 = await buildTreePoseidon(anonSet1);
  console.log(anonSet1.length);

  const anonSet2 = Array.from(
    Object.entries(nounerMap)
      .filter((e) => e[1] >= 2)
      .map((e) => e[0])
  );
  const tree2 = await buildTreePoseidon(anonSet2);
  console.log(anonSet2.length);

  return [tree1, tree2];
}

async function getAndWriteCurTrees() {
  AsyncLock.acquire(
    "rewrite-cur-nouner-trees",
    async () => {
      const prop = await createProp(-1);
      const [tree1, tree2] = await getCurTrees();

      // deletes all existing leaves for the prop!
      await cleanLeaves(prop.id);

      await writeTree(tree1, prop.id, 1);
      await writeTree(tree2, prop.id, 2);
    },
    function (err, ret) {
      console.log(`Error acquiring lock: ${err}`);
    }
  );
}

Nouns.on("Transfer", async (data: nerman.EventData.Transfer) => {
  console.log(
    "NounsToken | Transfer | from:" +
      data.from.id +
      ", to: " +
      data.to.id +
      ", tokenId: " +
      data.tokenId
  );

  await getAndWriteCurTrees();
});

Nouns.on("DelegateChanged", async (data: nerman.EventData.DelegateChanged) => {
  console.log(
    "NounsToken | DelegateChanged | delegator:" +
      data.delegator.id +
      ", fromDelegate: " +
      data.fromDelegate.id +
      ", toDelegate: " +
      data.toDelegate.id
  );

  await getAndWriteCurTrees();
});

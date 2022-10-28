import { buildPoseidon } from "circomlibjs";

let poseidon: any;
let F: any;

//leafAddr: list of all addresses of NFT holders (should be unique) in hex
//currReaderAdd: addr of reader we are producing a proof for that they are an NFT holder
export async function createMerkleTree(
  currentAddr: string,
  leafAddrs: string[]
) {
  const sanitizedCurrent = currentAddr.toLocaleLowerCase();
  const currentBigInt = BigInt(sanitizedCurrent).toString();
  const sanitizedLeaves = leafAddrs.map((el) => el.toLocaleLowerCase());

  console.log("COMPARE: ", currentBigInt);

  poseidon = await buildPoseidon();
  F = poseidon.F;

  const tree = buildTreePoseidon(sanitizedLeaves);

  return {
    pathRoot: tree.root,
    pathElements: tree.leafToPathElements[currentBigInt],
    pathIndices: tree.leafToPathIndices[currentBigInt],
  };
}

function buildTreePoseidon(
  leaves: any[],
  depth = 15,
  proof_depth = 30,
  nullNode = 1n
) {
  if (!poseidon) {
    throw new Error("bad");
  }

  // pad with nullNode to guarantee a tree of the desired depth
  const requiredLeaves = 2 ** depth;
  if (leaves.length < requiredLeaves) {
    leaves = leaves.concat(
      Array(requiredLeaves - leaves.length).fill(nullNode)
    );
  }

  leaves = leaves.map((el) => BigInt(el));
  leaves.sort();

  // the equivalent of pathElements and pathIndices in merkle.circom
  const outputLeaves = leaves.filter((w) => w !== nullNode);
  let leafToPathElements = Object.fromEntries(outputLeaves.map((w) => [w, []]));
  let leafToPathIndices = Object.fromEntries(outputLeaves.map((w) => [w, []]));

  let nodeToLeaves = Object.fromEntries(leaves.map((w) => [w, [w]]));
  let curLevel = leaves;
  while (curLevel.length > 1) {
    let newLevel = [];

    for (let i = 0; i < curLevel.length; i += 2) {
      let child1 = curLevel[i];
      let child2 = i == curLevel.length - 1 ? nullNode : curLevel[i + 1];

      let child1Leaves = nodeToLeaves[child1];
      let child2Leaves = child2 == nullNode ? [] : nodeToLeaves[child2];

      for (const leaf of child1Leaves) {
        if (leaf !== nullNode) {
          leafToPathElements[leaf].push(child2);
          leafToPathIndices[leaf].push("0");
        }
      }

      for (const leaf of child2Leaves) {
        if (leaf !== nullNode) {
          leafToPathElements[leaf].push(child1);
          leafToPathIndices[leaf].push("1");
        }
      }

      let poseidonRes = poseidon([child1, child2]);
      let parent = F.toObject(poseidonRes);

      nodeToLeaves[parent] = child1Leaves.concat(child2Leaves);

      newLevel.push(parent);
    }

    curLevel = newLevel;
  }

  for (const leaf in leafToPathElements) {
    while (leafToPathElements[leaf].length < proof_depth) {
      leafToPathElements[leaf].push(nullNode);
      leafToPathIndices[leaf].push("0");
    }
  }

  return {
    root: curLevel[0],
    leafToPathElements,
    leafToPathIndices,
  };
}

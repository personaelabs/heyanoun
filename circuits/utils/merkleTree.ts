import { buildPoseidon } from "circomlibjs";
import { MerkleTree } from "fixed-merkle-tree";

//leafAddr: list of all addresses of NFT holders (should be unique) in hex
//currReaderAdd: addr of reader we are producing a proof for that they are an NFT holder
export async function createMerkleTree(
  currReaderAddr: string,
  leafAddrs: string[]
) {
  const poseidon = await buildPoseidon();

  //Yes the @ts-ignores are not ideal but unfortunately they're necessary because
  //the type definitions do not support bigints
  //@ts-ignore
  const tree = new MerkleTree(
    30,
    //@ts-ignore
    leafAddrs.map((el) => BigInt(el)),
    { hashFunction: poseidon }
  );

  //@ts-ignore
  const path = tree.proof(BigInt(currReaderAddr));
  return path;
}

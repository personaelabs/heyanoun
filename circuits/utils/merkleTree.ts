import { buildPoseidon } from "circomlibjs";
import { Element, MerkleTree } from "fixed-merkle-tree";

let poseidon: any;
let F: any;

//leafAddr: list of all addresses of NFT holders (should be unique) in hex
//currReaderAdd: addr of reader we are producing a proof for that they are an NFT holder
export async function createMerkleTree(
  currReaderAddr: string,
  leafAddrs: string[]
) {
  poseidon = await buildPoseidon();
  F = poseidon.F;

  //Yes the @ts-ignores are not ideal but unfortunately they're necessary because
  //the type definitions do not support bigints
  //@ts-ignore
  const tree = new MerkleTree(
    30,
    //@ts-ignore
    leafAddrs.map((el) => BigInt(el)),
    { hashFunction: poseidonTreeHash }
  );

  //@ts-ignore
  const path = tree.proof(BigInt(currReaderAddr));
  return path;
}

export const poseidonTreeHash = (left: Element, right: Element) => {
  if (!poseidon || !F) {
    throw new Error("Poseidon and F should be defined");
  }
  return F.toObject(poseidon[(left.toString(), right.toString())]);
};

import BN from "bn.js";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { PointPreComputes } from "../../types/zk";
import { SECP256K1_N } from "../../utils/config";
import {
  getSigPublicSignals,
  getPointPreComputes,
  PublicSignatureData,
} from "../../utils/wasmPrecompute";

import { prisma } from "../../utils/prisma";

const elliptic = require("elliptic");
const snarkjs = require("snarkjs");

const ec = new elliptic.ec("secp256k1");

export async function verifyProof(
  publicSignals: string[],
  proof: any,
  vkey: string
) {
  const proofVerified = await snarkjs.groth16.verify(
    JSON.parse(vkey),
    publicSignals,
    proof
  );

  return proofVerified;
}

// TODO: unit test?
async function verifySignature(
  publicSignals: string[],
  { r, isRYOdd, msgHash }: PublicSignatureData
): Promise<boolean> {
  const { TPreComputes, U } = await getSigPublicSignals({
    r,
    isRYOdd,
    msgHash,
  });

  // TODO: compare epxected with TPreComputes in publicSignals (need to deserialize from strings)
  // TODO: compare expectedU with U in publicSignals (need to deserialize from strings)

  return false;
}

function verifyGroupMatchesRoot(
  publicSignals: string[],
  groupId: number
): boolean {
  // TODO: get root from publicSignals, match with group in db
  return false;
}

export default async function submit(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let body = req.body;
  if (typeof req.body === "string") {
    body = JSON.parse(body);
  }
  console.log(`Received request: ${JSON.stringify(body)}`);

  const proof = body.proof;
  const publicSignals: string[] = body.publicSignals;
  const publicSignatureData: PublicSignatureData = body.publicSignatureData;

  // console.log("public signals:");
  // console.log(publicSignals);

  // // TODO: vkey should be static/local
  // const vkey = "";

  // NOTE: this should be propId + groupType in the future
  // const groupId: number = body.groupId; // NOTE: may also be stored w/publicSignals in future
  // const group = await prisma.group.findUnique({
  //   where: { id: groupId },
  // });
  // if (!group) {
  //   res.status(404).send("group not found!");
  //   return;
  // }

  // if (!verifyGroupMatchesRoot(publicSignals, groupId)) {
  //   res.status(400).send("merkle root does not match group specified!");
  //   return;
  // }

  // TODO: put this back in
  // if (!verifySignature(publicSignals, publicSignatureData)) {
  //   res.status(400).send("signature artifact verification failed!");
  //   return;
  // }

  // if (!verifyProof(publicSignals, proof, vkey)) {
  //   res.status(400).send("proof verification failed!");
  //   return;
  // }

  // TODO: handle posting
  // 1. post in db
  // 2. twitter (and other consumers) pass along

  // TODO: potentially link tweet URL, ipfs hash, etc. in json
  res.status(200).json({ success: true });
}

import BN from "bn.js";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { PointPreComputes } from "../../types/zk";
import { SECP256K1_N } from "../../utils/config";
import { getPointPreComputes } from "../../utils/wasmPrecompute";

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

// NOTE: this code is duplicated with that in generateProof.tsx and should be extracted out
async function verifySignatureArtifacts(
  publicSignals: string[],
  r: string,
  isRYOdd: boolean,
  msg: string
): Promise<boolean> {
  const rPoint = ec.keyFromPublic(
    ec.curve.pointFromX(new BN(r.substring(2), 16), isRYOdd).encode("hex"),
    "hex"
  );

  // Get the group element: -(m * r^−1 * G)
  const rInv = new BN(r.substring(2), 16).invm(SECP256K1_N);

  // w = -(r^-1 * msg)
  const w = rInv
    .mul(new BN(ethers.utils.hashMessage(msg).substring(2), 16))
    .neg()
    .umod(SECP256K1_N);

  // U = -(w * G) = -(r^-1 * msg * G)
  const U = ec.curve.g.mul(w);

  // T = r^-1 * R
  const T = rPoint.getPublic().mul(rInv);

  const TPreComputes = await getPointPreComputes(T.encode("hex"));

  // TODO: compare epxected with TPreComputes in publicSignals (need to deserialize from strings)

  // TODO: compare expectedU with U in publicSignals (need to deserialize from strings)
  // U: [splitToRegisters(U.x) as bigint[], splitToRegisters(U.y) as bigint[]];

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

  // TODO: vkey should be static/local
  const vkey = {};

  const r = body.r;
  const isRYOdd = body.isRYOdd;
  const msg = body.msg;

  const groupId: number = body.groupId; // NOTE: may also be stored w/publicSignals in future
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    res.status(404).send("group not found!");
    return;
  }

  if (!verifyGroupMatchesRoot(publicSignals, groupId)) {
    res.status(400).send("merkle root does not match group specified!");
    return;
  }

  if (!verifySignatureArtifacts(publicSignals, r, isRYOdd, msg)) {
    res.status(400).send("signature artifact verification failed!");
    return;
  }

  if (!verifyProof(publicSignals, proof, vkey)) {
    res.status(400).send("proof verification failed!");
    return;
  }
  // TODO: handle posting
  // 1. post in db
  // 2. twitter (and other consumers) pass along

  // TODO: potentially link tweet URL, ipfs hash, etc. in json
  res.status(200).json({ success: true });
}

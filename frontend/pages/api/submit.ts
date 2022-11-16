import BN from "bn.js";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { PointPreComputes } from "../../types/zk";
import { SECP256K1_N } from "../../utils/config";
import { getPointPreComputes } from "../../utils/wasmPrecompute";

import { prisma } from "../../utils/prisma";

const elliptic = require("elliptic");

// NOTE: from generateProof.ts
interface SignaturePostProcessingContents {
  TPreComputes: PointPreComputes;
  // s: bigint[]; (private signal)
  U: bigint[][];
}

const ec = new elliptic.ec("secp256k1");

// NOTE: this code is duplicated with that in generateProof.tsx and should be extracted out
async function verifySignatureArtifacts(
  r: string,
  isRYOdd: boolean,
  msg: string,
  TPreComputes: PointPreComputes,
  U: bigint[][]
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
  const expectedU = ec.curve.g.mul(w);

  // T = r^-1 * R
  const T = rPoint.getPublic().mul(rInv);

  const expectedPreComputes = await getPointPreComputes(T.encode("hex"));

  // TODO: compare epxected with TPreComputes

  // TODO: compare expectedU with U
  // U: [splitToRegisters(U.x) as bigint[], splitToRegisters(U.y) as bigint[]];

  return false;
}

function verifyGroupMatchesRoot(
  publicSignals: string[],
  groupId: number
): boolean {
  // TODO: get root from publicSignals
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

  const r = body.r;
  const isRYOdd = body.isRYOdd;
  const msg = body.msg;

  // TODO: how to extract these properly?
  const TPreComputes = body.TPreComputes;
  const U = body.U;

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

  if (
    !verifySignatureArtifacts(
      r,
      isRYOdd,
      msg,
      TPreComputes as PointPreComputes,
      U as bigint[][]
    )
  ) {
    res.status(400).send("signature artifact verification failed!");
    return;
  }

  // TODO: handle posting
  // 1. post in db
  // 2. twitter (and other consumer) pass along

  // TODO: potentially link tweet URL, ipfs hash, etc. in json
  res.status(200).json({ success: true });
}

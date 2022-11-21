import BN from "bn.js";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { PointPreComputes } from "../../types/zk";
import { SECP256K1_N } from "../../utils/config";
import {
  getSigPublicSignals,
  getPointPreComputes
} from "../../utils/wasmPrecompute/wasmPrecompute.nodejs";
import { PublicSignatureData } from "../../utils/wasmPrecompute/wasmPrecompute.common";

import { prisma } from "../../utils/prisma";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";

import vkey from "../../utils/verification_key.json";

const elliptic = require("elliptic");
const snarkjs = require("snarkjs");

const ec = new elliptic.ec("secp256k1");

export async function verifyProof(
  publicSignals: any,
  proof: any,
  vkeyJson: any
) {
  const proofVerified = await snarkjs.groth16.verify(
    vkey,
    publicSignals,
    proof
  );

  return proofVerified;
}

async function verifyRoot(
  root: string,
  propId: string,
  groupType: string
): Promise<boolean> {
  const group = await prisma.group.findFirst({
    where: {
      propId: Number(propId),
      typeId: Number(groupType)
    }
  });

  return group !== null && group.root === root;
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

  const root = body.root;
  const proof = body.proof;
  const publicSignatureData: PublicSignatureData = body.publicSignatureData;

  console.log("Proof: ", proof);
  console.log("Public signature data ", publicSignatureData);
  console.log("Root: ", root); // int

  // if (
  //   !(await verifyRoot(
  //     root,
  //     publicSignatureData.eip712Value.propId,
  //     publicSignatureData.eip712Value.groupType
  //   ))
  // ) {
  //   res.status(400).send("merkle root does not match group specified!");
  //   return;
  // }

  const { TPreComputes, U } = await getSigPublicSignals(
    publicSignatureData,
    false
  );

  console.log("check it: ", TPreComputes);
  const verifiedProof = await verifyProof(
    {
      TPreComputes,
      U,
      root,
      propId: publicSignatureData.eip712Value.propId,
      groupType: publicSignatureData.eip712Value.groupType,
    },
    proof,
    vkey
  );
  if (!verifiedProof) {
    res.status(400).send("proof is not valid!");
  } else {
  }
  // steps:
  // - verify root matches groupType + propId - DONE
  // - compute TPreComputes and U (sig) - DONE
  // - get vkey
  // - verify proof + public signals (also effectively verifies sig!)
  // - add to db
  // - post to twitter

  // TODO: potentially link tweet URL, ipfs hash, etc. in json
  res.status(200).json({ success: true });
}

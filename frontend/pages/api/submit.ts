import type { NextApiRequest, NextApiResponse } from "next";
import { getSigPublicSignals } from "../../utils/wasmPrecompute/wasmPrecompute.nodejs";
import { PublicSignatureData } from "../../utils/wasmPrecompute/wasmPrecompute.common";

import { prisma } from "../../utils/prisma";

import vkey from "../../utils/verification_key.json";
import _ from "lodash";

const elliptic = require("elliptic");
const snarkjs = require("snarkjs");

const ec = new elliptic.ec("secp256k1");

export async function verifyProof(publicSignals: any, proof: any) {
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
      typeId: Number(groupType),
    },
  });

  return group !== null && group.root === root;
}

export default async function submit(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
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

    if (
      !(await verifyRoot(
        root,
        publicSignatureData.eip712Value.propId,
        publicSignatureData.eip712Value.groupType
      ))
    ) {
      res.status(400).send("merkle root does not match group specified!");
      return;
    }

    const { TPreComputes, U } = await getSigPublicSignals(publicSignatureData);

    const verifiedProof = await verifyProof(
      [
        root,
        publicSignatureData.eip712Value.propId,
        publicSignatureData.eip712Value.groupType,
        ..._.flattenDeep(TPreComputes).map((el: any) => el.toString()),
        ..._.flattenDeep(U).map((el: any) => el.toString()),
      ],
      proof
    );

    if (!verifiedProof) {
      res.status(400).send("proof is not valid!");
    } else {
      res.status(200).json({ success: true });
    }
  } catch (ex: unknown) {
    res.status(400).send("something went wrong!");
  }
}
// steps:
// - verify root matches groupType + propId - DONE
// - compute TPreComputes and U (sig) - DONE
// - get vkey - DONE
// - verify proof + public signals (also effectively verifies sig!) - DONE
// - add to db / ipfs - TODO
// - post to twitter - TODO

// TODO: potentially link tweet URL, ipfs hash, etc. in json

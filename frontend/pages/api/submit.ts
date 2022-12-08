import type { NextApiRequest, NextApiResponse } from "next";
import { getSigPublicSignals } from "../../utils/wasmPrecompute/wasmPrecompute.nodejs";
import { PublicSignatureData } from "../../utils/wasmPrecompute/wasmPrecompute.common";
import { postScreenshot } from "../../utils/post-screenshot";

import { prisma } from "../../utils/prisma";

import vkey from "../../utils/verification_key.json";
import _ from "lodash";
import { HOST, postToIpfs } from "../../utils/ipfs";
import { JSONStringifyCustom } from "../../utils/utils";
import { NounSet } from "../../components/anonPill";

const snarkjs = require("snarkjs");

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
    const commentMsg = body.commentMsg;
    const publicSignatureData: PublicSignatureData = body.publicSignatureData;

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
      const cid = await postToIpfs(
        JSONStringifyCustom({
          proof,
          commentMsg,
          propId: publicSignatureData.eip712Value.propId,
          groupType: publicSignatureData.eip712Value.groupType,
          TPreComputes,
          U,
        })
      );

      const proofIPFS = `https://${HOST}/ipfs/${cid}`;
      const propId = Number(publicSignatureData.eip712Value.propId);
      const newComment = await prisma.comment.create({
        data: {
          prop: {
            connect: {
              num: propId,
            },
          },
          group: {
            connect: {
              id: Number(publicSignatureData.eip712Value.groupType),
            },
          },
          commentMsg,
          ipfsProof: proofIPFS,
        },
      });

      const nounSet = Number(
        publicSignatureData.eip712Value.groupType
      ) as NounSet;
      await postScreenshot({ text: commentMsg, nounSet }, proofIPFS, propId);
      res.status(200).json(newComment);
    }
  } catch (ex: unknown) {
    console.error(ex);
    res.status(400).send("something went wrong!");
  }
}

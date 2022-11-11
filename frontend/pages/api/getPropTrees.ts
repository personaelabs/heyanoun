import { NextApiRequest, NextApiResponse } from "next/types";
import { ErrorResponse, PropTreesPayload } from "../../types/api";
import { createMerkleTree } from "../../utils/merkleTree";
import {
  buildNoundersGroupWithType,
  nounderAddresses,
  noundersGroupId,
} from "../../utils/nounders";
import { prisma } from "../../utils/prisma";

function leafDataToAddress(data: string): string {
  return "0x" + BigInt(data).toString(16).padStart(40, "0");
}

// NOTE: could do this transformation in the table, but given that join queries only take ~1-2s rn,
// seems ok to avoid extra complexity
async function groupsToResponsePayload(
  groups: any[],
  propId: number
): Promise<PropTreesPayload> {
  let responsePayload: PropTreesPayload = {
    groups: [],
    trees: {},
  };

  for (const group of groups) {
    const groupId = Number(group.id);
    responsePayload.groups.push({
      groupId: groupId,
      propId: Number(group.propId),
      type: group.type.name,
    });

    for (const leaf of group.leaves) {
      const address = leafDataToAddress(leaf.data);
      if (responsePayload.trees[address] === undefined) {
        responsePayload.trees[address] = {};
      }

      responsePayload.trees[address][groupId] = {
        pathIndices: leaf.indices,
        pathElements: leaf.path,
      };
    }
  }

  // NOTE: add nounders group
  responsePayload.groups.push(buildNoundersGroupWithType(propId));

  for (const address of nounderAddresses) {
    const { pathElements, pathIndices } = await createMerkleTree(
      address,
      nounderAddresses
    );

    responsePayload.trees[address][noundersGroupId] = {
      pathElements,
      pathIndices,
    };
  }

  return responsePayload;
}

// NOTE: we *could* just get the groups for the user's address, but this would result
// in our backend knowing which address is generating the subsequent proof, which
// is a much worse user trust assumption
export default async function getPropTrees(
  _req: NextApiRequest,
  res: NextApiResponse<PropTreesPayload | ErrorResponse>
) {
  const propId = Number(_req.query.propId);
  try {
    console.log("starting query");
    let start = new Date().getTime();
    const groups = await prisma.group.findMany({
      where: {
        propId,
      },
      include: {
        leaves: true,
        type: true,
      },
    });
    console.log(`query took ${new Date().getTime() - start}ms`);

    res.status(200).json(await groupsToResponsePayload(groups, propId));
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ err: "Unexpected error occurred" });
  }
}

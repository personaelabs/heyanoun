import { NextApiRequest, NextApiResponse } from "next/types";
import { ErrorResponse, PropTreesPayload } from "../../types/api";
import { prisma } from "../../utils/prisma";

function leafDataToAddress(data: string): string {
  return BigInt(data).toString(16).padStart(40, "0");
}

// NOTE: could do this transformation in the table, but given that join queries only take ~1-2s rn,
// seems ok to avoid extra complexity
function groupsToResponsePayload(groups: any[]): PropTreesPayload {
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

  return responsePayload;
}

// NOTE: we *could* just get the groups for the user's address, but this would result
// in our backend knowing which address is generating the subsequent proof, which
// is a much worse user trust assumption
export default async function getPropTrees(
  _req: NextApiRequest,
  res: NextApiResponse<PropTreesPayload | ErrorResponse>
) {
  try {
    console.log("starting query");
    let start = new Date().getTime();
    const groups = await prisma.group.findMany({
      where: {
        propId: Number(_req.query["propId"]),
      },
      include: {
        leaves: true,
        type: true,
      },
    });
    console.log(`query took ${new Date().getTime() - start}ms`);

    res.status(200).json(groupsToResponsePayload(groups));
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ err: "Unexpected error occurred" });
  }
}

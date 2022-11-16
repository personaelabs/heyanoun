import { NextApiRequest, NextApiResponse } from "next/types";
import { ErrorResponse, PropGroupPayload } from "../../types/api";
import { prisma } from "../../utils/prisma";

function leafDataToAddress(data: string): string {
  return "0x" + BigInt(data).toString(16).padStart(40, "0");
}

export default async function getPropGroup(
  req: NextApiRequest,
  res: NextApiResponse<PropGroupPayload | ErrorResponse>
) {
  try {
    const userAddr = `${req.query.userAddr}`;
    const propId = `${req.query.propId}`;
    const groupId = `${req.query.groupId}`;
    if (!propId || !groupId) {
      res.status(404).json({ err: "Missing prop ID or group ID" });
    } else {
      const prop = await prisma.group.findFirst({
        where: {
          typeId: parseInt(groupId),
          propId: parseInt(propId),
        },
        select: {
          leaves: true,
          root: true,
        },
      });
      if (!prop) {
        res
          .status(404)
          .json({ err: `Could not fetch prop with id: ${propId}` });
      } else {
        const leafData = prop.leaves.find(
          (el) =>
            leafDataToAddress(el.data).toLowerCase() === userAddr.toLowerCase()
        );
        if (!leafData) {
          res.status(404).json({
            err: `Address ${userAddr} does not exist in group ${groupId} and prop ${propId}`,
          });
        } else {
          res.status(200).json({
            root: prop.root,
            pathElements: leafData.path,
            pathIndices: leafData.indices,
          });
        }
      }
    }
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ err: "Unexpected error occurred" });
  }
}
